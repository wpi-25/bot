import { MessageEmbed, EmbedFieldData } from "discord.js";
import { Command } from "../../Types";
import { commands, config } from "../..";
import { hasPermission } from "../../Permissions";
import { getCommand } from "../../util/commands";


module.exports = <Command> {
    name: 'help',
    description: 'Send Help Message',
    minArgs: 0,
    async execute(message, args) {
        
        if (args.length > 0) {
            let command = getCommand(args[0]);
            if (!command) {
                message.channel.send("No matching commands found!")
                return;
            }
            const embed = new MessageEmbed()
                .setColor("#AC2B37")
                .setTitle(command.name)
                .setDescription(command.description)
                .addField("Aliases", `${command.aliases ? command.aliases : 'None'}`)
                .addField("Required Permissions", `${command.requiredPerms == 'public' ? 'None' : 'Restricted'}`)
            message.channel.send(embed)
                
        } else {
        
        let embedFields = new Array<EmbedFieldData>();
        commands.forEach(command => {
            if (hasPermission(message, command)) {
                let p = command.requiredPerms;
                let e = '';
                if (!p || p == 'public') {
                    e = '🌐';
                } else if (p == 'whitelist') {
                    e = '👥';
                } else {
                    e = '🕴️';
                }
                embedFields.push({name: `${config.prefix}${command.name} ${command.args ? command.args : ''}`, value: `${e} ${command.description}`});
            }
        });
        
        const helpEmbed = new MessageEmbed()
            .setColor('#AC2B37')
            .setTitle('Co25 Bot Help')
            .setDescription(`Honestly, I don't even know\n\nTrigger: ${config.prefix}\nCommands for ${message.author}`)
            .addFields(embedFields);
        
        message.channel.send(helpEmbed);
        }
    }
}
