const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { MISSOES, getMissaoById, getUserMissoes, saveUserMissoes } = require("../../lib/missions");

const MAX_ATIVAS = 3;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aceitar")
    .setDescription("Aceita uma missão para começar a completar.")
    .addStringOption((opt) =>
      opt
        .setName("id")
        .setDescription("ID da missão (veja em /missoes)")
        .setRequired(true)
        .addChoices(...MISSOES.map((m) => ({ name: `${m.icone} ${m.nome}`, value: m.id })))
    ),
  async execute(interaction) {
    const id = interaction.options.getString("id");
    const missao = getMissaoById(id);

    if (!missao) {
      return interaction.reply({ content: "❌ Missão não encontrada. Use `/missoes` para ver as disponíveis.", ephemeral: true });
    }

    const data = await getUserMissoes(interaction.guild.id, interaction.user.id);

    if (data.completas.includes(id)) {
      return interaction.reply({ content: `✅ Você já completou a missão **${missao.nome}**!`, ephemeral: true });
    }

    if (data.ativas.some((a) => a.id === id)) {
      return interaction.reply({ content: `🔄 Você já está nessa missão. Veja o progresso com \`/progresso\`.`, ephemeral: true });
    }

    if (data.ativas.length >= MAX_ATIVAS) {
      return interaction.reply({
        content: `⚠️ Você já tem ${MAX_ATIVAS} missões ativas. Conclua ou abandone uma primeiro.`,
        ephemeral: true,
      });
    }

    data.ativas.push({ id, progresso: 0 });
    await saveUserMissoes(interaction.guild.id, interaction.user.id, data);

    const embed = new EmbedBuilder()
      .setTitle(`${missao.icone} Missão Aceita: ${missao.nome}`)
      .setColor("#66BB6A")
      .setDescription(missao.desc)
      .addFields(
        { name: "🎯 Objetivo", value: missao.objetivo, inline: true },
        { name: "⚔️ Dificuldade", value: missao.dificuldade, inline: true },
        { name: "🏆 Recompensa", value: `${missao.recompensa.xp} XP`, inline: true }
      )
      .setFooter({ text: "Acompanhe o progresso com /progresso · Entregue com /entregar" });

    await interaction.reply({ embeds: [embed] });
  },
};
