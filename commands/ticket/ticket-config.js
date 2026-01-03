const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    name: 'ticket-config',
    description: 'Configurez le système de tickets',
    aliases: ['tc'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('ManageGuild')) {
            return message.reply('❌ Vous n\'avez pas la permission');
        }

        const guildData = db.getGuildData(message.guildId);

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('⚙️ Configuration des Tickets')
            .setDescription('Gérez les panneaux et paramètres de votre système de tickets')
            .addFields(
                { name: 'Panneaux', value: guildData.panels.length + ' panel(s) créé(s)', inline: true },
                { name: 'Status', value: guildData.enabled !== false ? '✅ Activé' : '❌ Désactivé', inline: true }
            );

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_create_panel')
                .setLabel('➕ Créer un panneau')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('ticket_manage_panels')
                .setLabel('📋 Gérer les panneaux')
                .setStyle(ButtonStyle.Secondary),
        );

        await message.reply({ embeds: [embed], components: [row1], allowedMentions: { repliedUser: false } });
    }
};