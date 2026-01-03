const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'edit_panel_',
    async execute(interaction, client) {
        const panelId = interaction.customId.replace('edit_panel_', '');
        const guildData = db.getGuildData(interaction.guildId);
        const panel = guildData.panels.find(p => p.id === panelId);

        if (!panel) {
            return interaction.reply({ content: '❌ Panneau non trouvé', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('✏️ Modifier le panneau')
            .setDescription(`Panneau: **${panel.name}**`)
            .addFields(
                { name: 'Étape 1/2', value: 'Sélectionnez le nouveau salon d\'envoi', inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId(`edit_panel_channel_${panelId}`)
                .setChannelTypes(ChannelType.GuildText)
                .setPlaceholder('Choisissez un salon...')
                .setMaxValues(1)
        );

        if (!client.editingPanels) client.editingPanels = new Map();
        client.editingPanels.set(panelId, { ...panel });

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};