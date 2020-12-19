import { EmbedFieldData, MessageEmbed, TextChannel } from 'discord.js';
import { Command } from '../../Types';

import fetch from 'node-fetch';


module.exports = <Command>{
    name: 'xkcd',
    description: 'Gets an XKCD comic',
    args: '[xkcd comic number]',
    minArgs: 0,
    guildOnly: false,
    requiredPerms: 'public',
    async execute(message, args) {

        let url = "https://xkcd.com/"

        if (args.length != 1 || isNaN(parseInt(args[0]))) {
            url += "info.0.json"
        } else {
            url += `${args[0]}/info.0.json`
        }
        
        let response = await(await fetch(url)).json();

        let embedFields = new Array<EmbedFieldData>();

        embedFields.push({name: "Link", value: `https://xkcd.com/${response.num}`})

        const embed = new MessageEmbed()
            .setTitle(`${response.safe_title}`)
            .setFooter(`${response.alt}`)
            .setColor("#96A8C8")
            .setImage(response.img)
            .addFields(embedFields);

        message.channel.send(embed)
    }
}
