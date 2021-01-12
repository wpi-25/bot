import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { URL } from "url";
import { TriggeredCommand } from "../../Types";

module.exports = <TriggeredCommand>{
    trigger: /(?:https:\/\/)?(?:m.|vm.|www.)?tiktok.com\/[^ \n?]+\??/,
    async execute(message, args:RegExpMatchArray, client) {
        if (message.embeds.length > 0) return;  // In an ideal world, this wouldn't be necessary, but TikTok embeds in Discord aren't very reliable, so check it there's one first
        message.channel.startTyping();  // Show that it's doing something
        let url = args[0];
        let response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36' // This is needed to tell tiktok to redirect us again for mobile links
            }
        });
        let page = new URL(response.url);
        let cleanURL = page.href.substr(0, page.search!=""?page.href.indexOf(page.search):undefined);   // It's nasty but it works
        console.log(args[0], cleanURL);

        let apiResponse = await fetch(`https://www.tiktok.com/oembed?url=${cleanURL}`);
        if (apiResponse.ok) {
            let data = await apiResponse.json();
            message.channel.stopTyping();
            if ('status_msg' in data) { // If something went wrong, the api returns a status_msg property
                throw '```json\n' + JSON.stringify(data) + '\n```';
            }

            let embed = new MessageEmbed()
                .setAuthor(data.author_name, '', data.author_url)   // Until I decide to do more processing on the page, we won't have a profile picture for the user
                .setTitle(data.title)
                .setImage(data.thumbnail_url)   // Until we can get a clean URL, we'll just send the cover image
                .setURL(cleanURL)
                .setColor(Math.round(Math.random()) ? '#69C9D0' : '#EE1D52');
            message.channel.send(embed);
            console.log(data);
        } else {
            message.channel.stopTyping();
            throw await apiResponse.text();
        }
    }
}