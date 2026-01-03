const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'manage_ticket_types',
    async execute(interaction, client) {
        const guildData = db.getGuildData(interaction.guildId);
        
        if (!guildData.ticketTypes) {
            guildData.ticketTypes = [
                { id: 'support', name: 'Support', emoji: '🆘', color: '#5865F2' },
                { id: 'report', name: 'Report', emoji: '⚠️', color: '#FFA500' },
                { id: 'achat', name: 'Achat', emoji: '🛒', color: '#2ECC71' }
            ];
            db.saveGuildData(interaction.guildId, guildData);
        }

        const typeList = guildData.ticketTypes
            .map((t, i) => `${i + 1}. ${t.emoji} **${t.name}** (\`${t.id}\`)`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('🎫 Gestion des Types de Tickets')
            .setDescription('Actuellement ' + guildData.ticketTypes.length + ' type(s)')
            .addFields(
                { name: 'Types actuels', value: typeList || 'Aucun', inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('add_ticket_type')
                .setLabel('➕ Ajouter un type')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('edit_ticket_type')
                .setLabel('✏️ Modifier un type')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('delete_ticket_type')
                .setLabel('🗑️ Supprimer un type')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('back_advanced')
                .setLabel('⬅️ Retour')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};