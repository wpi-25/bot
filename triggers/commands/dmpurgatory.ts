import { TextChannel } from 'discord.js';
import { listenerCount } from 'process';
import { Command } from '../../Types';
import { getIDFromTag } from '../../util/text';

module.exports = <Command>{
    name: 'dmpurgatory',
    description:
        'DM users in purgatory and then assign them the purgatory role so we know they have been DMed already',
    args: '<# of users>',
    requiredPerms: 'admin',
    guildOnly: true,
    async execute(message, args, client) {
        var counter = 0; // Only up to 10 members at a time to keep the bot from being rate limited
        var canDM = true;
        const purgatoryRole = '815671753874604054';
        const allowedAccessRoles = [
            '808759766771433473',
            '796388633649086475',
            '796388789672345670',
            '796388890327121920',
            '796389269337931776',
            '788265970904465449',
            '788380925867720714',
        ];
        const list = client.guilds.cache.get(`788248729412829224`);
        list.members.cache.each((member) => {
            member.roles.cache.each((role) => {
                if (
                    allowedAccessRoles.includes(role.id) ||
                    role.id == purgatoryRole
                ) {
                    canDM = false;
                }
            });

            if (canDM && counter < 10) {
                member
                    .send(
                        'Hello there! I am Gompei25, the bot from the WPI Class of 2025 Discord Server. If you are receiving this message, it is because you do not have full access to the server. To receive full access to the server, please head to <#788252271313289266> and claim a role (i.e. @Accepted, @Committed, etc). If you have any questions, feel free to ask in <#788419028012105748>'
                    )
                    .then(console.log)
                    .catch(console.error);
                member.roles.add(purgatoryRole);
                counter++;
            }
        });
        message.react('✅');
    },
};
