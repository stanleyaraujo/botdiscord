const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { MISSOES, getUserMissoes } = require("../../lib/missions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("missoes")
    .setDescription("Lista todas as missões disponíveis e seu status."),
  async execute(interaction) {
    const data = await getUserMissoes(interaction.guild.id, interaction.user.id);
    const ativasIds = data.ativas.map((a) => a.id);
    const completasIds = data.completas;

    const linhas = MISSOES.map((m) => {
      let status;
      if (completasIds.includes(m.id)) {
        status = "✅ Concluída";
      } else if (ativasIds.includes(m.id)) {
        const ativa = data.ativas.find((a) => a.id === m.id);
        status = `🔄 Em andamento (${ativa.progresso}/${m.meta})`;
      } else {
        status = "🔒 Disponível";
      }

      return `${m.icone} **${m.nome}** ${m.dificuldade}\n> ${m.objetivo} · 🏆 ${m.recompensa.xp} XP\n> ${status}`;
    });

    const embed = new EmbedBuilder()
      .setTitle("📋 Missões da Ordem Jedi")
      .setColor("#FFE81F")
      .setDescription(linhas.join("\n\n"))
      .setFooter({ text: "Use /aceitar <id> para começar • Máximo de 3 missões ativas" });

    // Adicionar lista de IDs para facilitar
    embed.addFields({
      name: "📌 IDs para aceitar",
      value: MISSOES.map((m) => `\`${m.id}\` — ${m.nome}`).join("\n"),
    });

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
