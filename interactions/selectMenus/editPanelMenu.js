const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const config = require('../../config');

module.exports = {
    customId: 'edit_panel_channel_',
    async execute(interaction, client) {
        const panelId = interaction.customId.replace('edit_panel_channel_', '');
        
        if (!client.editingPanels) client.editingPanels = new Map();
        const editing = client.editingPanels.get(panelId);

        if (!editing) {
            return interaction.reply({ content: '❌ Session d\'édition expirée', ephemeral: true });
        }

        editing.channelId = interaction.values[0];
        client.editingPanels.set(panelId, editing);

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('✏️ Modifier le panneau')
            .setDescription(`Panneau: **${editing.name}**`)
            .addFields(
                { name: 'Salon d\'envoi', value: `<#${editing.channelId}>`, inline: false },
                { name: 'Étape 2/2', value: 'Sélectionnez la catégorie des tickets', inline: false }
            );

        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId(`edit_panel_category_${panelId}`)
                .setChannelTypes(ChannelType.GuildCategory)
                .setPlaceholder('Choisissez une catégorie...')
                .setMaxValues(1)
        );

        await interaction.update({ embeds: [embed], components: [row] });
    }
};