const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getQueue } = require("../../lib/music");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tocando")
    .setDescription("Mostra a música que está tocando agora."),
  async execute(interaction) {
    const queue = getQueue(interaction.guild.id);

    if (!queue || !queue.playing || queue.songs.length === 0) {
      return interaction.reply({ content: "🔇 Nenhuma música tocando no momento.", ephemeral: true });
    }

    const song = queue.songs[0];

    // Barra de progresso estimada pelo tempo decorrido
    let progressoTxt = "";
    if (queue.startedAt && song.durationSec > 0) {
      const decorrido = Math.floor((Date.now() - queue.startedAt) / 1000);
      const pct = Math.min(decorrido / song.durationSec, 1);
      const blocos = Math.round(pct * 12);
      const barra = "▬".repeat(blocos) + "🔘" + "▬".repeat(12 - blocos);
      const tempoAtual = formatDuration(decorrido);
      progressoTxt = `\n\`${tempoAtual}\` ${barra} \`${song.duration}\``;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${queue.paused ? "⏸️ Pausado" : "🎶 Tocando Agora"}`)
      .setColor(queue.paused ? "#888888" : "#FFE81F")
      .setDescription(`**${song.title}**${progressoTxt}`)
      .addFields(
        { name: "⏱️ Duração", value: song.duration, inline: true },
        { name: "👤 Pedido por", value: song.requestedBy, inline: true },
        { name: "🔁 Loop", value: queue.loop ? "Ativado" : "Desativado", inline: true },
        { name: "📋 Na fila", value: `${queue.songs.length} música(s)`, inline: true },
      )
      .setFooter({ text: "Use /fila para ver todas as músicas" });

    await interaction.reply({ embeds: [embed] });
  },
};

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
