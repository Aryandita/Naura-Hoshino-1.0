const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const env = require('../../../config/env');

class CommandHandler {
    constructor(client, addonsPath) {
        this.client = client;
        this.addonsPath = addonsPath;
    }

    async load() {
        let commandsArray = [];
        let loadedCount = 0;

        // Pastikan folder addons ada
        if (!fs.existsSync(this.addonsPath)) fs.mkdirSync(this.addonsPath, { recursive: true });
        const addons = fs.readdirSync(this.addonsPath);

        for (const addon of addons) {
            const commandsPath = path.join(this.addonsPath, addon, 'commands');
            if (!fs.existsSync(commandsPath)) continue;

            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                delete require.cache[require.resolve(filePath)]; // Clear cache
                const command = require(filePath);
                
                if ('data' in command && 'execute' in command) {
                    command.addon = addon; // Tandai command ini milik addon mana
                    this.client.commands.set(command.data.name, command);
                    commandsArray.push(command.data.toJSON());
                    loadedCount++;
                }
            }
        }

        console.log(`\x1b[44m\x1b[37m 📂 COMMANDS \x1b[0m \x1b[34mMemuat ${loadedCount} command modular.\x1b[0m`);

        // Daftarkan ke Discord
        const rest = new REST({ version: '10' }).setToken(env.TOKEN);
        try {
            await rest.put(Routes.applicationCommands(env.CLIENT_ID), { body: commandsArray });
            console.log(`\x1b[42m\x1b[30m ✨ SUCCESS \x1b[0m \x1b[32mSlash Commands berhasil disinkronisasi ke API Discord.\x1b[0m`);
        } catch (error) {
            console.error('\x1b[41m\x1b[37m 💥 ERROR \x1b[0m \x1b[31mGagal mendaftarkan commands:\x1b[0m', error);
        }
    }
}

module.exports = { CommandHandler };
