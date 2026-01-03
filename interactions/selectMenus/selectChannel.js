const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const config = require('../../config');

module.exports = {
    customId: 'select_channel_',
    async execute(interaction, client) {
        try {
            const panelId = interaction.customId.replace('select_channel_', '');
            console.log(`🔍 Recherche panel: ${panelId}`);
            console.log(`📍 Panels disponibles:`, Array.from(client.pendingPanels.keys()));

            const pending = client.pendingPanels.get(panelId);

            if (!pending) {
                console.error(`❌ Panel non trouvé: ${panelId}`);
                return interaction.reply({ 
                    content: '❌ Configuration expirée - Recommencez avec +ticket-config', 
                    ephemeral: true 
                });
            }

            const channelId = interaction.values[0];
            
            pending.channelId = channelId;
            pending.step = 2;
            client.pendingPanels.set(panelId, pending);

            console.log(`✅ Channel sélectionné: ${channelId}`);

            const embed = new EmbedBuilder()
                .setColor(config.colorP)
                .setTitle('📋 Configuration du panneau')
                .setDescription(`Panneau: **${pending.name}**`)
                .addFields(
                    { name: 'Salon d\'envoi', value: `<#${channelId}>`, inline: false },
                    { name: 'Étape 2/4', value: 'Sélectionnez la catégorie des tickets', inline: false }
                );

            const row = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId(`select_category_${panelId}`)
                    .setChannelTypes(ChannelType.GuildCategory)
                    .setPlaceholder('Choisissez une catégorie...')
                    .setMaxValues(1)
            );

            await interaction.update({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('selectChannel error:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erreur: ' + error.message, ephemeral: true });
            }
        }
    }
};