const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const badges = {
    'Administrator': '1254944618076966944',
    'Friendship': '1254944705750241364',
    'Combat Initiation': '1254944627077939301',
    'Warrior': '1254944709420253235',
    'Bloxxer': '1254944624514957464',
    'Homestead': '1254944630164951095',
    'Bricksmith': '1254944625790029845',
    'Inviter': '1254944707696525414',
    'Veteran': '1254944620840882177',
    'Official Model Maker': '1254944634501595146',
    'Welcome To The Club': '1254944640071897089',
    'Ambassador': '1254944622254358602'
    //'BC': '1254944623080640583',
    // 'OBC': '1254944619733717134',
    // 'TBC': '1254944636041035888',
}

async function getAccountInfoByName(name, requester) {
    try {
        const response = await axios.post(`https://users.roblox.com/v1/usernames/users`, {
            "usernames": [name],
            "excludeBannedUsers": false
        })
        const data = response.data.data[0];
        if (data.id) {
            return getAccountInfo(data.id, requester);
        } else {
            return "idNotFound";
        }
    } catch (error) {
        console.error(error);
	}

}

async function getAccountInfo(id, requester) { // 95399395
    try {
        const response = await axios.get(`https://users.roblox.com/v1/users/${id}`).catch(function (error) {
            return error.response.status;
        });
        const data = response.data;
        if (data.name) {
            const headshot = await getAvatarThumbnail(id, '720x720', 'headshot');
            const bodyshot = await getAvatarThumbnail(id, '720x720', 'fullBody');

            const badgesGet = await axios.get(`https://accountinformation.roblox.com/v1/users/${id}/roblox-badges`).catch(function (error) {
                console.warn(`Badges failed for user id ${id} and requester ${requester.id}: Error ${error.response ? error.response.status : error.message}`);
            })
            let badgeEmojis = '';
            if (badgesGet && badgesGet.data) {
                for (let i in badgesGet.data) {
                    if (badges[badgesGet.data[i].name]) {
                        badgeEmojis += `<:${badgesGet.data[i].name.replace(/\s/g, '')}:${badges[badgesGet.data[i].name]}>`;
                    }
                }
            }

            const groupGet = await axios.get(`https://groups.roblox.com/v2/users/${id}/groups/roles?includeLocked=false&includeNotificationPreferences=false`).catch(function (error) {
                console.warn(`Group count failed for user id ${id} and requester ${requester.id}: Error ${error.response ? error.response.status : error.message}`);
                return {'data': {}};
            });
            const groupCount = groupGet.data.data.length;

            const friendCount = await axios.get(`https://friends.roblox.com/v1/users/${id}/friends/count`).catch(function (error) {
                console.warn(`Friend count failed for user id ${id} and requester ${requester.id}: Error ${error.response ? error.response.status : error.message}`);
            });
            const followerCount = await axios.get(`https://friends.roblox.com/v1/users/${id}/followers/count`).catch(function (error) {
                console.warn(`Follower count failed for user id ${id} and requester ${requester.id}: Error ${error.response ? error.response.status : error.message}`);
            });
            const followingCount = await axios.get(`https://friends.roblox.com/v1/users/${id}/followings/count`).catch(function (error) {
                console.warn(`Following count failed for user id ${id} and requester ${requester.id}: Error ${error.response ? error.response.status : error.message}`);
            });

            const prevUsersGet = await axios.get(`https://users.roblox.com/v1/users/${id}/username-history?limit=100&sortOrder=Asc`).catch(function (error) {
                console.warn(`Username history failed for user id ${id} and requester ${requester.id}: Error ${error.response ? error.response.status : error.message}`);
            });
            let prevUsers = '';
            if (prevUsersGet && prevUsersGet.data) {
                for (let i in prevUsersGet.data.data) {
                    prevUsers += prevUsersGet.data.data[i].name + ', ';
                }
                prevUsers = prevUsers.substring(0, prevUsers.length - 2);
            }

            const invStatus = await axios.get(`https://inventory.roblox.com/v1/users/${id}/can-view-inventory`).catch(function (error) {
                console.warn(`Inventory status failed for user id ${id} and requester ${requester.id}: Error ${error.response ? error.response.status : error.message}`);
                return '-';
            });
            
            const verified = await axios.get(`https://inventory.roblox.com/v1/users/${id}/items/0/102611803/is-owned`).catch(function (error) {
                console.warn(`Email verified failed for user id ${id} and requester ${requester.id}: Error ${error.response ? error.response.status : error.message}`);
                return false;
            });

            const profileEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Account Information')
            .setAuthor({ name: `@${data.name} (${data.displayName})`, url: `https://www.roblox.com/users/${id.toString()}/profile`})
            .addFields(
                { name: 'Username', value: data.name, inline: true },
                { name: 'UserID', value: id.toString(), inline: true },
                { name: 'Badges', value: badgeEmojis ? badgeEmojis : '-', inline: true },
                { name: 'Description', value: data.description ? data.description : '-', inline: false },
                { name: 'Friend Count', value: friendCount.data.count ? friendCount.data.count.toString() : '0', inline: true },
                { name: 'Follower Count', value: followerCount.data.count ? followerCount.data.count.toString() : '0', inline: true },
                { name: 'Following Count', value: followingCount.data.count ? followingCount.data.count.toString() : '0', inline: true },
                { name: 'Group Count', value: groupCount.toString(), inline: true },
                { name: 'Previous Usernames', value: prevUsers ? prevUsers : '0 (None)', inline: true },
                { name: 'Email Verified', value: verified.data ? 'True' : 'False', inline: true },
                { name: 'Creation Date', value: new Date(data.created).toLocaleString(), inline: true },
                { name: 'Account Status', value: data.isBanned ? 'Banned' : 'Okay', inline: true },
                { name: 'Inventory Status', value: (invStatus && invStatus.data) ? (invStatus.data.canView ? 'Public' : 'Private') : '-', inline: true },
            )
            .setFooter({ text: `${requester.id} • Requested by ${requester.username}`})
            .setTimestamp()

            if (headshot) {
                profileEmbed.setAuthor({ name: `@${data.name} (${data.displayName})`, url: `https://www.roblox.com/users/${id}/profile`, iconURL: headshot })
            }
            if (bodyshot) {
                profileEmbed.setThumbnail(bodyshot)
            }


        return profileEmbed;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
	}
}

async function getAvatarThumbnail(id, size, type) {
    if (type == 'fullBody') {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=${size}&format=Png&isCircular=false`);
        if (response.data.data[0].imageUrl) {
            return response.data.data[0].imageUrl;
        } else {
            return '';
        }
    } else if (type == 'headshot') {
        const response = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=${size}&format=Png&isCircular=false`);
        if (response.data.data[0].imageUrl) {
            return response.data.data[0].imageUrl;
        } else {
            return '';
        }
    }
}

