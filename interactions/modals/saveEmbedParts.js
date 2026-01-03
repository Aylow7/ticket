const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

const handlers = {
    save_embed_title: {
        customId: 'save_embed_title',
        async execute(interaction, client) {
            const value = interaction.fields.getTextInputValue('embed_value');
            const guildData = db.getGuildData(interaction.guildId);
            guildData.embedConfig.title = value;
            db.saveGuildData(interaction.guildId, guildData);

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ Titre modifié')
                .setDescription(`Nouveau titre: \`${value}\``);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
    save_embed_description: {
        customId: 'save_embed_description',
        async execute(interaction, client) {
            const value = interaction.fields.getTextInputValue('embed_value');
            const guildData = db.getGuildData(interaction.guildId);
            guildData.embedConfig.description = value;
            db.saveGuildData(interaction.guildId, guildData);

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ Description modifiée')
                .setDescription(`Nouvelle description: \`${value.substring(0, 100)}${value.length > 100 ? '...' : ''}\``);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
    save_embed_color: {
        customId: 'save_embed_color',
        async execute(interaction, client) {
            const value = interaction.fields.getTextInputValue('embed_value');

            if (!/^#[0-9A-F]{6}$/i.test(value)) {
                return interaction.reply({ content: '❌ Couleur hex invalide (format: #5865F2)', ephemeral: true });
            }

            const guildData = db.getGuildData(interaction.guildId);
            guildData.embedConfig.color = value;
            db.saveGuildData(interaction.guildId, guildData);

            const embed = new EmbedBuilder()
                .setColor(value)
                .setTitle('✅ Couleur modifiée')
                .setDescription(`Nouvelle couleur: ${value}`);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
    save_embed_footer: {
        customId: 'save_embed_footer',
        async execute(interaction, client) {
            const value = interaction.fields.getTextInputValue('embed_value');
            const guildData = db.getGuildData(interaction.guildId);
            guildData.embedConfig.footer = value;
            db.saveGuildData(interaction.guildId, guildData);

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ Pied de page modifié')
                .setDescription(`Nouveau pied de page: \`${value}\``);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};

module.exports = {
    name: 'modalSubmit',
    customIds: ['save_embed_title', 'save_embed_description', 'save_embed_color', 'save_embed_footer'],
    async execute(interaction, client) {
        const handler = handlers[interaction.customId];
        if (handler) {
            await handler.execute(interaction, client);
        }
    }
};

Object.values(handlers).forEach(h => {
    module.exports[h.customId] = h;
});