import { MessageEmbed, TextChannel } from 'discord.js';
import { TriggeredCommand } from '../../Types';
import { config, client } from '../../index';

module.exports = <TriggeredCommand>{
    trigger: (message) => {
        return !message.guild;
    },
    async execute(message) {
        console.log('modMail' in config);
        if ('modMail' in config) {
            const channel = <TextChannel>(
                await client.channels.fetch(config.modMail)
            );
            channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(
                            message.author.tag,
                            message.author.avatarURL()
                        )
                        .setDescription(message.content)
                        .setTitle('ModMail')
                        .setTimestamp(message.createdTimestamp)
                        .setFooter(`<@${message.author.id}`),
                ],
                files: [...message.attachments.values()],
            });
            console.log(
                `ModMail from ${message.author.tag}: ${
                    message.content
                }\n${message.attachments.toJSON()}`
            );
        }
    },
};
