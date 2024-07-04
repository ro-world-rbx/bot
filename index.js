// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

const express = require('express');
const app = express();
const port = 3000;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
client.commands = new Collection();

// Grab all the command folders from the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Middleware to parse JSON bodies
app.use(express.json());

const sEventsPath = path.join(__dirname, 'siteEvents');
const sEventFiles = fs.readdirSync(sEventsPath).filter(file => file.endsWith('.js'));

for (const file of sEventFiles) {
    const filePath = path.join(sEventsPath, file);
    const event = require(filePath);
    if ('name' in event && 'execute' in event) {
        app.post(`/${event.name}`, (req, res) => event.execute(req, res, client));
        console.log(`Found /${event.name}/`);
    } else {
        console.warn(`[WARNING] The site at /${filePath}/ is missing a required "data" or "execute" property.`);
    }
}

// Log in to Discord with the token
client.login(token);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});