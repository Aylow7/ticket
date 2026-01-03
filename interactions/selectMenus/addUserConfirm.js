const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    customId: 'add_user_confirm_',
    async execute(interaction, client) {
        const ticketId = interaction.customId.replace('add_user_confirm_', '');
        const channel = interaction.guild.channels.cache.get(ticketId);

        if (!channel) {
            return interaction.reply({ content: '❌ Salon non trouvé', ephemeral: true });
        }

        const users = interaction.values;
        let added = 0;

        for (const userId of users) {
            try {
                const user = await client.users.fetch(userId);
                await channel.permissionOverwrites.create(user, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
                added++;
            } catch (error) {
                console.error(error);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(config.colorP)
            .setTitle('✅ Utilisateurs ajoutés')
            .setDescription(`${added} utilisateur(s) ajouté(s) au ticket`);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};