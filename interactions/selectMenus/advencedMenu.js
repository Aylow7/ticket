const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'advanced_menu',
    async execute(interaction, client) {
        const choice = interaction.values[0];

        if (choice === 'manage_types') {
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
                .addFields({ name: 'Types actuels', value: typeList || 'Aucun', inline: false });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('add_ticket_type')
                    .setLabel('➕ Ajouter un type')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('delete_ticket_type')
                    .setLabel('🗑️ Supprimer un type')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('back_to_advanced_menu')
                    .setLabel('⬅️ Retour')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        } else if (choice === 'customize_embed') {
            const guildData = db.getGuildData(interaction.guildId);
            
            if (!guildData.embedConfig) {
                guildData.embedConfig = {
                    title: '🎫 Créer un Ticket',
                    description: 'Cliquez sur le bouton ci-dessous pour créer un ticket',
                    color: config.colorP,
                    footer: 'Système de tickets'
                };
                db.saveGuildData(interaction.guildId, guildData);
            }

            const embedConfig = guildData.embedConfig;
            const embed = new EmbedBuilder()
                .setColor(config.colorP)
                .setTitle('🎨 Personnalisation d\'Embed')
                .setDescription('Modifiez l\'apparence du panneau')
                .addFields(
                    { name: 'Titre', value: `\`${embedConfig.title}\``, inline: true },
                    { name: 'Couleur', value: embedConfig.color, inline: true },
                    { name: 'Pied de page', value: `\`${embedConfig.footer}\``, inline: false }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('edit_embed_title')
                    .setLabel('✏️ Titre')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('edit_embed_description')
                    .setLabel('✏️ Description')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('edit_embed_color')
                    .setLabel('🎨 Couleur')
                    .setStyle(ButtonStyle.Primary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('preview_embed')
                    .setLabel('👁️ Aperçu')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('reset_embed')
                    .setLabel('🔄 Réinitialiser')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('back_to_advanced_menu')
                    .setLabel('⬅️ Retour')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.reply({ embeds: [embed], components: [row, row2], ephemeral: true });
        }
    }
};