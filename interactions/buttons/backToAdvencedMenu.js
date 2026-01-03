const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    customId: 'back_to_advanced_menu',
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
                    { label: '🎨 Personnaliser embed', value: 'customize_embed', emoji: '🎨' }
                )
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};