const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (interaction.isButton()) {
                const buttonsPath = path.join(__dirname, '../interactions/buttons');
                const files = fs.readdirSync(buttonsPath).filter(f => f.endsWith('.js'));

                for (const file of files) {
                    const handler = require(path.join(buttonsPath, file));
                    if (handler.customId && interaction.customId.startsWith(handler.customId)) {
                        await handler.execute(interaction, client);
                        return;
                    }
                }
            }

            if (interaction.isStringSelectMenu() || interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu() || interaction.isUserSelectMenu()) {
                const menusPath = path.join(__dirname, '../interactions/selectMenus');
                const files = fs.readdirSync(menusPath).filter(f => f.endsWith('.js'));

                for (const file of files) {
                    const handler = require(path.join(menusPath, file));
                    if (handler.customId && interaction.customId.startsWith(handler.customId)) {
                        await handler.execute(interaction, client);
                        return;
                    }
                }
            }

            if (interaction.isModalSubmit()) {
                const modalsPath = path.join(__dirname, '../interactions/modals');
                const files = fs.readdirSync(modalsPath).filter(f => f.endsWith('.js'));

                for (const file of files) {
                    const handler = require(path.join(modalsPath, file));
                    if (handler.customId && interaction.customId.startsWith(handler.customId)) {
                        await handler.execute(interaction, client);
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Interaction error:', error);
            if (!interaction.replied) {
                interaction.reply({ content: '❌ Erreur lors du traitement', ephemeral: true }).catch(() => {});
            }
        }
    }
};