const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'edit_panel_category_',
    async execute(interaction, client) {
        const panelId = interaction.customId.replace('edit_panel_category_', '');
        
        if (!client.editingPanels) client.editingPanels = new Map();
        const editing = client.editingPanels.get(panelId);

        if (!editing) {
            return interaction.reply({ content: '❌ Session d\'édition expirée', ephemeral: true });
        }

        editing.categoryId = interaction.values[0];

        const guildData = db.getGuildData(interaction.guildId);
        const panel = guildData.panels.find(p => p.id === panelId);

        if (panel) {
            panel.channelId = editing.channelId;
            panel.categoryId = editing.categoryId;
            db.saveGuildData(interaction.guildId, guildData);
        }

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('✅ Panneau modifié')
            .setDescription(`Le panneau **${editing.name}** a été mis à jour`)
            .addFields(
                { name: 'Salon d\'envoi', value: `<#${editing.channelId}>`, inline: true },
                { name: 'Catégorie', value: `<#${editing.categoryId}>`, inline: true }
            );

        client.editingPanels.delete(panelId);

        await interaction.update({ embeds: [embed], components: [] });
    }
};