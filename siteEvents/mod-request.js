const servers = { // "countryShortCode": [serverId, channelId]
    "hub": ['1157376439117688842', '1157376359027445830'],
    "usa": ['1140633197676335225', '1140658239667699732']
}

module.exports = {
    name: 'mod-request',
    execute(req, res, client) {
        try {
            const data = req.body;
            
            const server = data.server ? data.server : null;
            const country = data.country ? data.country : null;
            const place = data.place ? data.place : null;
            const game = data.game ? data.game : null;
            const requester = data.requester ? data.requester : null;
            const reason = data.reason ? data.reason : "No reason provided";

            if (server && country && place && game && requester) {
                const channelId = (country && country.toLowerCase() in servers) ? servers[country.toLowerCase()][0] : servers.hub[0];
                const roleId = (country.toLowerCase() in servers) ? servers[country.toLowerCase()][1] : servers.hub[1];

                const message = `<@&${roleId}>\nMod requested in ${game}, ${country} (Server: ${server}) by ${requester}. Reason: ${reason}\nLink: https://www.roblox.com/games/${place}/`

                const channel = client.channels.cache.get(channelId)
                if (channel) {
                    channel.send(message)
                } else {
                    console.log('Channel not found')
                };
            };
            // Add code to handle the data and interact with Discord bot

            res.status(200).send('Data received');
        } catch (error) {
            res.status(500).send('Internal Server Error');
            console.warn(error)
        }
    },
};