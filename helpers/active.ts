import { Collection, GuildMember, RoleResolvable, Snowflake } from "discord.js";
import { config, client } from "..";
import { getLastUserMessageTimestamp, getLastUserReactionTimestamp, set } from "../util/levels";

export const activeConfig = config.activePing;
const memberActiveTimeouts = new Collection<Snowflake, NodeJS.Timeout>();

export function readyActive() {
    if (!activeConfig) return;

    for (const guildId in activeConfig.roles) {
        const guild = client.guilds.cache.get(guildId);
        let role = guild.roles.cache.get(activeConfig.roles[guildId]);
        const memberCollection = guild.members.cache;
        memberCollection.forEach(async member => {
            shouldHaveRole(member, role, await isMemberActive(member));
        });
    }
}

export function setupActiveListeners() {
    if (!activeConfig) return;

    client.on('message', message => memberActive(message.member));
    client.on('messageUpdate', message => memberActive(message.member));
    client.on('messageReactionAdd', (reaction, user) => {
        memberActive(reaction.message.guild.members.cache.get(user.id));
        set(`${user.id}:react`, new Date().getTime());
    });
    client.on('messageReactionRemove', (reaction, user) => {
        memberActive(reaction.message.guild.members.cache.get(user.id));
        set(`${user.id}:react`, new Date().getTime());
    });
    client.on('guildMemberAdd', memberUpdate);
    client.on('presenceUpdate', (old, presence) => memberUpdate(presence.member));
    client.on('voiceStateUpdate', state => memberUpdate(state.member));
}

export function shouldHaveRole(member:GuildMember, role:RoleResolvable, shouldHaveRole:boolean) {
    let r = typeof role == 'object' ? role : member.guild.roles.cache.get(role);
    if (shouldHaveRole) {
        if (!member.roles.cache.has(r.id)) {
            console.log(`Gave ${member.displayName} @${r.name}`);
            member.roles.add(role);
        }
    } else {
        if (member.roles.cache.has(r.id)) {
            console.log(`Removed @${r.name} from ${member.displayName}`);
            member.roles.remove(role);
        }
    }
}

async function isMemberActive(member:GuildMember) {
    let online = member.presence.status == 'online';    // If their status is online
    let lastMessageTimeDifference = new Date().getTime() -  (await getLastUserMessageTimestamp(member.id)).getTime();   // How long ago their last message was sent
    let lastReactionTimeDifference = new Date().getTime() - (await getLastUserReactionTimestamp(member.id)).getTime();  // How long ago their last reaction was
    let isInVc = member.voice.channel != undefined && !member.voice.deaf;   // If they're in VC and not deafened, we can probably assume they're active

    return isInVc || (
        online && (
            lastMessageTimeDifference < activeConfig.timeout ||
            lastReactionTimeDifference < activeConfig.timeout
        )
    );
}

async function memberUpdate(member:GuildMember) {
    if (member?.guild.id in activeConfig.roles) {
        shouldHaveRole(member, activeConfig.roles[member.guild.id], await isMemberActive(member));
    }
}

function memberActive(member:GuildMember) {
    if (member?.guild.id in activeConfig.roles) {
        shouldHaveRole(member, activeConfig.roles[member.guild.id], true);
        if (memberActiveTimeouts.has(member.id)) {
            clearTimeout(memberActiveTimeouts.get(member.id));
            memberActiveTimeouts.delete(member.id);
        }
        memberActiveTimeouts.set(member.id,
            setTimeout(async (member:GuildMember) => {
                shouldHaveRole(member, activeConfig.roles[member.guild.id], await isMemberActive(member));
            }, activeConfig.timeout, member)
        );
    }
}