const { SlashCommandBuilder } = require("discord.js");
const { toggleLoop } = require("../../lib/music");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Ativa ou desativa a repetição da música atual."),
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: "🔇 Você precisa estar em um canal de voz!", ephemeral: true });
    }

    const estado = toggleLoop(interaction.guild.id);

    if (estado === null) {
      return interaction.reply({ content: "❌ Não há nenhuma música tocando.", ephemeral: true });
    }

    await interaction.reply(
      estado
        ? "🔁 Loop **ativado** — a música atual vai repetir."
        : "➡️ Loop **desativado** — a fila vai continuar normalmente."
    );
  },
};
