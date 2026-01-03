const { EmbedBuilder } = require('discord.js');
const config = require('../../config');
const db = require('../../utils/database');

module.exports = {
    customId: 'confirm_delete_type',
    async execute(interaction, client) {
        const typeId = interaction.values[0];
        const guildData = db.getGuildData(interaction.guildId);

        const type = guildData.ticketTypes.find(t => t.id === typeId);
        if (!type) {
            return interaction.reply({ content: '❌ Type non trouvé', ephemeral: true });
        }

        guildData.ticketTypes = guildData.ticketTypes.filter(t => t.id !== typeId);
        db.saveGuildData(interaction.guildId, guildData);

        const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('✅ Type supprimé')
            .setDescription(`${type.emoji} **${type.name}** a été supprimé`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};