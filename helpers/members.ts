import { GuildMember, PartialGuildMember, VoiceChannel } from "discord.js";
import { client, config } from "..";

export function readyMembers() {
    updateMembers();
}

const updateMembers = (member?:GuildMember|PartialGuildMember) => {
    if (!member || member.guild.id == config.memberCountGuild.guild) {
        let guild = client.guilds.cache.get(config.memberCountGuild.guild);
        let channel = <VoiceChannel>client.channels.cache.get(config.memberCountGuild.channel);
        channel.setName(`${guild.memberCount} Members`);
    }
}

export function setupMemberListeners() {
    client.on('guildMemberAdd', member => { console.log(`${member.displayName} joined`); updateMembers(member);});
    client.on('guildMemberRemove', member => {console.log(`${member.displayName} left`); updateMembers(member);});
}