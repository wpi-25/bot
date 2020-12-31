import { config } from "..";
import { commands } from "../helpers/modules";
import { Command } from "../Types";

export const getCommand = (trigger:string) => commands.find(cmd => trigger == cmd.name || (cmd.aliases && cmd.aliases.includes(trigger)));
export const getUsage = (command:Command) => `${config.prefix}${command.name} ${command.args ? command.args : ''}`;