const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'select_panel_action',
    async execute(interaction, client) {
        const panelId = interaction.values[0];
        const guildData = db.getGuildData(interaction.guildId);
        const panel = guildData.panels.find(p => p.id === panelId);

        if (!panel) {
            return interaction.reply({ content: '❌ Panneau non trouvé', ephemeral: true });
        }

        const typeNames = panel.types.map(t => {
            const type = guildData.ticketTypes?.find(ty => ty.id === t);
            return type ? `${type.emoji} ${type.name}` : t;
        }).join(', ');

        const roleNames = panel.supportRoles?.length > 0 
            ? panel.supportRoles.map(r => `<@&${r}>`).join(', ')
            : 'Aucun';

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle(`📋 ${panel.name}`)
            .addFields(
                { name: 'Salon d\'envoi', value: `<#${panel.channelId}>`, inline: false },
                { name: 'Catégorie', value: `<#${panel.categoryId}>`, inline: false },
                { name: 'Types de tickets', value: typeNames, inline: false },
                { name: 'Rôles support', value: roleNames, inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`resend_panel_${panelId}`)
                .setLabel('📤 Renvoyer le panneau')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`edit_panel_${panelId}`)
                .setLabel('✏️ Modifier')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`delete_panel_${panelId}`)
                .setLabel('🗑️ Supprimer')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('back_manage_panels')
                .setLabel('⬅️ Retour')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};