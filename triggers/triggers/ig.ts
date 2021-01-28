import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { TriggeredCommand } from '../../Types';

module.exports = <TriggeredCommand>{
    trigger: /^ig@(.+)$/,
    async execute(message, args: RegExpMatchArray) {
        if (!args || args.length != 2) {
            return;
        }
        const username = args[1];
        message.channel.startTyping();

        const serverResponse = await fetch(
            `https://www.instagram.com/${username}/?__a=1`
        );
        if (!serverResponse.ok) {
            message.channel.send('Something went wrong!');
        }
        const response = await serverResponse.json();
        const user = response?.graphql.user;
        console.log(user);
        const profileURL = `https://instagram.com/${user.username}`;
        const embed = new MessageEmbed()
            .setAuthor(user.full_name, user.profile_pic_url, profileURL)
            .setDescription(user.biography)
            .addField('Posts', user.edge_owner_to_timeline_media.count, true)
            .addField('Followers', user.edge_followed_by.count, true)
            .addField('Following', user.edge_follow.count, true)
            .setURL(profileURL);
        message.channel.send(embed);
        message.channel.stopTyping();
    },
};
