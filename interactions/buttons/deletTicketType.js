const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    customId: 'delete_ticket_type',
    async execute(interaction, client) {
        const guildData = db.getGuildData(interaction.guildId);
        if (!guildData.ticketTypes || guildData.ticketTypes.length === 0) {
            return interaction.reply({ content: '❌ Aucun type de ticket à supprimer', ephemeral: true });
        }

        const options = guildData.ticketTypes.map(t => ({
            label: `${t.emoji} ${t.name}`,
            value: t.id,
            emoji: t.emoji
        }));

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('confirm_delete_type')
                .setPlaceholder('Sélectionnez un type à supprimer...')
                .addOptions(options)
        );

        await interaction.reply({ components: [row], ephemeral: true });
    }
};