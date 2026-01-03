const { ticketManager } = require('../../tickets/ticketManager');
const db = require('../../utils/database');

module.exports = {
    customId: 'create_ticket_',
    async execute(interaction, client) {
        const panelId = interaction.customId.replace('create_ticket_', '');
        const ticketType = interaction.values[0];

        const guildData = db.getGuildData(interaction.guildId);
        const panel = guildData.panels.find(p => p.id === panelId);

        if (!panel) {
            return interaction.reply({ content: '❌ Panneau non trouvé', ephemeral: true });
        }

        const openTickets = db.getTicketsByGuild(interaction.guildId)
            .filter(t => t.userId === interaction.user.id && !t.closed);

        if (openTickets.length >= (guildData.settings?.maxOpenTickets || 5)) {
            return interaction.reply({
                content: `❌ Vous avez trop de tickets ouverts (${openTickets.length}/5)`,
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const { createTicket } = require('../../tickets/ticketManager');
            const channel = await createTicket(client, interaction.guild, interaction.user, panelId, ticketType);

            if (channel) {
                await interaction.editReply({
                    content: `✅ Ticket créé: ${channel}`,
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: '❌ Erreur lors de la création du ticket',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue',
                ephemeral: true
            });
        }
    }
};