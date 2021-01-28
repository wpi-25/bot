import { MessageEmbed } from 'discord.js';
import { commands, triggers, reactions } from '../../helpers/modules';
import { Command, TriggeredCommand, ReactionCommand } from '../../Types';
import { getCommand } from '../../util/commands';


module.exports = <Command>{
    name: 'reload',
    description: 'Reload a command or trigger',
    args: '<type> <filename>',
    requiredPerms: 'admin',
    async execute(message, args) {
        const type = args[0];
        const commandName = args[1];
        switch (type) {
            case 'command':
                const command = getCommand(commandName);
                if (!command) {
                    let fail = new MessageEmbed()
                        .setColor('#ff5722')
                        .setDescription(`There is no command with the name or alias \`${commandName}\``);
                    
                    message.channel.send(fail);
                    return;
                }
                
                delete require.cache[require.resolve(`./${command.name}.ts`)];

                const newCommand = <Command>require(`./${command.name}.ts`);
                commands.set(newCommand.name, newCommand);

                let commandSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(`Command \`${command.name}\` was reloaded!`);
                
                message.channel.send(commandSuccess);
                break;
            
            case 'trigger':
                const trigger = triggers.get(commandName);
                if (!trigger) {
                    let fail = new MessageEmbed()
                        .setColor('#ff5722')
                        .setDescription(`There is no trigger with the name or alias \`${commandName}\``);
                    
                    message.channel.send(fail);
                    return;
                }
                
                delete require.cache[require.resolve(`../triggers/${commandName}.ts`)];

                const newTrigger = <TriggeredCommand>require(`../triggers/${commandName}.ts`);
                triggers.set(commandName, newTrigger);

                let triggerSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(`Trigger \`${commandName}\` was reloaded!`);
                
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

            //     const newEdit = <TriggeredCommand>require(`../edit/${commandName}.ts`);
            //     triggers.set(commandName, newEdit);

            //     let editSuccess = new MessageEmbed()
            //         .setColor('#4caf50')
            //         .setDescription(`Edit command \`${commandName}\` was reloaded!`);
                
            //     message.channel.send(editSuccess);
            //     break;

            case 'reaction':
                const reaction = reactions.get(commandName);
                if (!reaction) {
                    let fail = new MessageEmbed()
                        .setColor('#ff5722')
                        .setDescription(`There is no reaction command with the name \`${commandName}\``);
                    
                    message.channel.send(fail);
                    return;
                }
                
                delete require.cache[require.resolve(`../react/${commandName}.ts`)];

                const newReaction = <ReactionCommand>require(`../react/${commandName}.ts`);
                reactions.set(commandName, newReaction);

                let reactionSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(`Reaction command \`${commandName}\` was reloaded!`);
                
                message.channel.send(reactionSuccess);
                break;

            default:
                throw this.args;
        }

        message.delete();
    }
}