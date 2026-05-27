const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { MISSOES, getMissaoById, getUserMissoes, saveUserMissoes, trackProgress } = require("../../lib/missions");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const TITULOS_XP = [
  { min: 1,  max: 2,  titulo: "🌱 Iniciante da Ordem" },
  { min: 3,  max: 5,  titulo: "📚 Padawan" },
  { min: 6,  max: 9,  titulo: "🌟 Cavaleiro Jedi" },
  { min: 10, max: 14, titulo: "⚔️ Mestre Jedi" },
  { min: 15, max: 19, titulo: "🔵 Membro do Conselho Jedi" },
  { min: 20, max: Infinity, titulo: "👑 Grande Mestre da Ordem" },
];
function getTitulo(level) {
  for (const t of TITULOS_XP) {
    if (level >= t.min && level <= t.max) return t.titulo;
  }
  return "🌱 Iniciante da Ordem";
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("entregar")
    .setDescription("Entrega uma missão concluída e recebe a recompensa.")
    .addStringOption((opt) =>
      opt
        .setName("id")
        .setDescription("ID da missão para entregar (veja em /progresso)")
        .setRequired(true)
        .addChoices(...MISSOES.map((m) => ({ name: `${m.icone} ${m.nome}`, value: m.id })))
    ),
  async execute(interaction) {
    const id = interaction.options.getString("id");
    const missao = getMissaoById(id);

    if (!missao) {
      return interaction.reply({ content: "❌ Missão não encontrada.", ephemeral: true });
    }

    const mData = await getUserMissoes(interaction.guild.id, interaction.user.id);

    if (mData.completas.includes(id)) {
      return interaction.reply({ content: `✅ Você já resgatou a recompensa de **${missao.nome}**.`, ephemeral: true });
    }

    const ativa = mData.ativas.find((a) => a.id === id);

    if (!ativa) {
      return interaction.reply({ content: `❌ Você não aceitou esta missão. Use \`/aceitar\` primeiro.`, ephemeral: true });
    }

    // Missão de nível — verifica nível atual
    if (missao.tipo === "nivel") {
      const xpKey = `xp_${interaction.guild.id}_${interaction.user.id}`;
      const xpData = (await db.get(xpKey)) || { xp: 0, level: 1 };
      ativa.progresso = Math.min(xpData.level, missao.meta);
    }

    if (ativa.progresso < missao.meta) {
      const faltam = missao.meta - ativa.progresso;
      return interaction.reply({
        content: `⏳ A missão **${missao.nome}** ainda não está completa! Faltam **${faltam}** ${missao.objetivo.split(" ").slice(-1)[0].toLowerCase()}.`,
        ephemeral: true,
      });
    }

    // Concluir missão
    mData.ativas = mData.ativas.filter((a) => a.id !== id);
    mData.completas.push(id);
    await saveUserMissoes(interaction.guild.id, interaction.user.id, mData);

    // Dar XP
    const xpKey = `xp_${interaction.guild.id}_${interaction.user.id}`;
    let xpData = (await db.get(xpKey)) || { xp: 0, level: 1 };
    xpData.xp += missao.recompensa.xp;

    let subiuNivel = false;
    while (xpData.xp >= xpData.level * 100) {
      xpData.xp -= xpData.level * 100;
      xpData.level++;
      subiuNivel = true;
    }
    await db.set(xpKey, xpData);

    // Rastrear progresso na missão "lenda"
    await trackProgress(interaction.guild.id, interaction.user.id, "missoes_completas", 1);

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Missão Entregue: ${missao.nome}`)
      .setColor("#FFE81F")
      .setDescription(`*${missao.desc}*\n\n✅ **Missão concluída com sucesso!**`)
      .addFields(
        { name: "✨ XP Recebido", value: `+${missao.recompensa.xp} XP`, inline: true },
        { name: "⭐ Nível atual", value: `${xpData.level} — ${getTitulo(xpData.level)}`, inline: true },
        { name: "📋 Total concluídas", value: `${mData.completas.length} missão(ões)`, inline: true },
      )
      .setFooter({ text: "Use /missoes para aceitar novas missões!" });

    if (subiuNivel) {
      embed.addFields({ name: "🎉 Subiu de nível!", value: `Agora você é **${getTitulo(xpData.level)}**!` });
    }

    if (mData.completas.length === MISSOES.length) {
      embed.addFields({ name: "🌟 PARABÉNS!", value: "Você completou **todas as missões** da Ordem Jedi! Você é uma verdadeira lenda da galáxia!" });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
