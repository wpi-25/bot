import { Client } from "discord.js";
import { Config } from "./Types";
import './helpers/lifecycle';
import * as bot_config from './config.json';

export const config:Config = bot_config;    // Just to shim it into shape and provide better types

export const client = new Client();

// This stuff has to be below these exports so they have everything defined for them
import { readyMembers, setupMemberListeners } from "./helpers/members";
import { readyVC, setupVCListeners } from "./helpers/vc";
import { setupMessageListeners } from "./helpers/messageHandler";
import { setupReactionListeners } from "./helpers/reactionHandler";

client.on('ready', ()=>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({activity:{'type':'WATCHING',name:'🐐'}});

    readyMembers();
    readyVC();
});

setupMessageListeners();
setupReactionListeners();

setupVCListeners();
setupMemberListeners();

client.login(config.token);
