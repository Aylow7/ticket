const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'confirm_panel_',
    async execute(interaction, client) {
        const panelId = interaction.customId.replace('confirm_panel_', '');
        console.log(`✅ Confirmation panel: ${panelId}`);
        console.log(`📍 Panels disponibles:`, Array.from(client.pendingPanels.keys()));
        
        const pending = client.pendingPanels.get(panelId);

        if (!pending) {
            console.error(`❌ Panel non trouvé: ${panelId}`);
            return interaction.reply({ content: '❌ Configuration expirée - Recommencez avec +ticket-config', ephemeral: true });
        }

        const guildData = db.getGuildData(interaction.guildId);

        const newPanel = {
            id: panelId,
            name: pending.name,
            description: pending.description,
            channelId: pending.channelId,
            categoryId: pending.categoryId,
            types: pending.types,
            supportRoles: pending.supportRoles || [],
            createdAt: Date.now()
        };

        guildData.panels.push(newPanel);
        db.saveGuildData(interaction.guildId, guildData);

        console.log(`✅ Panel sauvegardé:`, newPanel);

        const channel = interaction.guild.channels.cache.get(pending.channelId);

        if (channel) {
            const guildData = db.getGuildData(interaction.guildId);
            const embedConfig = guildData.embedConfig || {};

            const embed = new EmbedBuilder()
                .setColor(embedConfig.color || config.colorP)
                .setTitle(embedConfig.title || `🎫 ${pending.name}`)
                .setDescription(embedConfig.description || (pending.description || 'Créez un ticket pour obtenir de l\'aide'));

            if (embedConfig.footer) {
                embed.setFooter({ text: embedConfig.footer });
            }

            const ticketTypes = guildData.ticketTypes || [
                { id: 'support', name: 'Support', emoji: '🆘' },
                { id: 'report', name: 'Report', emoji: '⚠️' },
                { id: 'achat', name: 'Achat', emoji: '🛒' }
            ];

            const filteredTypes = pending.types 
                ? pending.types.map(typeId => ticketTypes.find(t => t.id === typeId)).filter(Boolean)
                : ticketTypes;

            const typeOptions = filteredTypes.map(t => ({
                label: t.name,
                value: t.id,
                emoji: t.emoji
            }));

            const { StringSelectMenuBuilder } = require('discord.js');

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`create_ticket_${panelId}`)
                    .setPlaceholder('Sélectionnez un type de ticket...')
                    .addOptions(typeOptions)
            );

            await channel.send({ embeds: [embed], components: [row] });
            console.log(`✅ Panel envoyé dans le salon`);
        } else {
            console.error(`❌ Salon non trouvé: ${pending.channelId}`);
        }

        client.pendingPanels.delete(panelId);
        console.log(`✅ Panel supprimé de pendingPanels`);

        const successEmbed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✅ Panneau créé')
            .setDescription(`Le panneau **${pending.name}** a été créé avec succès!`);

        await interaction.update({ embeds: [successEmbed], components: [] });
    }
};