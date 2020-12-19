import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { TriggeredCommand } from "../../Types";

module.exports = <TriggeredCommand> {
    trigger: /^ig@(.+)$/,
    async execute(message, args:RegExpMatchArray) {
        if (!args || args.length != 2) {
            return;
        }
        let username = args[1];
        message.channel.startTyping();

        let serverResponse = await fetch(`https://www.instagram.com/${username}/?__a=1`);
        if (!serverResponse.ok) {
            message.channel.send('Something went wrong!');
        }
        let response = await serverResponse.json();
        let user = response?.graphql.user;
        console.log(user);
        let profileURL = `https://instagram.com/${user.username}`;
        let embed = new MessageEmbed()
            .setAuthor(user.full_name, user.profile_pic_url, profileURL)
            .setDescription(user.biography)
            .addField('Posts', user.edge_owner_to_timeline_media.count, true)
            .addField('Followers', user.edge_followed_by.count, true)
            .addField('Following', user.edge_follow.count, true)
            .setURL(profileURL);
        message.channel.send(embed);
        message.channel.stopTyping();
    }
}