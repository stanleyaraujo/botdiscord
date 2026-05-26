const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getQueue } = require("../../lib/music");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fila")
    .setDescription("Mostra as músicas na fila de reprodução."),
  async execute(interaction) {
    const queue = getQueue(interaction.guild.id);

    if (!queue || queue.songs.length === 0) {
      return interaction.reply({ content: "📭 A fila está vazia. Use `/play` para adicionar músicas!", ephemeral: true });
    }

    const atual = queue.songs[0];
    const proximas = queue.songs.slice(1, 11); // máximo 10 próximas

    const linhasProximas = proximas.length > 0
      ? proximas.map((s, i) => `\`${i + 2}.\` **${s.title}** — \`${s.duration}\` · ${s.requestedBy}`).join("\n")
      : "*Nenhuma música na fila.*";

    const embed = new EmbedBuilder()
      .setTitle("🎵 Fila de Músicas")
      .setColor("#FFE81F")
      .addFields(
        {
          name: `${queue.paused ? "⏸️ Pausado" : "🎶 Tocando agora"}`,
          value: `**${atual.title}** — \`${atual.duration}\` · Pedido por **${atual.requestedBy}**`,
        },
        {
          name: `📋 Próximas (${proximas.length} de ${queue.songs.length - 1})`,
          value: linhasProximas,
        }
      )
      .setFooter({
        text: `${queue.songs.length} música(s) na fila${queue.loop ? " · 🔁 Loop ativado" : ""}`,
      });

    if (queue.songs.length > 11) {
      embed.addFields({
        name: "\u200b",
        value: `*... e mais ${queue.songs.length - 11} música(s)*`,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
