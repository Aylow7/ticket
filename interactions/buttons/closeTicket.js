const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    customId: 'close_',
    async execute(interaction, client) {
        const ticketId = interaction.customId.replace('close_', '');
        const ticket = db.getTicket(ticketId);

        if (!ticket) {
            return interaction.reply({ content: '❌ Ticket non trouvé', ephemeral: true });
        }

        const guildData = db.getGuildData(interaction.guildId);
        const panel = guildData.panels.find(p => p.id === ticket.panelId);

        const isSupport = panel?.supportRoles?.some(r => interaction.member.roles.cache.has(r)) || 
                         interaction.member.permissions.has('ManageGuild') ||
                         ticket.userId === interaction.user.id;

        if (!isSupport) {
            return interaction.reply({ content: '❌ Vous n\'avez pas la permission', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`close_reason_${ticketId}`)
            .setTitle('Fermer le ticket');

        const reasonInput = new TextInputBuilder()
            .setCustomId('close_reason')
            .setLabel('Raison de fermeture')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setPlaceholder('Optionnel...');

        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

        await interaction.showModal(modal);
    }
};