const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = [
    {
        customId: 'resend_panel_',
        async execute(interaction, client) {
            const panelId = interaction.customId.replace('resend_panel_', '');
            const guildData = db.getGuildData(interaction.guildId);
            const panel = guildData.panels.find(p => p.id === panelId);

            if (!panel) {
                return interaction.reply({ content: '❌ Panneau non trouvé', ephemeral: true });
            }

            const channel = interaction.guild.channels.cache.get(panel.channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ Salon non trouvé', ephemeral: true });
            }

            const embedConfig = guildData.embedConfig || {};
            const embed = new EmbedBuilder()
                .setColor(embedConfig.color || config.colorP)
                .setTitle(embedConfig.title || `🎫 ${panel.name}`)
                .setDescription(embedConfig.description || 'Créez un ticket pour obtenir de l\'aide');

            if (embedConfig.footer) {
                embed.setFooter({ text: embedConfig.footer });
            }

            const ticketTypes = guildData.ticketTypes || [];
            const filteredTypes = panel.types
                ? panel.types.map(typeId => ticketTypes.find(t => t.id === typeId)).filter(Boolean)
                : ticketTypes;

            const typeOptions = filteredTypes.map(t => ({
                label: t.name,
                value: t.id,
                emoji: t.emoji
            }));

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`create_ticket_${panelId}`)
                    .setPlaceholder('Sélectionnez un type de ticket...')
                    .addOptions(typeOptions)
            );

            await channel.send({ embeds: [embed], components: [row] });

            const successEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ Panneau renvoyé')
                .setDescription(`Le panneau **${panel.name}** a été renvoyé dans <#${panel.channelId}>`);

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        }
    },
    {
        customId: 'delete_panel_',
        async execute(interaction, client) {
            const panelId = interaction.customId.replace('delete_panel_', '');
            const guildData = db.getGuildData(interaction.guildId);
            const panel = guildData.panels.find(p => p.id === panelId);

            if (!panel) {
                return interaction.reply({ content: '❌ Panneau non trouvé', ephemeral: true });
            }

            guildData.panels = guildData.panels.filter(p => p.id !== panelId);
            db.saveGuildData(interaction.guildId, guildData);

            const embed = new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('✅ Panneau supprimé')
                .setDescription(`Le panneau **${panel.name}** a été supprimé`);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
    {
        customId: 'back_manage_panels',
        async execute(interaction, client) {
            const guildData = db.getGuildData(interaction.guildId);

            if (!guildData.panels || guildData.panels.length === 0) {
                return interaction.reply({
                    content: '❌ Aucun panneau créé',
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
    }
];

module.exports.forEach(handler => {
    module.exports[handler.customId] = handler;
});