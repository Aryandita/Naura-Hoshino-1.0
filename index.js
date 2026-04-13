require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const path = require('path');

// Memanggil Handler Modular Baru
const { CommandHandler } = require('./src/core/handlers/CommandHandler');
const { EventHandler } = require('./src/core/handlers/EventHandler');
const { connectToDatabase } = require('./src/managers/dbManager'); 
const env = require('./src/config/env');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,   
        GatewayIntentBits.GuildMembers,
    ]
});

// Koleksi Data Global
client.commands = new Collection();
client.cooldowns = new Collection();

async function startBot() {
    console.log('\n\x1b[46m\x1b[30m ⚙️ BOOT SEQUENCE \x1b[0m \x1b[36mMemulai arsitektur modular Naura v1.0.0...\x1b[0m\n');

    // 1. Sambungkan ke MySQL Database
    try {
        await connectToDatabase();
    } catch (error) {
        console.log('\x1b[43m\x1b[30m ⚠️ WARNING \x1b[0m \x1b[33mDatabase offline. Menjalankan bot dalam mode terbatas.\x1b[0m');
    }

    // 2. Muat Command & Event dari folder 'addons'
    const addonsPath = path.join(__dirname, 'src', 'addons');
    const commandHandler = new CommandHandler(client, addonsPath);
    const eventHandler = new EventHandler(client, addonsPath);

    await commandHandler.load();
    await eventHandler.load();

    // 3. Login ke Discord
    await client.login(env.TOKEN).catch(err => {
        console.error('\x1b[41m\x1b[37m 💥 FATAL ERROR \x1b[0m \x1b[31mGagal login ke Discord. Cek Token Anda!\x1b[0m', err);
    });
}

// Sistem Anti-Crash Darurat
process.on('unhandledRejection', (reason) => {
    if (reason && reason.code === 10062) return; 
    console.error('\x1b[41m\x1b[37m 💥 ANTI-CRASH \x1b[0m \x1b[31mUnhandled Rejection:\x1b[0m', reason);
});
process.on('uncaughtException', (err) => {
    console.error('\x1b[41m\x1b[37m 💥 ANTI-CRASH \x1b[0m \x1b[31mUncaught Exception:\x1b[0m', err);
});

startBot();
