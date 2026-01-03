const { EmbedBuilder, ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    customId: 'select_types_',
    async execute(interaction, client) {
        try {
            const panelId = interaction.customId.replace('select_types_', '');
            const pending = client.pendingPanels.get(panelId);

            if (!pending) {
                console.error(`❌ Panel non trouvé: ${panelId}`);
                return interaction.reply({ 
                    content: '❌ Configuration expirée - Recommencez avec +ticket-config', 
                    ephemeral: true 
                });
            }

            pending.types = interaction.values;
            pending.step = 4;
            client.pendingPanels.set(panelId, pending);

            console.log(`✅ Types sélectionnés:`, interaction.values);

            const typeList = interaction.values.map(t => `• ${t.charAt(0).toUpperCase() + t.slice(1)}`).join('\n');

            const embed = new EmbedBuilder()
                .setColor(config.colorP)
                .setTitle('📋 Configuration du panneau')
                .setDescription(`Panneau: **${pending.name}**`)
                .addFields(
                    { name: 'Salon d\'envoi', value: `<#${pending.channelId}>`, inline: false },
                    { name: 'Catégorie', value: `<#${pending.categoryId}>`, inline: false },
                    { name: 'Types de tickets', value: typeList, inline: false },
                    { name: 'Étape 4/4', value: 'Sélectionnez les rôles support (optionnel)', inline: false }
                );

            const row = new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId(`select_roles_${panelId}`)
                    .setPlaceholder('Rôles support...')
                    .setMinValues(0)
                    .setMaxValues(5)
            );

            await interaction.update({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('selectTypes error:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erreur: ' + error.message, ephemeral: true });
            }
        }
    }
};