import { Collection, Snowflake, SnowflakeUtil } from "discord.js";
import { createClient, RedisClient } from "redis";
import { promisify } from "util";
import { client, config } from "..";
import { LevelData } from "../Types";

export let redisClient:RedisClient;
export let get:(key:string)=>Promise<any>, set:(key:string, value:any)=>Promise<any>;
if ('levels' in config && 'db' in config.levels) {
    redisClient = createClient(config.levels.db);
    get = promisify(redisClient.get).bind(redisClient);
    set = promisify(redisClient.set).bind(redisClient);
} else {
    console.log('=== LEVELS DISABLED ===');
}

export async function getUserLevel(uid:Snowflake):Promise<LevelData> {
    let count:string, xp:string, lastMsg:string;
    [count, xp, lastMsg] = await Promise.all([
        get(`${uid}:count`),
        get(`${uid}:exp`),
        get(`${uid}:last`)
    ]);
    let level = getLevelNumber(parseInt(xp));
    let data = { count:parseInt(count)||0, xp:parseInt(xp)||0, level, last:new Date(parseInt(lastMsg)) };
    // console.log(`${uid} >`, data);
    return data;
}

export function getLevelNumber(xp:number) {
    let level = config.levels.levels.findIndex(v => v >= xp);
    level = level <= 0 ? 0 : level - 1;
    return level;
}

export function setUserLevel(uid:Snowflake, {count, xp, last}:LevelData) {
    // console.log(`${uid} <`, {count, xp, level, last});
    return Promise.all([
        set(`${uid}:count`, count),
        set(`${uid}:exp`, xp),
        set(`${uid}:last`, last.getTime())
    ]);
}

const leaderboard = new Collection<Snowflake, LevelData>();
let leaderboardUpdate = new Date(0);

export async function getLeaderboard() {
    if (new Date().getTime() - leaderboardUpdate.getTime() > config.levels?.leaderboardCooldown) {
        // Update leaderboard
        for (const [uid, user] of client.users.cache) {
            leaderboard.set(uid, await getUserLevel(uid));
        }
        leaderboardUpdate = new Date();
    }
    return {data:leaderboard, cacheDate:leaderboardUpdate};
}

export async function getRankedLeaderboard() {
    await getLeaderboard();
    return {
        cacheDate:leaderboardUpdate, 
        data:leaderboard
            .map((data, uid) => {return {uid, data}})   // Convert to {uid, data}
            .sort((a, b) => {   // Sort by xp
                if (a.data.xp != b.data.xp)
                    return b.data.xp - a.data.xp;
                return b.data.count - a.data.count;
            })
    };
}