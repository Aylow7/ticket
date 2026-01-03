const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'ticket_create_panel',
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('create_panel_modal')
            .setTitle('Créer un panneau de tickets');

        const nameInput = new TextInputBuilder()
            .setCustomId('panel_name')
            .setLabel('Nom du panneau')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('panel_desc')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};