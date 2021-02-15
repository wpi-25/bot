import { MessageEmbed, MessageMentions, TextChannel } from 'discord.js';
import { client } from '../..';
import { Command } from '../../Types';

module.exports = <Command>{
    name: 'clearreaction',
    description: 'Clear reactions',
    args: '<emoji/id/name> [from <channel>]',
    minArgs: 1,
    guildOnly: true,
    requiredPerms: 'admin',
    async execute(message, args) {
        const channel = <TextChannel>(
            (args.length > 1
                ? client.channels.cache.get(
                      message.content
                          .match(MessageMentions.CHANNELS_PATTERN)[0]
                          .slice(2, -1)
                  )
                : message.channel)
        );

        const messages = (await channel.messages.fetch()).filter((message) =>
            message.reactions.cache.find(
                (reaction) =>
                    reaction.emoji.id == args[0] ||
                    reaction.emoji.name == args[0]
            )
                ? true
                : false
        );

        let messageCount = 0,
            reactionCount = 0;
        messages.forEach((message) => {
            messageCount++;
            const reaction = message.reactions.cache.find(
                (reaction) =>
                    reaction.emoji.id == args[0] ||
                    reaction.emoji.name == args[0]
            );
            reactionCount += reaction.count;
            reaction.remove();
        });

        const myMessage = await message.reply({
            embed: new MessageEmbed()
                .setTitle(
                    `${reactionCount} Reaction${
                        reactionCount != 1 ? 's' : ''
                    } Deleted`
                )
                .setDescription(
                    `from ${messageCount} message${
                        messageCount != 1 ? 's' : ''
                    }`
                )
                .setColor('#4caf50'),
        });
        console.log(
            `Removed ${reactionCount} reaction${
                reactionCount != 1 ? 's' : ''
            } from ${messageCount} message${messageCount != 1 ? 's' : ''}`
        );

        if (channel.id == message.channel.id) {
            setTimeout(() => {
                myMessage.delete();
            }, 5000);
        }
    },
};
