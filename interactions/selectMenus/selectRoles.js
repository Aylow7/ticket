const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'select_roles_',
    async execute(interaction, client) {
        try {
            const panelId = interaction.customId.replace('select_roles_', '');
            const pending = client.pendingPanels.get(panelId);

            if (!pending) {
                console.error(`❌ Panel non trouvé: ${panelId}`);
                return interaction.reply({ 
                    content: '❌ Configuration expirée - Recommencez avec +ticket-config', 
                    ephemeral: true 
                });
            }

            pending.supportRoles = interaction.values;
            client.pendingPanels.set(panelId, pending);

            console.log(`✅ Rôles sélectionnés:`, interaction.values);

            const roleList = interaction.values.length > 0 
                ? interaction.values.map(r => `<@&${r}>`).join(', ')
                : 'Aucun';

            const typeList = pending.types.map(t => `• ${t.charAt(0).toUpperCase() + t.slice(1)}`).join('\n');

            const embed = new EmbedBuilder()
                .setColor(config.colorP)
                .setTitle('✅ Résumé du panneau')
                .setDescription(`Panneau: **${pending.name}**`)
                .addFields(
                    { name: 'Description', value: pending.description || 'Aucune', inline: false },
                    { name: 'Salon d\'envoi', value: `<#${pending.channelId}>`, inline: false },
                    { name: 'Catégorie', value: `<#${pending.categoryId}>`, inline: false },
                    { name: 'Types de tickets', value: typeList, inline: false },
                    { name: 'Rôles support', value: roleList, inline: false }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_panel_${panelId}`)
                    .setLabel('✅ Confirmer')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_config')
                    .setLabel('❌ Annuler')
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.update({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('selectRoles error:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erreur: ' + error.message, ephemeral: true });
            }
        }
    }
};