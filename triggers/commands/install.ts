import { MessageEmbed } from 'discord.js';
import { commands, triggers, reactions } from '../../helpers/modules';
import { Command, TriggeredCommand, ReactionCommand } from '../../Types';


module.exports = <Command>{
    name: 'install',
    description: 'Install a command',
    args: '<type> <filename>',
    requiredPerms: 'admin',
    async execute(message, args) {
        const type = args[0];
        const commandName = args[1];

        switch (type) {
            case 'command':
                const newCommand = <Command>require(`./${commandName}.ts`);
                commands.set(newCommand.name, newCommand);

                let commandSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(`Command \`${commandName}\` was installed!`);
                
                message.channel.send(commandSuccess);
                break;
            
            case 'trigger':
                const newTrigger = <TriggeredCommand>require(`../triggers/${commandName}.ts`);
                triggers.set(commandName, newTrigger);

                let triggerSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(`Trigger \`${commandName}\` was installed!`);
                
                message.channel.send(triggerSuccess);
                break;

            // case 'edit':
            //     const newEdit = <TriggeredCommand>require(`../edit/${commandName}.ts`);
            //     triggers.set(commandName, newEdit);

            //     let editSuccess = new MessageEmbed()
            //         .setColor('#4caf50')
            //         .setDescription(`Edit command \`${commandName}\` was installed!`);
                
            //     message.channel.send(editSuccess);
            //     break;
            
            case 'reaction':
                const newReaction = <ReactionCommand>require(`../react/${commandName}.ts`);
                reactions.set(commandName, newReaction);

                let reactionSuccess = new MessageEmbed()
                    .setColor('#4caf50')
                    .setDescription(`Reaction command \`${commandName}\` was installed!`);
                
                message.channel.send(reactionSuccess);
                break;
            
            default:
                throw this.args;
        }
        message.delete();
    }
}