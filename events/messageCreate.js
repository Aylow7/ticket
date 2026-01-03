const config = require('../config');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (!message.guild || message.author.bot) return;

        if (!message.content.startsWith(config.prefix)) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || 
                       client.commands.get(client.commandAliases.get(commandName));

        if (!command) return;

        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Map());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command.name);
        const cooldownAmount = (config.defaultSettings.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) return;
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
            await command.execute(client, message, args);
        } catch (error) {
            console.error(error);
            message.reply({ content: '❌ Erreur lors de l\'exécution de la commande' }).catch(() => {});
        }
    }
};