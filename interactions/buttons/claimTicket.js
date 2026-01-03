const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'claim_',
    async execute(interaction, client) {
        const ticketId = interaction.customId.replace('claim_', '');
        const ticket = db.getTicket(ticketId);

        if (!ticket) {
            return interaction.reply({ content: '❌ Ticket non trouvé', ephemeral: true });
        }

        const guildData = db.getGuildData(interaction.guildId);
        const panel = guildData.panels.find(p => p.id === ticket.panelId);

        if (panel?.supportRoles && panel.supportRoles.length > 0) {
            const hasRole = interaction.member.roles.cache.some(r => panel.supportRoles.includes(r.id));
            if (!hasRole && !interaction.member.permissions.has('ManageGuild')) {
                return interaction.reply({ content: '❌ Vous n\'avez pas la permission', ephemeral: true });
            }
        }

        if (ticket.claimed) {
            return interaction.reply({
                content: `❌ Ce ticket est déjà assigné à <@${ticket.claimedBy}>`,
                ephemeral: true
            });
        }

        db.saveTicket(ticketId, {
            claimed: true,
            claimedBy: interaction.user.id,
            claimedAt: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('✅ Ticket assigné')
            .setDescription(`Assigné à ${interaction.user.tag}`);

        await interaction.reply({ embeds: [embed] });
    }
};