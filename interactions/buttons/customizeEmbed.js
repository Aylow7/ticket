const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'customize_embed',
    async execute(interaction, client) {
        const guildData = db.getGuildData(interaction.guildId);
        
        if (!guildData.embedConfig) {
            guildData.embedConfig = {
                title: '🎫 Créer un Ticket',
                description: 'Cliquez sur le bouton ci-dessous pour créer un ticket',
                color: config.colorP,
                footer: 'Système de tickets',
                thumbnail: null
            };
            db.saveGuildData(interaction.guildId, guildData);
        }

        const embedConfig = guildData.embedConfig;
        const previewEmbed = new EmbedBuilder()
            .setColor(embedConfig.color)
            .setTitle(embedConfig.title)
            .setDescription(embedConfig.description)
            .setFooter({ text: embedConfig.footer });

        if (embedConfig.thumbnail) {
            previewEmbed.setThumbnail(embedConfig.thumbnail);
        }

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('🎨 Personnalisation d\'Embed')
            .setDescription('Modifiez l\'apparence du panneau de tickets')
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
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('edit_embed_footer')
                .setLabel('✏️ Pied de page')
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
                .setCustomId('back_advanced')
                .setLabel('⬅️ Retour')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [row, row2], 
            ephemeral: true 
        });
    }
};