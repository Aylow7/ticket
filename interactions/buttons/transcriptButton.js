const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { generateTranscript } = require('../../utils/transcriptGenerator');
const db = require('../../utils/database');

module.exports = {
    customId: 'transcript_',
    async execute(interaction, client) {
        const ticketId = interaction.customId.replace('transcript_', '');
        const channel = interaction.guild.channels.cache.get(ticketId);

        if (!channel) {
            return interaction.reply({ content: '❌ Salon non trouvé', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            console.log(`📄 Génération transcript pour: ${ticketId}`);
            const { html, messageCount } = await generateTranscript(channel, interaction.guild, client);

            console.log(`✅ Transcript généré: ${messageCount} messages`);

            const payload = {
                ticketId,
                guildId: interaction.guildId,
                userId: interaction.user.id,
                channelName: channel.name,
                html,
                createdAt: new Date().toISOString()
            };

            console.log(`📤 Envoi au serveur web: ${config.webServerUrl}/api/transcripts`);
            console.log(`🔑 Token utilisé: Bearer ${config.webToken.substring(0, 5)}...`);

            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`${config.webServerUrl}/api/transcripts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.webToken}`
                },
                body: JSON.stringify(payload)
            });

            console.log(`📩 Réponse serveur: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Erreur serveur: ${errorText}`);
                return interaction.editReply({
                    content: `❌ Erreur serveur (${response.status}): ${errorText}`
                });
            }

            const data = await response.json();
            console.log(`✅ URL transcript: ${data.url}`);

            db.saveTicket(ticketId, { transcriptUrl: data.url });

            const embed = new EmbedBuilder()
                .setColor(config.colorP)
                .setTitle('📄 Transcript généré')
                .setDescription(`[Voir le transcript](${data.url})`)
                .addFields({ name: 'Messages', value: messageCount.toString(), inline: true });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(`❌ Erreur transcript:`, error);
            await interaction.editReply({
                content: `❌ Erreur: ${error.message}`
            });
        }
    }
};