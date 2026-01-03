const fs = require('fs');
const path = require('path');

function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');

    function readCommands(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                readCommands(fullPath);
            } else if (file.endsWith('.js')) {
                const command = require(fullPath);
                if (command.name) {
                    client.commands.set(command.name, command);
                    if (command.aliases) {
                        command.aliases.forEach(alias => {
                            client.commandAliases.set(alias, command.name);
                        });
                    }
                }
            }
        }
    }

    readCommands(commandsPath);
    console.log(`Chargé ${client.commands.size} commandes`);
}

module.exports = { loadCommands };