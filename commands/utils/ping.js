const { EmbedBuilder } = require('discord.js');
const { colorP } = require('../../config');

module.exports = {
    name: 'ping',
    description: 'Affiche la latence du bot',
    aliases: ['botping', 'latency', 'botlatency'],
    async execute(client, message) {
        const msg = await message.channel.send('🏓 Ping...');
        const latency = msg.createdTimestamp - message.createdTimestamp;

        function getUptime(ms) {
            const units = {
                mt: 1000 * 60 * 60 * 24 * 30,
                w: 1000 * 60 * 60 * 24 * 7,
                d: 1000 * 60 * 60 * 24,
                h: 1000 * 60 * 60,
                s: 1000
            };

            let remaining = ms;
            const result = [];

            for (const [unit, value] of Object.entries(units)) {
                const amount = Math.floor(remaining / value);
                if (amount > 0) {
                    result.push(`${amount}${unit}`);
                    remaining %= value;
                }
            }

            return result.length ? result.join(' ') : '0s';
        }

        const embed = new EmbedBuilder()
            .setColor(colorP.substring(0, 7))
            .setTitle('💎 Bot Latency')
            .addFields(
                { name: ' ', value: `> *Latence Message : \`${latency}ms\`.*` },
                { name: ' ', value: `> *Latence API : \`${Math.round(client.ws.ping)}ms\`.*` },
                { name: ' ', value: `> *Uptime : \`${getUptime(client.uptime)}\`.*` }
            )
            .setTimestamp()
            .setImage(`https://dummyimage.com/400x10/${colorP.substring(0, 7).replace('#', '')}/${colorP.substring(0, 7).replace('#', '')}.png`)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL() });

        msg.edit({ embeds: [embed], content: ' ' });
    }
};