const fs = require('fs');
const path = require('path');

class EventHandler {
    constructor(client, addonsPath) {
        this.client = client;
        this.addonsPath = addonsPath;
    }

    async load() {
        let eventCount = 0;
        if (!fs.existsSync(this.addonsPath)) return;
        const addons = fs.readdirSync(this.addonsPath);

        for (const addon of addons) {
            const eventsPath = path.join(this.addonsPath, addon, 'events');
            if (!fs.existsSync(eventsPath)) continue;

            const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                const filePath = path.join(eventsPath, file);
                delete require.cache[require.resolve(filePath)];
                const event = require(filePath);
                
                if (event.name && event.execute) {
                    if (event.once) {
                        this.client.once(event.name, (...args) => event.execute(...args, this.client));
                    } else {
                        this.client.on(event.name, (...args) => event.execute(...args, this.client));
                    }
                    eventCount++;
                }
            }
        }
        console.log(`\x1b[44m\x1b[37m 📂 EVENTS \x1b[0m \x1b[34m${eventCount} Event modular siap merespons.\x1b[0m`);
    }
}

module.exports = { EventHandler };
