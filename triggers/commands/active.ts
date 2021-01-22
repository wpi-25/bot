import { GuildMember, Message, MessageEmbed, MessageMentions } from "discord.js";
import { client } from "../..";
import { Command } from "../../Types";
import { getUsage } from "../../util/commands";
import { get, getUserEnabled, set } from "../../util/levels";
import { getIDFromMention } from "../../util/text";

module.exports = <Command> {
    name: 'active',
    args: '[status [user]| toggle]',
    description: 'Set or view your preference for the @active role...',
    guildOnly: true,
    minArgs: 0,
    async execute(message, args) {
        switch (args[0]) {
            case 'status':
            case undefined:
                // Query the user's status
                let userMatch = message.content.match(MessageMentions.USERS_PATTERN);
                let member = message.member;
                if (userMatch) {
                    member = message.guild.members.cache.get(getIDFromMention(userMatch[0]));
                }
                let enabled = await getUserEnabled(member);
                sendStatus(message, member, enabled);
                break;
            
            case 'toggle':
                let enabledStatus = !(await getUserEnabled(message.author));
                await set(`${message.author.id}:enabled`, enabledStatus);
                sendStatus(message, message.member, enabledStatus);
                break;
            
            default:
                // Throw usage
                message.reply(`You must use the command like: \`${getUsage(module.exports)}\``);
        }
    }
}

function sendStatus(message:Message, member:GuildMember, enabled:boolean) {
    message.channel.send(new MessageEmbed()
        .setAuthor(member.nickname, member.user.displayAvatarURL())
        .setColor(enabled ? '#4caf50' : '#f44336')
        .setDescription(`${member}, you **will${enabled?'':' not'}** be included in \`@active\` pings`)
    );
}