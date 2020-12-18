import { TextChannel } from 'discord.js';
import { Command } from '../../Types';
import { getIDFromTag } from '../../util/text';


module.exports = <Command>{
    name: 'sendmsg',
    description: 'Send a message to a specific channel',
    args: '<channel id> <message>',
    requiredPerms: 'admin',
    guildOnly: true,
    async execute(message, args, client) {
        if (args.length < 2 || !(args[0].match(/<#\d{17,}>/))) {throw 'Use args: ' + this.args;}
        let channelID = getIDFromTag(args[0]);
        let channel = <TextChannel>client.channels.cache.get(channelID);
        channel.send(message.content.substr(message.content.indexOf(args[1])));
        message.react('✅');
    }
}