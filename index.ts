import { Client, Intents } from 'discord.js';
import { Config } from './Types';
import './helpers/lifecycle';
import * as bot_config from './config.json';

export const config: Config = bot_config; // Just to shim it into shape and provide better types

export const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
});

// This stuff has to be below these exports so they have everything defined for them
import { readyMembers, setupMemberListeners } from './helpers/members';
import { readyVC, setupVCListeners } from './helpers/vc';
import { setupMessageListeners } from './helpers/messageHandler';
import { setupReactionListeners } from './helpers/reactionHandler';
import { queueLevelUpdates } from './util/levels';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({
        activities: [
            {
                name: '🐐',
                type: 'WATCHING',
            },
        ],
    });

    readyMembers();
    readyVC();

    queueLevelUpdates();
});

setupMessageListeners();
setupReactionListeners();

setupVCListeners();
setupMemberListeners();

client.login(config.token);
