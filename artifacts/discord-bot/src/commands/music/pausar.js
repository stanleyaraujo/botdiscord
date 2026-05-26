const { SlashCommandBuilder } = require("discord.js");
const { pauseMusic, resumeMusic, getQueue } = require("../../lib/music");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pausar")
    .setDescription("Pausa ou retoma a música atual."),
  async execute(interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: "🔇 Você precisa estar em um canal de voz!", ephemeral: true });
    }

    const queue = getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
      return interaction.reply({ content: "❌ Não há nenhuma música tocando.", ephemeral: true });
    }

    if (queue.paused) {
      const ok = resumeMusic(interaction.guild.id);
      if (ok) return interaction.reply("▶️ Música retomada!");
      return interaction.reply({ content: "❌ Não foi possível retomar.", ephemeral: true });
    } else {
      const ok = pauseMusic(interaction.guild.id);
      if (ok) return interaction.reply("⏸️ Música pausada. Use `/pausar` novamente para retomar.");
      return interaction.reply({ content: "❌ Não foi possível pausar.", ephemeral: true });
    }
  },
};
