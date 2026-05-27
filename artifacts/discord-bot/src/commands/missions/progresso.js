const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getUserMissoes, getMissaoById } = require("../../lib/missions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("progresso")
    .setDescription("Mostra o progresso das suas missões ativas."),
  async execute(interaction) {
    const data = await getUserMissoes(interaction.guild.id, interaction.user.id);

    if (data.ativas.length === 0) {
      return interaction.reply({
        content: "📭 Você não tem missões ativas. Use `/missoes` para ver as disponíveis e `/aceitar` para começar!",
        ephemeral: true,
      });
    }

    const campos = data.ativas.map((ativa) => {
      const missao = getMissaoById(ativa.id);
      if (!missao) return null;

      const pct = Math.min(ativa.progresso / missao.meta, 1);
      const blocos = Math.round(pct * 10);
      const barra = "█".repeat(blocos) + "░".repeat(10 - blocos);
      const completa = ativa.progresso >= missao.meta;

      return {
        name: `${missao.icone} ${missao.nome} ${completa ? "✅ PRONTA!" : ""}`,
        value:
          `${missao.objetivo}\n` +
          `\`[${barra}]\` ${ativa.progresso}/${missao.meta}\n` +
          `🏆 Recompensa: **${missao.recompensa.xp} XP**` +
          (completa ? "\n> Use `/entregar` para resgatar!" : ""),
      };
    }).filter(Boolean);

    const completasCount = data.completas.length;

    const embed = new EmbedBuilder()
      .setTitle(`🗺️ Missões Ativas — ${interaction.user.username}`)
      .setColor("#FFE81F")
      .addFields(...campos)
      .setFooter({ text: `${completasCount} missão(ões) concluída(s) no total · /entregar para resgatar recompensas` });

    await interaction.reply({ embeds: [embed] });
  },
};
