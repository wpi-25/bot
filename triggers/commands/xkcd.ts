import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { Command } from '../../Types';

import fetch from 'node-fetch';

module.exports = <Command>{
    name: 'xkcd',
    description: 'Gets an XKCD comic',
    args: "[xkcd comic number or 'rand']",
    minArgs: 0,
    guildOnly: false,
    requiredPerms: 'public',
    async execute(message, args) {
        let url = 'https://xkcd.com/';

        if (args.length != 1) {
            url += 'info.0.json';
        } else if (isNaN(parseInt(args[0])) && args[0].includes('rand')) {
            const maxnum: number = (
                await (await fetch(`${url}info.0.json`)).json()
            ).num;
            const num = Math.floor(Math.random() * maxnum) + 1;
            url += `${num}/info.0.json`;
        } else {
            url += `${args[0]}/info.0.json`;
        }

        const serverResponse = await fetch(url);
        if (!serverResponse.ok) {
            throw 'Comic not found!';
        }
        const response = await serverResponse.json();

        const embedFields = new Array<EmbedFieldData>();

        embedFields.push({
            name: 'Link',
            value: `https://xkcd.com/${response.num}`,
        });

        const embed = new MessageEmbed()
            .setTitle(`${response.safe_title}`)
            .setFooter(`${response.alt}`)
            .setColor('#96A8C8')
            .setImage(response.img)
            .addFields(embedFields);

        message.channel.send({ embeds: [embed] });
    },
};
