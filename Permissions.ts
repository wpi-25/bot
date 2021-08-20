import { User, Message, GuildMember, Snowflake } from 'discord.js';
import { Command, TypedSnowflake } from './Types';

const admins = <Array<TypedSnowflake>>[
    '261908587943690242', // Sam for now
    '118455061222260736', // Muirrum
    '262245801416327169', // Brooke
];

export const hasPermission = (message: Message, command: Command) => {
    const required = command.requiredPerms;
    if (!required) {
        // If the command doesn't specify, default to public
        return true;
    }

    // It's more specific...
    switch (required) {
        case 'public':
            return true;

        case 'admin':
        case 'whitelist': // Whitelist inherits all the admins as well
            if (message.guild) {
                const guildUser = message.guild.members.cache.get(
                    message.author.id
                );
                if (required == 'admin') {
                    return inTypedWhitelist(guildUser, admins);
                }
                let localWhitelist = admins;
                if (command.whitelist) {
                    localWhitelist = admins.concat(command.whitelist);
                }
                return inTypedWhitelist(guildUser, localWhitelist);
            } else {
                return inTypedWhitelist(message.author, admins);
            }
    }
};

export const inRole = (guildUser: GuildMember, role: Snowflake) =>
    guildUser.roles.cache.find((roleData, roleID) => role == roleID)
        ? true
        : false; // Look through the GuildMember's roles and see if this role is anywhere there
export const inTypedSnowflake = (
    user: User | GuildMember,
    snowflake: TypedSnowflake
) => {
    if (snowflake.match(/^&\d+$/) && isGuildMember(user)) {
        // Is a role
        return inRole(user, snowflake.substr(1));
    } else if (snowflake.match(/^\d+$/)) {
        // Is a user
        return snowflake == user.id;
    } else {
        return false;
    }
};
export const inTypedWhitelist = (
    user: User | GuildMember,
    whitelist: Array<TypedSnowflake>
) => {
    // Loop through the whitelist and look for anything this user is included in. It returns whether or not they are included in anything
    return (
        whitelist.find((snowflake) => inTypedSnowflake(user, snowflake)) !=
        undefined
    ); // Ughh this whole chain is super messy but it works. I don't want to touch this again
};

const isGuildMember = (tbd: User | GuildMember): tbd is GuildMember =>
    (tbd as GuildMember).guild ? true : false;
