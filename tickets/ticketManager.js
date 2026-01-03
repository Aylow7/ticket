const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../utils/database');
const config = require('../config');

async function createTicket(client, guild, user, panelId, ticketType) {
    const guildData = db.getGuildData(guild.id);
    const panel = guildData.panels.find(p => p.id === panelId);

    if (!panel) return null;

    const channelName = `ticket-${user.username.toLowerCase()}`;
    const category = guild.channels.cache.get(panel.categoryId);

    if (!category) return null;

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            }
        ]
    });

    if (panel.supportRoles) {
        for (const roleId of panel.supportRoles) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                await channel.permissionOverwrites.create(role, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
            }
        }
    }

    const embed = new EmbedBuilder()
        .setColor(config.colorP)
        .setTitle(`Ticket #${channel.name}`)
        .setDescription(`Bienvenue ${user}, un modérateur vous répondra bientôt.`)
        .addFields(
            { name: 'Type', value: ticketType, inline: true },
            { name: 'Créé par', value: user.tag, inline: true }
        )
        .setFooter({ text: 'Utilisez les boutons ci-dessous pour gérer ce ticket' });

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`claim_${channel.id}`)
            .setLabel('Assigner')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`add_user_${channel.id}`)
            .setLabel('Ajouter membre')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`remove_user_${channel.id}`)
            .setLabel('Retirer membre')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`transcript_${channel.id}`)
            .setLabel('📄 Transcript')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`close_${channel.id}`)
            .setLabel('Fermer')
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({ embeds: [embed], components: [row] });

    db.saveTicket(channel.id, {
        id: channel.id,
        guildId: guild.id,
        panelId: panelId,
        userId: user.id,
        username: user.username,
        type: ticketType,
        claimed: false,
        claimedBy: null,
        createdAt: Date.now(),
        closed: false
    });

    return channel;
}

async function closeTicket(client, channel, reason = 'Fermé par modérateur') {
    const ticket = db.getTicket(channel.id);
    if (!ticket) return false;

    db.saveTicket(channel.id, { closed: true, closedAt: Date.now(), closedReason: reason });

    const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('Ticket fermé')
        .setDescription(`Raison: ${reason}`)
        .setFooter({ text: 'Ce canal sera supprimé dans 10 secondes' });

    await channel.send({ embeds: [embed] }).catch(() => {});

    setTimeout(() => {
        channel.delete().catch(() => {});
    }, 10000);

    return true;
}

async function claimTicket(client, channel, user) {
    const ticket = db.getTicket(channel.id);
    if (!ticket) return false;

    db.saveTicket(channel.id, { claimed: true, claimedBy: user.id, claimedAt: Date.now() });

    const embed = new EmbedBuilder()
        .setColor(config.colorP)
        .setTitle('Ticket assigné')
        .setDescription(`Assigné à ${user.tag}`);

    await channel.send({ embeds: [embed] }).catch(() => {});
    return true;
}

module.exports = { createTicket, closeTicket, claimTicket };