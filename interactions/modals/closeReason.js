const { EmbedBuilder, ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');
const { generateTranscript } = require('../../utils/transcriptGenerator');

module.exports = {
    customId: 'close_reason_',
    async execute(interaction, client) {
        const ticketId = interaction.customId.replace('close_reason_', '');
        const reason = interaction.fields.getTextInputValue('close_reason') || 'Aucune raison fournie';

        const channel = interaction.channel;
        const ticket = db.getTicket(ticketId);

        if (!ticket) {
            return interaction.reply({ content: '❌ Ticket non trouvé', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🔒 Ticket fermé')
            .setDescription(`Raison: ${reason}`)
            .setFooter({ text: 'Ce salon sera supprimé dans 10 secondes' });

        await interaction.reply({ embeds: [embed] });

        db.saveTicket(ticketId, {
            closed: true,
            closedAt: Date.now(),
            closedBy: interaction.user.id,
            closedReason: reason
        });

        try {
            console.log(`📄 Génération transcript pour fermeture: ${ticketId}`);
            const { html, messageCount } = await generateTranscript(channel, interaction.guild, client);

            const payload = {
                ticketId,
                guildId: interaction.guildId,
                userId: ticket.userId,
                channelName: channel.name,
                html,
                createdAt: new Date().toISOString()
            };

            console.log(`🔑 Token: ${config.webToken.substring(0, 10)}...`);
            console.log(`🌐 URL: ${config.webServerUrl}/api/transcripts`);

            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`${config.webServerUrl}/api/transcripts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.webToken}`
                },
                body: JSON.stringify(payload)
            });

            console.log(`📩 Réponse: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                db.saveTicket(ticketId, { transcriptUrl: data.url });

                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('🔗 Voir le transcript')
                        .setURL(data.url)
                        .setStyle(ButtonStyle.Link),
                );

                const user = await client.users.fetch(ticket.userId);
                const transcriptEmbed = new EmbedBuilder()
                    .setColor(config.colorP)
                    .setTitle('📄 Transcript de votre ticket')
                    .setDescription(`Votre ticket **#${channel.name}** a été fermé.`)
                    .addFields(
                        { name: 'Raison', value: reason, inline: false },
                        { name: 'Fermé par', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Messages', value: messageCount.toString(), inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ 
                        text: interaction.guild.name, 
                        iconURL: interaction.guild.iconURL({ dynamic: true }) 
                    })

                await user.send({ embeds: [transcriptEmbed], components: [row1] }).catch(() => {});
                console.log(`✅ Transcript envoyé à l'utilisateur`);
            } else {
                const errorText = await response.text();
                console.error(`❌ Erreur upload transcript: ${response.status}`);
                console.error(`📝 Détails: ${errorText}`);
            }
        } catch (error) {
            console.error(`❌ Erreur lors de la génération du transcript:`, error);
        }

        setTimeout(() => {
            channel.delete().catch(() => {});
        }, 10000);
    }
};