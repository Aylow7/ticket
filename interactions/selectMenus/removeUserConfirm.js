const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    customId: 'remove_user_confirm_',
    async execute(interaction, client) {
        const ticketId = interaction.customId.replace('remove_user_confirm_', '');
        const channel = interaction.guild.channels.cache.get(ticketId);

        if (!channel) {
            return interaction.reply({ content: '❌ Salon non trouvé', ephemeral: true });
        }

        const users = interaction.values;
        let removed = 0;

        for (const userId of users) {
            try {
                await channel.permissionOverwrites.delete(userId);
                removed++;
            } catch (error) {
                console.error(error);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('✅ Utilisateurs retirés')
            .setDescription(`${removed} utilisateur(s) retiré(s) du ticket`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};