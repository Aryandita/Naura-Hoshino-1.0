const { Events, EmbedBuilder } = require('discord.js');
const env = require('../../../../config/env');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            // [MIDDLEWARE 1] Cek apakah fitur ini untuk Developer Saja
            if (command.developerOnly && !env.OWNER_IDS.includes(interaction.user.id)) {
                return interaction.reply({ 
                    content: '❌ Maaf, command ini hanya untuk Developer Aryan.', 
                    ephemeral: true 
                });
            }

            // Eksekusi Command Utama
            await command.execute(interaction, client);

        } catch (error) {
            console.error(`\x1b[41m\x1b[37m 💥 COMMAND ERROR \x1b[0m \x1b[31m[${command.data.name}]\x1b[0m`, error);
            
            const errEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('❌ Terjadi kesalahan internal saat memproses perintah ini.');

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errEmbed], ephemeral: true }).catch(()=>{});
            } else {
                await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(()=>{});
            }
        }
    }
};