module.exports = {
    category: 'moderation',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('bgcheck')
        .setDescription('Provides information about the specified user.')
        .addStringOption(option =>
			option.setName('username')
				.setDescription('The Roblox username or userid.')
				.setRequired(false))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The Discord user.')
                .setRequired(false)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const user = interaction.options.getUser('user');

        if (!username && !user) {
            await interaction.reply({ content: 'You must provide either a Roblox username or userid or select a Discord user.', ephemeral: true })
            return;
        } else if (username && user) {
            await interaction.reply({ content: 'Please only provide one option.', ephemeral: true })
            return;
        }

        if (username) {
            if (!isNaN(username)) {
                await interaction.reply({ content: `Fetching information for Roblox userid: ${username}.`, fetchReply: true })
                // Fetch Roblox information using the userid
                const accountInfoEmbed = await getAccountInfo(username, interaction.user)
                if (accountInfoEmbed == 'idNotFound') {
                    interaction.editReply({ content: `Could not find userID for ${username}!`});
                } else if (accountInfoEmbed) {
                    interaction.editReply({ content: '', embeds: [accountInfoEmbed]});
                } else {
                    interaction.editReply({ content: `Something went wrong getting account information for ${username}!`});
                    console.error(`Error returned: ${accountInfoEmbed}`)
                }
            } else {
                await interaction.reply({ content: `Fetching information for Roblox username: ${username}.`, fetchReply: true })
                // Fetch Roblox information using the username
                const accountInfoEmbed = await getAccountInfoByName(username, interaction.user)
                if (accountInfoEmbed == 'idNotFound') {
                    interaction.editReply({ content: `Could not find userID for ${username}!`});
                } else if (accountInfoEmbed) {
                    interaction.editReply({ content: '', embeds: [accountInfoEmbed]});
                } else {
                    interaction.editReply({ content: `Something went wrong getting account information for ${username}!`});
                    console.error(`Error returned: ${accountInfoEmbed}`)
                }
            }
        } else if (user) {
            const member = interaction.guild.members.cache.get(user.id);
            const nickname = member ? member.displayName : user.username;

            await interaction.reply({ content: `Fetching information for Discord user: ${nickname}.`, fetchReply: true });
            // Fetch Roblox information using the username
            const accountInfoEmbed = await getAccountInfoByName(nickname, interaction.user)
                if (accountInfoEmbed == 'idNotFound') {
                    interaction.editReply({ content: `Could not find userID for ${username}!`});
                } else if (accountInfoEmbed) {
                    interaction.editReply({ content: '', embeds: [accountInfoEmbed]});
                } else {
                    interaction.editReply({ content: `Something went wrong getting account information for ${username}!`});
                    console.error(`Error returned: ${accountInfoEmbed}`)
                }
        }
    },
};