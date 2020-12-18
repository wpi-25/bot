import { commands } from "..";

export const getCommand = (trigger:string) => commands.find(cmd => trigger == cmd.name || (cmd.aliases && cmd.aliases.includes(trigger)));