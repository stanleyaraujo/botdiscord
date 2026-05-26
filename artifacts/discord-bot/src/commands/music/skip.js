const { SlashCommandBuilder } = require("discord.js");
const { skipSong } = require("../../lib/music");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Pula a música atual e toca a próxima da fila."),
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: "🔇 Você precisa estar em um canal de voz!", ephemeral: true });
    }

    const skipped = skipSong(interaction.guild.id);

    if (skipped === "nada") {
      return interaction.reply({ content: "❌ Não há nenhuma música tocando no momento.", ephemeral: true });
    }

    await interaction.reply(`⏭️ Pulando: **${skipped.title}**`);
  },
};
