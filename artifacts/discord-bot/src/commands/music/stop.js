const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Para a música e limpa a fila."),
  async execute(interaction) {
    const distube = interaction.client.distube;
    if (!distube) {
      return interaction.reply({
        content: "⚠️ O player de música não está disponível no momento.",
        ephemeral: true,
      });
    }

    const queue = distube.getQueue(interaction.guild.id);
    if (!queue) {
      return interaction.reply("🔇 Não há nada tocando no momento.");
    }

    await queue.stop();
    await interaction.reply("⏹️ Música parada. Silêncio no espaço sideral.");
  },
};
