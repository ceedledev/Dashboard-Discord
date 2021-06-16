const { Client, MessageEmbed } = require("discord.js");
const Enmap = require("enmap");
const { stripIndents } = require("common-tags");
const config = require("./config.json");

require("dotenv").config();

const client = new Client({
    disableMentions: 'everyone',
    messageCacheMaxSize: 50,
    messageCacheLifetime: 60,
    messageSweepInterval: 120,
    partials: [
        'MESSAGE',
        'USER',
        'GUILD_MEMBER',
        'REACTION',
        'CHANNEL'
    ],
    ws: {
        intents: [
            'GUILDS',
            'GUILD_MEMBERS',
            'GUILD_PRESENCES',
            'GUILD_MESSAGES',
        ],
    }
});

client.settings = new Enmap({ name: "settings", fetchAll: false, autoFetch: true, cloneLevel: 'deep' });

client.on("ready", async () => {
    console.log(`Le bot à bien démarrer !`);

    const webPortal = require("./server");
    webPortal.load(client);
});

client.on('message', async (message) => {

    client.settings.ensure(message.guild.id, {
        guildID: message.guild.id,
        prefix: "!"
    }); 

    const fetchedPrefix = client.settings.get(message.guild.id, "prefix");

    const prefix = fetchedPrefix || config.prefix;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    if (cmd === "prefix") {
        const curPrefix = client.settings.get(message.guild.id);

        const newPrefix = args[0];
        if (!newPrefix) return message.channel.send(`**Prefix actuelle: \`${curPrefix.prefix || config.prefix}\`**\nSi vous souhaitez changer le prefix, rendez-vous sur le dashboard.`);

        if (newPrefix === curPrefix.prefix) return message.channel.send(`Le prefix et déjà celui la.`);

        client.settings.set(message.guild.id, newPrefix, "prefix");
        const prefixEmbed = new MessageEmbed()
            
            .setColor("#2f3136")
            .setDescription(stripIndents`
            Le prefix du bot à bien été modifier en: \`${newPrefix}\`
            `)

        return message.channel.send(prefixEmbed);
    };

    if (cmd === "ping") {
        const msg = await message.channel.send(`🏓 Pinging....`);
        msg.edit(`🏓 Pong!\nVoici la latence ${Math.floor(msg.createdTimestamp - message.createdTimestamp)}ms\nLa latence de l'API ${Math.round(client.ws.ping)}ms`);
    };

});

client.login(process.env.TOKEN);
