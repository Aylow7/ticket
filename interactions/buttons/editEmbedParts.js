const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function createEditModal(customId, label, placeholder, value = '') {
    const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle(`Éditer: ${label}`);

    const input = new TextInputBuilder()
        .setCustomId('embed_value')
        .setLabel(label)
        .setStyle(customId === 'edit_embed_description' ? TextInputStyle.Paragraph : TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder(placeholder)
        .setValue(value);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return modal;
}

module.exports = {
    customId: ['edit_embed_title', 'edit_embed_description', 'edit_embed_color', 'edit_embed_footer'],
    async execute(interaction, client) {
        const db = require('../../utils/database');
        const guildData = db.getGuildData(interaction.guildId);
        const config = guildData.embedConfig || {};

        let modal;
        
        if (interaction.customId === 'edit_embed_title') {
            modal = createEditModal('save_embed_title', 'Titre', '🎫 Créer un Ticket', config.title);
        } else if (interaction.customId === 'edit_embed_description') {
            modal = createEditModal('save_embed_description', 'Description', 'Cliquez pour créer...', config.description);
        } else if (interaction.customId === 'edit_embed_color') {
            modal = createEditModal('save_embed_color', 'Couleur (#5865F2)', '#5865F2', config.color);
        } else if (interaction.customId === 'edit_embed_footer') {
            modal = createEditModal('save_embed_footer', 'Pied de page', 'Système de tickets', config.footer);
        }

        await interaction.showModal(modal);
    }
};