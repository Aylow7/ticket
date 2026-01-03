const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');
const path = require('path');
const fs = require('fs');

module.exports = {
    customId: 'create_panel_modal',
    async execute(interaction, client) {
        const name = interaction.fields.getTextInputValue('panel_name');
        const description = interaction.fields.getTextInputValue('panel_desc');

        const panelId = `panel_${Date.now()}_${interaction.user.id}`;

        if (!client.pendingPanels) {
            client.pendingPanels = new Map();
        }

        const panelData = {
            guildId: interaction.guildId,
            userId: interaction.user.id,
            name,
            description,
            step: 1
        };

        client.pendingPanels.set(panelId, panelData);
        console.log(`✅ Panel créé: ${panelId}`, client.pendingPanels.get(panelId));

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('📋 Configuration du panneau')
            .setDescription(`Panneau: **${name}**`)
            .addFields(
                { name: 'Étape 1/4', value: 'Sélectionnez le salon d\'envoi', inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId(`select_channel_${panelId}`)
                .setChannelTypes(ChannelType.GuildText)
                .setPlaceholder('Choisissez un salon...')
                .setMaxValues(1)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};