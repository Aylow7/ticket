const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'ticket_manage_panels',
    async execute(interaction, client) {
        const guildData = db.getGuildData(interaction.guildId);

        if (!guildData.panels || guildData.panels.length === 0) {
            return interaction.reply({
                content: '❌ Aucun panneau créé. Créez-en un avec "➕ Créer un panneau"',
                ephemeral: true
            });
        }

        const panelList = guildData.panels
            .map((p, i) => `${i + 1}. **${p.name}** (Salon: <#${p.channelId}>)`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('📋 Gestion des Panneaux')
            .setDescription(`Actuellement ${guildData.panels.length} panneau(x)`)
            .addFields({ name: 'Panneaux actuels', value: panelList, inline: false });

        const options = guildData.panels.map((p, i) => ({
            label: p.name,
            value: p.id,
            description: `Salon: #${p.channelId}`,
            emoji: '📋'
        }));

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_panel_action')
                .setPlaceholder('Choisissez un panneau...')
                .addOptions(options)
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};