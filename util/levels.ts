import { Collection, Snowflake, Role, GuildMember } from 'discord.js';
import { createClient, RedisClient } from 'redis';
import { promisify } from 'util';
import { client, config } from '..';
import { LevelData } from '../Types';
import { coerceBool, ensureSingleInstance } from './math';

export let redisClient: RedisClient;
export let get: (key: string) => Promise<string>,
    set: (key: string, value: string) => Promise<string>;
if ('levels' in config && 'db' in config.levels) {
    redisClient = createClient(config.levels.db);
    get = promisify(redisClient.get).bind(redisClient);
    set = promisify(redisClient.set).bind(redisClient);
} else {
    console.log('=== LEVELS DISABLED ===');
}

export async function getUserLevel(uid: Snowflake): Promise<LevelData> {
    const [count, xp, lastMsg] = await Promise.all([
        get(`${uid}:count`),
        get(`${uid}:exp`),
        get(`${uid}:last`),
    ]);
    const level = getLevelNumber(parseInt(xp));
    const data = {
        count: parseInt(count) || 0,
        xp: parseInt(xp) || 0,
        level,
        last: new Date(parseInt(lastMsg)),
    };
    // console.log(`${uid} >`, data);
    return data;
}

export function getLevelNumber(xp: number) {
    return xp ? Math.max(Math.floor(Math.log2(xp / 10)), 0) : 0;
}

export function getLevelCost(level: number) {
    return Math.round(10 * Math.pow(2, level));
}

export function setUserLevel(uid: Snowflake, { count, xp, last }: LevelData) {
    return Promise.all([
        set(`${uid}:count`, count.toString()),
        set(`${uid}:exp`, xp.toString()),
        set(`${uid}:last`, last.getTime().toString()),
    ]);
}

const leaderboard = new Collection<Snowflake, LevelData>();
let leaderboardUpdate = new Date(0);

export async function getLeaderboard() {
    if (
        new Date().getTime() - leaderboardUpdate.getTime() >
        config.levels?.leaderboardCooldown
    ) {
        // Update leaderboard
        for (const [uid] of client.users.cache) {
            leaderboard.set(uid, await getUserLevel(uid));
        }
        leaderboardUpdate = new Date();
    }
    return { data: leaderboard, cacheDate: leaderboardUpdate };
}

export async function getRankedLeaderboard() {
    await getLeaderboard();
    return {
        cacheDate: leaderboardUpdate,
        data: leaderboard
            .map((data, uid) => {
                return { uid, data };
            }) // Convert to {uid, data}
            .sort((a, b) => {
                // Sort by xp
                if (a.data.xp != b.data.xp) return b.data.xp - a.data.xp;
                return b.data.count - a.data.count;
            }),
    };
}

export function getLevelNumberFromRole(role: Role) {
    if (role.name.includes('Level')) {
        return parseInt(role.name.match(/[0-9]+/)[0]);
    }
    return undefined;
}

export async function getLevelRoleChanges(
    member: GuildMember,
    newLevel: number
) {
    const add = member.guild.roles.cache
        .filter(
            (role) =>
                role.name.startsWith('Level') &&
                getLevelNumberFromRole(role) <= newLevel
        )
        .sort(
            (a: Role, b: Role) =>
                getLevelNumberFromRole(a) - getLevelNumberFromRole(b)
        )
        .last();

    const remove: Role[] = [];
    for await (const snowflakeAndRole of member.roles.cache) {
        const role = snowflakeAndRole[1];
        if (role.name.startsWith('Level') && role.id != add.id) {
            remove.push(role);
        }
    }

    return { add: member.roles.cache.has(add?.id) ? undefined : add, remove };
}

export async function needsLevelRoleChanges(
    member: GuildMember,
    newLevel: number
) {
    const roleChanges = await getLevelRoleChanges(member, newLevel);
    const needsChange = coerceBool(
        roleChanges.add || roleChanges.remove.length
    );
    // console.log(roleChanges, needsChange);
    return needsChange;
}

/**
 * Update a member's level roles
 * @param member the GuildMember to update
 * @param newLevel the member's level
 * @returns whether any roles were removed
 */
export async function setLevelRoles(member: GuildMember, newLevel: number) {
    const { add: newRole, remove: oldRoles } = await getLevelRoleChanges(
        member,
        newLevel
    );

    const removedRoles = oldRoles.length ? true : false;
    for await (const role of oldRoles) {
        await member.roles.remove(role);
    }

    // console.log({
    //     newLevel,
    //     newRole: newRole?.name,
    //     oldRoles: oldRoles.map((role) => role.name),
    // });
    if (newRole) await member.roles.add(newRole);
    return coerceBool(removedRoles || newRole);
}

export let queuedLevelUpdates: Snowflake[] = [];

export async function queueLevelUpdates() {
    // const loopSpeed = 250; // The minimum time between member updates
    // /*
    //  * 4 member updates per second should
    //  * hopefully leave us with enough
    //  * rate limit wiggle room for
    //  * the rest of the bot to keep working
    //  */
    // console.log(
    //     `Queueing level updates with ${loopSpeed} ms min between members`
    // );
    // client.user.setPresence({
    //     status: 'dnd',
    //     activity: { type: 'WATCHING', name: `level updates` },
    // });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const [gid, guild] of client.guilds.cache) {
        // for awaits to keep timing predictable
        // and (hopefully) handle member changes mid-run
        // console.log(guild.name);
        // console.log(guild.members.cache.map((member) => member.displayName));

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const [uid] of guild.members.cache) {
            const member = await guild.members.fetch(uid);
            const needsChange = await needsLevelRoleChanges(
                member,
                (await getUserLevel(member.id)).level
            );

            // console.log(
            //     member.displayName,
            //     `${needsChange ? 'needs change' : 'does not need change'}`
            // );
            if (needsChange) {
                queuedLevelUpdates.push(member.id);
            }
            // const taskStartTime = new Date();
            // const hadUpdate = await setLevelRoles(
            //     member,
            //     (await getUserLevel(member.id)).level
            // );
            // const taskTimeElapsed =
            //     new Date().getTime() - taskStartTime.getTime();
            // console.log(
            //     `Updating roles for ${
            //         member.displayName
            //     } took ${taskTimeElapsed}ms (${
            //         !hadUpdate ? "didn't remove any roles" : 'removed roles'
            //     })`
            // );
            // if (taskTimeElapsed < loopSpeed) {
            //     await delay(loopSpeed - taskTimeElapsed);
            // }
        }
    }

    queuedLevelUpdates = ensureSingleInstance(queuedLevelUpdates);
    console.log(
        `Queued ${queuedLevelUpdates.length} update${
            queuedLevelUpdates.length != 1 ? 's' : ''
        }`
    );

    // client.user.setPresence({ status: 'online' });
}
