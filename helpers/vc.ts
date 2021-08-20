import { client, config } from '..';

export function readyVC() {
    if ('vcPing' in config) {
        client.guilds.cache.forEach((guild, gid) => {
            if (gid in config.vcPing) {
                const vcStates = guild.voiceStates.cache;
                const guildMembers = guild.members.cache;
                guildMembers.forEach((member, UID) => {
                    const state = vcStates.find((state, key) => key == UID);
                    if (state?.channelId) {
                        // In VC
                        // console.log(`${member.displayName} is in ${guild.channels.cache.get(state.channelID).name}`);
                        member.roles.add(config.vcPing[gid]);
                    } else {
                        // console.log(`${member.displayName} is not in a vc`);
                        member.roles.remove(config.vcPing[gid]);
                    }
                });
            }
        });
    }
}

export function setupVCListeners() {
    if ('vcPing' in config) {
        client.on('voiceStateUpdate', (oldState, newState) => {
            if (!oldState.channelId && newState.channelId) {
                console.log(
                    `${newState.member.displayName} joined ${
                        newState.guild.channels.cache.get(newState.channelId)
                            ?.name
                    }`
                );
                if (newState.guild.id in config.vcPing) {
                    console.log('in known guild');
                    newState.member.roles.add(config.vcPing[newState.guild.id]);
                }
            } else if (oldState.channelId && !newState.channelId) {
                console.log(
                    `${newState.member.displayName} left ${
                        oldState.guild.channels.cache.get(oldState.channelId)
                            ?.name
                    }`
                );
                if (oldState.guild.id in config.vcPing) {
                    console.log('in known guild');
                    oldState.member.roles.remove(
                        config.vcPing[oldState.guild.id]
                    );
                }
            } else if (oldState?.channelId != newState?.channelId) {
                // Users move from one channel to another but disconnect when switching guilds so this never occurs
                console.log(
                    `${newState.member.displayName} moved from ${
                        oldState.guild.channels.cache.get(oldState.channelId)
                            ?.name
                    } to ${
                        newState.guild.channels.cache.get(newState.channelId)
                            ?.name
                    }`
                );
                if (
                    oldState.guild.id in config.vcPing &&
                    !(newState.guild.id in config.vcPing)
                ) {
                    console.log('in known guild');
                    oldState.member.roles.remove(
                        config.vcPing[oldState.guild.id]
                    );
                }
            }
        });
    }
}
