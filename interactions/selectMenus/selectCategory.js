const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    customId: 'select_category_',
    async execute(interaction, client) {
        try {
            const panelId = interaction.customId.replace('select_category_', '');
            const pending = client.pendingPanels.get(panelId);

            if (!pending) {
                console.error(`❌ Panel non trouvé: ${panelId}`);
                return interaction.reply({ 
                    content: '❌ Configuration expirée - Recommencez avec +ticket-config', 
                    ephemeral: true 
                });
            }

            const categoryId = interaction.values[0];
            
            pending.categoryId = categoryId;
            pending.step = 3;
            client.pendingPanels.set(panelId, pending);

            console.log(`✅ Catégorie sélectionnée: ${categoryId}`);

            const embed = new EmbedBuilder()
                .setColor(config.colorP)
                .setTitle('📋 Configuration du panneau')
                .setDescription(`Panneau: **${pending.name}**`)
                .addFields(
                    { name: 'Salon d\'envoi', value: `<#${pending.channelId}>`, inline: false },
                    { name: 'Catégorie', value: `<#${categoryId}>`, inline: false },
                    { name: 'Étape 3/4', value: 'Sélectionnez les types de tickets', inline: false }
                );

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`select_types_${panelId}`)
                    .setPlaceholder('Sélectionnez les types...')
                    .setMinValues(1)
                    .setMaxValues(4)
                    .addOptions(
                        { label: 'Support', value: 'support', emoji: '🆘' },
                        { label: 'Report', value: 'report', emoji: '⚠️' },
                        { label: 'Achat', value: 'achat', emoji: '🛒' },
                        { label: 'Autre', value: 'autre', emoji: '📝' }
                    )
            );

            await interaction.update({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('selectCategory error:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erreur: ' + error.message, ephemeral: true });
            }
        }
    }
};