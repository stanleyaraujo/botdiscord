const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const { getPlacar } = require("../../lib/faccao");
const { getEvento } = require("../../lib/eventos");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("servidorinfo")
    .setDescription("Estatísticas completas do servidor no universo Star Wars."),
  async execute(interaction) {
    await interaction.deferReply();
    const { guild } = interaction;

    // XP - membro mais poderoso e total de levels
    const todos = await db.all();
    const prefixoXP = `xp_${guild.id}_`;
    const xpData = todos.filter((e) => e.id.startsWith(prefixoXP));

    let topMembro = null;
    let topLevel = 0;
    let totalLevels = 0;

    for (const e of xpData) {
      totalLevels += e.value.level || 0;
      if ((e.value.level || 0) > topLevel) {
        topLevel = e.value.level;
        topMembro = e.id.replace(prefixoXP, "");
      }
    }

    // Missões
    const prefixoMissao = `missao_${guild.id}_`;
    const missaoData = todos.filter((e) => e.id.startsWith(prefixoMissao));
    const totalMissoes = missaoData.reduce((acc, e) => acc + (e.value.completas?.length || 0), 0);

    // Facções
    const placar = await getPlacar(guild.id);
    const prefixoFaccao = `faccao_user_${guild.id}_`;
    const faccaoData = todos.filter((e) => e.id.startsWith(prefixoFaccao));
    const totalJedi = faccaoData.filter((e) => e.value === "jedi").length;
    const totalSith = faccaoData.filter((e) => e.value === "sith").length;

    // Evento ativo
    const evento = await getEvento(guild.id);

    // Membros
    await guild.members.fetch();
    const totalMembros = guild.memberCount;
    const totalBots = guild.members.cache.filter((m) => m.user.bot).size;
    const totalHumanos = totalMembros - totalBots;

    let topNome = "Desconhecido";
    if (topMembro) {
      const m = await guild.members.fetch(topMembro).catch(() => null);
      if (m) topNome = m.displayName;
    }

    const criado = Math.floor(guild.createdAt.getTime() / 1000);

    const embed = new EmbedBuilder()
      .setTitle(`🌌 Ficha Galáctica — ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setColor("#FFE81F")
      .addFields(
        { name: "👥 Membros", value: `${totalHumanos} humanos · ${totalBots} droids`, inline: true },
        { name: "📅 Fundação", value: `<t:${criado}:R>`, inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
        { name: "🔵 Jedi", value: `${totalJedi} membros · ${placar.jedi} pts`, inline: true },
        { name: "🔴 Sith", value: `${totalSith} membros · ${placar.sith} pts`, inline: true },
        { name: "🏆 Maior força na Força", value: `${topNome} (Nível ${topLevel})`, inline: true },
        { name: "⭐ Níveis somados", value: `${totalLevels} no total`, inline: true },
        { name: "📋 Missões completas", value: `${totalMissoes} no total`, inline: true },
        { name: "🎉 Evento ativo", value: evento ? `**${evento.nome}** (${evento.multiplicadorXP}x XP)` : "Nenhum", inline: true },
      )
      .setFooter({ text: "Dados coletados em tempo real dos Arquivos da Ordem Jedi" });

    await interaction.editReply({ embeds: [embed] });
  },
};
