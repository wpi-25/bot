import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { URL } from 'url';
import { TriggeredCommand } from '../../Types';

module.exports = <TriggeredCommand>{
    trigger: /(?:https:\/\/)?(?:m\.|vm\.|www\.)?tiktok\.com\/[^ \n?]+\??/,
    async execute(message, args: RegExpMatchArray) {
        if (message.embeds.length > 0) return; // In an ideal world, this wouldn't be necessary, but TikTok embeds in Discord aren't very reliable, so check it there's one first
        message.channel.sendTyping(); // Show that it's doing something
        const url = args[0];
        const response = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36', // This is needed to tell tiktok to redirect us again for mobile links
            },
        });
        const page = new URL(response.url);
        const cleanURL = page.href.substr(
            0,
            page.search != '' ? page.href.indexOf(page.search) : undefined
        ); // It's nasty but it works
        console.log(args[0], cleanURL);

        const apiResponse = await fetch(
            `https://www.tiktok.com/oembed?url=${cleanURL}`
        );
        if (apiResponse.ok) {
            const data = await apiResponse.json();
            if ('status_msg' in data) {
                // If something went wrong, the api returns a status_msg property
                throw '```json\n' + JSON.stringify(data) + '\n```';
            }

            const embed = new MessageEmbed()
                .setAuthor(data.author_name, '', data.author_url) // Until I decide to do more processing on the page, we won't have a profile picture for the user
                .setTitle(data.title)
                .setImage(data.thumbnail_url) // Until we can get a clean URL, we'll just send the cover image
                .setURL(cleanURL)
                .setColor(Math.round(Math.random()) ? '#69C9D0' : '#EE1D52');
            message.channel.send({ embeds: [embed] });
            console.log(data);
        } else {
            throw await apiResponse.text();
        }
    },
};
