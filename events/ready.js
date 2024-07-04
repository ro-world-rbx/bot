const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        client.user.setActivity('over Ro-World', { type: ActivityType.Watching });
        const date = new Date(Date.now())
        console.log(`Ready! Logged in as ${client.user.tag} at ${date.toLocaleString()}`);
    },
};