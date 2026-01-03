const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = [
    {
        customId: 'preview_embed',
        async execute(interaction, client) {
            const guildData = db.getGuildData(interaction.guildId);
            const embedConfig = guildData.embedConfig || {};

            const previewEmbed = new EmbedBuilder()
                .setColor(embedConfig.color || config.colorP)
                .setTitle(embedConfig.title || '🎫 Créer un Ticket')
                .setDescription(embedConfig.description || 'Cliquez pour créer un ticket');

            if (embedConfig.footer) {
                previewEmbed.setFooter({ text: embedConfig.footer });
            }

            await interaction.reply({ embeds: [previewEmbed], ephemeral: true });
        }
    },
    {
        customId: 'reset_embed',
        async execute(interaction, client) {
            const guildData = db.getGuildData(interaction.guildId);
            guildData.embedConfig = {
                title: '🎫 Créer un Ticket',
                description: 'Cliquez sur le bouton ci-dessous pour créer un ticket',
                color: config.colorP,
                footer: 'Système de tickets',
                thumbnail: null
            };
            db.saveGuildData(interaction.guildId, guildData);

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ Embed réinitialisé')
                .setDescription('L\'embed a été ramené à ses paramètres par défaut');

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
    {
        customId: 'back_advanced',
        async execute(interaction, client) {
            const embed = new EmbedBuilder()
                .setColor(config.colorP)
                .setTitle('⚡ Configuration Avancée')
                .setDescription('Sélectionnez une option');

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('advanced_menu')
                    .setPlaceholder('Choisissez...')
                    .addOptions(
                        { label: '🎫 Gérer types de tickets', value: 'manage_types', emoji: '🎫' },
                        { label: '🎨 Personnaliser embed', value: 'customize_embed', emoji: '🎨' },
                        { label: '📋 Gérer panneaux', value: 'manage_panels', emoji: '📋' }
                    )
            );

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
    }
];

module.exports.forEach(handler => {
    module.exports[handler.customId] = handler;
});