import { MessageEmbed } from 'discord.js';
import { commands, triggers, reactions } from '../../helpers/modules';
import { Command } from '../../Types';
import { getCommand } from '../../util/commands';

module.exports = <Command>{
    name: 'uninstall',
    description: 'Uninstall a command or trigger',
    args: '<type> <filename>',
    requiredPerms: 'admin',
    async execute(message, args) {
        const type = args[0];
        const commandName = args[1];
        switch (type) {
            case 'command':
                const command = getCommand(commandName);
                if (!command) {
                    const fail = new MessageEmbed()
                        .setColor('#ff5722')
                        .setDescription(
                            `There is no command with the name or alias \`${commandName}\``
                        );

                    message.channel.send(fail);
                    return;
                }

                delete require.cache[require.resolve(`./${command.name}.ts`)];
                commands.delete(commandName);

                const commandSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(
                        `Command \`${command.name}\` was uninstalled!`
                    );

                message.channel.send(commandSuccess);
                break;

            case 'trigger':
                const trigger = triggers.get(commandName);
                if (!trigger) {
                    const fail = new MessageEmbed()
                        .setColor('#ff5722')
                        .setDescription(
                            `There is no trigger with the name or alias \`${commandName}\``
                        );

                    message.channel.send(fail);
                    return;
                }

                delete require.cache[
                    require.resolve(`../triggers/${commandName}.ts`)
                ];
                triggers.delete(commandName);

                const triggerSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(
                        `Trigger \`${commandName}\` was uninstalled!`
                    );

                message.channel.send(triggerSuccess);
                break;

            // case 'edit':
            //     const edit = triggers.get(commandName);
            //     if (!edit) {
            //         let fail = new MessageEmbed()
            //             .setColor('#ff5722')
            //             .setDescription(`There is no edit command with the name \`${commandName}\``);

            //         message.channel.send(fail);
            //         return;
            //     }

            //     delete require.cache[require.resolve(`../edit/${commandName}.ts`)];
            //     edits.delete(commandName);

            //     let editSuccess = new MessageEmbed()
            //         .setColor('#4caf50')
            //         .setDescription(`Edit command \`${commandName}\` was uninstalled!`);

            //     message.channel.send(editSuccess);
            //     break;

            case 'reaction':
                const reaction = reactions.get(commandName);
                if (!reaction) {
                    const fail = new MessageEmbed()
                        .setColor('#ff5722')
                        .setDescription(
                            `There is no reaction command with the name \`${commandName}\``
                        );

                    message.channel.send(fail);
                    return;
                }

                delete require.cache[
                    require.resolve(`../react/${commandName}.ts`)
                ];
                reactions.delete(commandName);

                const reactionSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(
                        `Reaction command \`${commandName}\` was uninstalled!`
                    );

                message.channel.send(reactionSuccess);
                break;

            default:
                throw this.args;
        }

        message.delete();
    },
};
