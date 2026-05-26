const { SlashCommandBuilder } = require("discord.js");
const { stopMusic } = require("../../lib/music");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Para a música e limpa a fila."),
  async execute(interaction) {
    const parou = stopMusic(interaction.guild.id);
    if (!parou) {
      return interaction.reply({
        content: "🔇 Não há nada tocando no momento.",
        ephemeral: true,
      });
    }
    await interaction.reply("⏹️ Música parada. Silêncio no espaço sideral.");
  },
};
