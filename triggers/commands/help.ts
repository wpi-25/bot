import { MessageEmbed, EmbedFieldData } from 'discord.js';
import { Command } from '../../Types';
import { config } from '../..';
import { hasPermission } from '../../Permissions';
import { getCommand, getUsage } from '../../util/commands';
import { commands } from '../../helpers/modules';

module.exports = <Command>{
    name: 'help',
    description: 'Send Help Message',
    args: '[command name]',
    minArgs: 0,
    async execute(message, args) {
        if (args.length > 0) {
            const command = getCommand(args[0]);
            if (!command) {
                message.channel.send('No matching commands found!');
                return;
            }
            const embed = new MessageEmbed()
                .setColor('#AC2B37')
                .setTitle(command.name)
                .setDescription(command.description)
                .addField('Usage', `\`${getUsage(command)}\``)
                .addField(
                    'Aliases',
                    `${command.aliases ? command.aliases : 'None'}`
                )
                .addField(
                    'Required Permissions',
                    `${
                        command.requiredPerms == 'public'
                            ? 'None'
                            : 'Restricted'
                    }`
                );
            message.channel.send(embed);
        } else {
            const embedFields = new Array<EmbedFieldData>();
            commands.forEach((command) => {
                if (hasPermission(message, command)) {
                    const p = command.requiredPerms;
                    let e = '';
                    if (!p || p == 'public') {
                        e = '🌐';
                    } else if (p == 'whitelist') {
                        e = '👥';
                    } else {
                        e = '🕴️';
                    }
                    embedFields.push({
                        name: getUsage(command),
                        value: `${e} ${command.description}`,
                    });
                }
            });

            const helpEmbed = new MessageEmbed()
                .setColor('#AC2B37')
                .setTitle('Gompei25 Help')
                .setDescription(
                    `Honestly, I don't even know\n\nTrigger: ${config.prefix}\nCommands for ${message.author}`
                )
                .addFields(embedFields);

            message.channel.send(helpEmbed);
        }
    },
};
