import {
    GuildChannel,
    MessageEmbed,
    MessageMentions,
    Permissions,
    TextChannel,
} from 'discord.js';
import { client, config } from '../index';
import { schedule } from 'node-cron';

let announcementChannel: TextChannel;
export function setupTimedViewable() {
    if ('announcementChannel' in config.timedViewable) {
        announcementChannel = <TextChannel>(
            client.channels.cache.get(
                config.timedViewable['announcementChannel']
            )
        );
    }
    for (const channelId in config.timedViewable.channels) {
        if (`<#${channelId}>`.match(MessageMentions.CHANNELS_PATTERN)) {
            if (
                Object.prototype.hasOwnProperty.call(
                    config.timedViewable.channels,
                    channelId
                )
            ) {
                const element = config.timedViewable.channels[channelId];
                const channel = <GuildChannel>(
                    client.channels.cache.get(channelId)
                );
                schedule(element.yes, () => {
                    setChannelViewable(channel, true);
                });
                schedule(element.no, () => {
                    setChannelViewable(channel, false);
                });
            }
        }
    }
}

async function setChannelViewable(channel: GuildChannel, viewable: boolean) {
    const everyone = channel.guild.roles.everyone;
    await channel.updateOverwrite(everyone, {
        VIEW_CHANNEL: viewable,
    });
    if (announcementChannel) {
        const permissions = channel.permissionOverwrites.get(everyone.id);
        const isViewable = permissions.allow.has(
            Permissions.FLAGS.VIEW_CHANNEL
        );
        announcementChannel.send(
            new MessageEmbed()
                .setTitle(
                    `#${channel.name} is now ${
                        isViewable ? 'ENABLED' : 'DISABLED'
                    }`
                )
                .setColor(isViewable ? '#4caf50' : '#ff5722')
        );
    }
}
