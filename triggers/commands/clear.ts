import { MessageEmbed, TextChannel } from 'discord.js';
import { Command } from '../../Types';


module.exports = <Command>{
    name: 'clear',
    description: 'Clear messages',
    args: '<number of messages to clear>',
    guildOnly: true,
    requiredPerms: 'admin',
    async execute(message, args) {
        if (args.length != 1 || isNaN(parseInt(args[0]))) {throw 'Use args: ' + this.args;}
        
        let numberToDelete = parseInt(args[0]);
        await (<TextChannel>message.channel).bulkDelete(numberToDelete + 1);

        let myMessage = await message.reply({
            embed: new MessageEmbed()
                .setTitle(`${numberToDelete} Message${numberToDelete!=1?'s':''} Deleted`)
                .setColor('GREEN')
        });

        setTimeout(() => {
           myMessage.delete();
        }, 5000);
    }
}