const fs = require('fs');
const path = require('path');

function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');

    function readEvents(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                readEvents(fullPath);
            } else if (file.endsWith('.js')) {
                const event = require(fullPath);
                if (event.name) {
                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args, client));
                    } else {
                        client.on(event.name, (...args) => event.execute(...args, client));
                    }
                }
            }
        }
    }

    readEvents(eventsPath);
    console.log('Events chargés');
}

module.exports = { loadEvents };