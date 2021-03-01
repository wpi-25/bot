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

        try {
            const serverResponse = await fetch(
                `https://www.instagram.com/${username}/?__a=1`
            );
            if (!serverResponse.ok) {
                console.log(
                    `=== INSTAGRAM ERROR, RESPONSE ${serverResponse.status} ${serverResponse.statusText} ===`,
                    await serverResponse.text()
                );
                throw `The Instagram API rejected the request with an error code of \`${serverResponse.status} ${serverResponse.statusText}\``;
            }
            const response = await serverResponse.json();
            const user = response?.graphql.user;
            console.log(user);
            const profileURL = `https://instagram.com/${user.username}`;
            const embed = new MessageEmbed()
                .setAuthor(
                    `${user.full_name}${user.is_private ? ' 🔒' : ''}${
                        user.is_verified ? ' ☑️' : ''
                    }`,
                    user.profile_pic_url,
                    profileURL
                )
                .setDescription(user.biography)
                .addField(
                    'Posts',
                    user.edge_owner_to_timeline_media.count,
                    true
                )
                .addField('Followers', user.edge_followed_by.count, true)
                .addField('Following', user.edge_follow.count, true)
                .setURL(profileURL);
            message.channel.send(embed);
        } catch (e) {
            if (e.toString().includes('Cannot read property')) {
                throw (
                    `The Instagram API rejected the request and didn't return a valid user.\n` +
                    `Check that you typed your username correctly.\`\`\`${e}\`\`\``
                );
            } else if (e.toString().includes('invalid json response')) {
                throw (
                    `The Instagram API rejected the request and didn't return valid data.` +
                    `Please try again in a few hours.\`\`\`${e}\`\`\``
                );
            } else {
                throw e;
            }
        } finally {
            message.channel.stopTyping();
        }
    },
};
