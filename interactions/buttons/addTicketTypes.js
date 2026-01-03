const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'add_ticket_type',
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('add_type_modal')
            .setTitle('Ajouter un type de ticket');

        const idInput = new TextInputBuilder()
            .setCustomId('type_id')
            .setLabel('ID du type (support, report, etc.)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('support');

        const nameInput = new TextInputBuilder()
            .setCustomId('type_name')
            .setLabel('Nom affiché')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Support');

        const emojiInput = new TextInputBuilder()
            .setCustomId('type_emoji')
            .setLabel('Emoji')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('🆘');

        const colorInput = new TextInputBuilder()
            .setCustomId('type_color')
            .setLabel('Couleur hex (#FF0000)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('#5865F2');

        modal.addComponents(
            new ActionRowBuilder().addComponents(idInput),
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(emojiInput),
            new ActionRowBuilder().addComponents(colorInput)
        );

        await interaction.showModal(modal);
    }
};