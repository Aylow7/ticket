require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config');
const path = require('path');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.commandAliases = new Collection();
client.cooldowns = new Collection();
client.pendingPanels = new Map();
client.editingPanels = new Map();

const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');

console.log('🔧 Chargement des commandes...');
commandHandler.loadCommands(client);

console.log('📡 Chargement des événements...');
eventHandler.loadEvents(client);

console.log('✅ Structures initialisées');
console.log(`📋 ${client.commands.size} commandes chargées`);

process.on('unhandledRejection', err => console.error('❌ Unhandled Rejection:', err));
process.on('uncaughtException', err => console.error('❌ Uncaught Exception:', err));

client.login(config.token);