const { UserSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'add_user_',
    async execute(interaction, client) {
        const ticketId = interaction.customId.replace('add_user_', '');

        const row = new ActionRowBuilder().addComponents(
            new UserSelectMenuBuilder()
                .setCustomId(`add_user_confirm_${ticketId}`)
                .setPlaceholder('Sélectionnez un utilisateur...')
                .setMaxValues(5)
        );

        await interaction.reply({ components: [row], ephemeral: true });
    }
};