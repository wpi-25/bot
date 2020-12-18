import { Message, Client, Emoji, User, MessageReaction, PartialUser } from "discord.js";

/** A command that is triggered by the prefix followed by the name.  
 *  Can be locked down to certain users or admins
 */
export type Command = {
    /** The command trigger */
    name: string,
    /** A description of the arguments that this command takes, to display in the help menu */
    args?: string,
    /** Aliases for the command */
    aliases?: Array<string>,
    /** The description to display in the Help menu */
    description?: string,
    /** Should the command only work in a guild */
    guildOnly?: boolean,
    /** Command permissions, should effectively default to `public` */
    requiredPerms?: 'public' | 'admin' | 'whitelist',
    /** Whitelist */
    whitelist?: Array<TypedSnowflake>,
    /** The code to run when triggered */
    execute(message:Message, args:Array<string>, client:Client): void
}

/** A command that is triggered by a keyword within the message or something else */
export type TriggeredCommand = {    // TODO: Create a better name for this type
    /** Determines if the message will trigger the command  
     *  If `trigger` is a `String`, it will check if it is in the message (`message.content.includes(...)`)  
     *  If `trigger` is a `RegExp`, it will be run against the message and the result will be passed to `execute(...)` in `args`  
     *  If `trigger` is a `Function`, `execute` will be run if it returns `true`
    */
    trigger: String | RegExp | TriggerDeterminer,
    /** The code to run when triggered */
    execute(message:Message, args:any, client:Client): void
}

export type EditCommand = {
    execute(oldMessage:Message, newMessage:Message, client:Client): void
}

export type ReactionCommand = {
    trigger: String | Emoji | Array<String> | Array<Emoji>,
    execute(reaction:MessageReaction, user:User|PartialUser, args:any, client:Client): void
}

/** A regular Discord.js `Snowflake`, but with a type annotation in front of it so it can select the right way to check  
 * `&` for a role  
 * nothing for a user  
 * eg.  
 * `716118096355786763`  PDunks  
 * `&662365105559699487`  Bot Boi in the school server
*/
export type TypedSnowflake = string;

export type TriggerDeterminer = (message:Message) => boolean | any;