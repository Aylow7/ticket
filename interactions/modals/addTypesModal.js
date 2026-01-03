const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'add_type_modal',
    async execute(interaction, client) {
        const typeId = interaction.fields.getTextInputValue('type_id').toLowerCase();
        const typeName = interaction.fields.getTextInputValue('type_name');
        const typeEmoji = interaction.fields.getTextInputValue('type_emoji');
        const typeColor = interaction.fields.getTextInputValue('type_color');

        if (!/^#[0-9A-F]{6}$/i.test(typeColor)) {
            return interaction.reply({ content: '❌ Couleur hex invalide (format: #FF0000)', ephemeral: true });
        }

        if (typeId.length < 2 || typeId.length > 20) {
            return interaction.reply({ content: '❌ ID entre 2 et 20 caractères', ephemeral: true });
        }

        const guildData = db.getGuildData(interaction.guildId);
        if (!guildData.ticketTypes) guildData.ticketTypes = [];

        if (guildData.ticketTypes.some(t => t.id === typeId)) {
            return interaction.reply({ content: '❌ Ce type existe déjà', ephemeral: true });
        }

        guildData.ticketTypes.push({
            id: typeId,
            name: typeName,
            emoji: typeEmoji,
            color: typeColor
        });

        db.saveGuildData(interaction.guildId, guildData);

        const embed = new EmbedBuilder()
            .setColor(typeColor)
            .setTitle('✅ Type de ticket créé')
            .setDescription(`${typeEmoji} **${typeName}**`)
            .addFields({ name: 'ID', value: `\`${typeId}\`` });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};