const {
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require("discord.js");
const { QuickDB } = require("quick.db");
const {
  RANKS, BATALHOES, MISSOES_GUERRA, RARIDADE_NOME, RARIDADE_EMOJI,
  gerarClone, raridade, poderTotal,
} = require("../../lib/clones");
const { getCreditos, spendCreditos, addCreditos } = require("../../lib/credits");
const { unlock } = require("../../lib/conquistas");

const db = new QuickDB();
const MAX_CLONES = 8;
const CUSTO_RECRUTAR = 50;
const CUSTO_TREINAR  = 30;

// ─── DB helpers ───────────────────────────────────────────────────────────────
function keyTropa(guildId, userId)  { return `tropa_${guildId}_${userId}`; }
function keyBatalha(guildId, userId, oponenteId) { return `batalha_cd_${guildId}_${userId}_${oponenteId}`; }
function keyMissao(guildId, userId) { return `missao_clone_cd_${guildId}_${userId}`; }

async function getTropa(guildId, userId)       { return (await db.get(keyTropa(guildId, userId))) || []; }
async function saveTropa(guildId, userId, t)   { await db.set(keyTropa(guildId, userId), t); }

// ─── Formatação ───────────────────────────────────────────────────────────────
function rankDisplay(c) {
  const r = RANKS[c.rankId];
  return `${r.emoji} ${r.nome}`;
}
function raridadeDisplay(c) {
  return `${RARIDADE_EMOJI[c.raridade]} ${RARIDADE_NOME[c.raridade]}`;
}
function poderDisplay(c) { return c.poder * c.nivel; }

// ─── Comando ──────────────────────────────────────────────────────────────────
module.exports = {
  data: new SlashCommandBuilder()
    .setName("clone")
    .setDescription("Sistema da Guerra dos Clones — recrute, treine e leve sua tropa à batalha!")
    .addSubcommand((s) => s.setName("recrutar").setDescription(`Recrute um clone aleatório (custo: ${CUSTO_RECRUTAR} 💰)`))
    .addSubcommand((s) => s.setName("tropa").setDescription("Veja sua tropa de clones").addUserOption((o) => o.setName("usuario").setDescription("Ver tropa de outro membro")))
    .addSubcommand((s) =>
      s.setName("info")
        .setDescription("Veja a ficha detalhada de um clone")
        .addStringOption((o) => o.setName("nome").setDescription("Nome ou número do clone (ex: Rex ou CT-7567)").setRequired(true))
    )
    .addSubcommand((s) =>
      s.setName("treinar")
        .setDescription(`Treine um clone para aumentar seu poder (custo: ${CUSTO_TREINAR} 💰)`)
        .addStringOption((o) => o.setName("nome").setDescription("Nome do clone a treinar").setRequired(true))
    )
    .addSubcommand((s) =>
      s.setName("promover")
        .setDescription("Promova um clone ao próximo rank (custo variável em créditos)")
        .addStringOption((o) => o.setName("nome").setDescription("Nome do clone a promover").setRequired(true))
    )
    .addSubcommand((s) => s.setName("missao").setDescription("Envie sua tropa em missão de guerra (cooldown: 2h)"))
    .addSubcommand((s) =>
      s.setName("batalha")
        .setDescription("Desafie outro membro — tropas se enfrentam!")
        .addUserOption((o) => o.setName("oponente").setDescription("Quem você quer desafiar?").setRequired(true))
    )
    .addSubcommand((s) =>
      s.setName("dispensar")
        .setDescription("Dispense um clone da sua tropa")
        .addStringOption((o) => o.setName("nome").setDescription("Nome do clone a dispensar").setRequired(true))
    )
    .addSubcommand((s) => s.setName("batalhoes").setDescription("Veja os batalhões lendários da República")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const { guild, user } = interaction;

    // ── RECRUTAR ─────────────────────────────────────────────────────────────
    if (sub === "recrutar") {
      const tropa = await getTropa(guild.id, user.id);
      if (tropa.length >= MAX_CLONES) {
        return interaction.reply({ content: `❌ Sua tropa já está cheia! Máximo de **${MAX_CLONES} clones**. Use \`/clone dispensar\` para abrir espaço.`, ephemeral: true });
      }

      const saldo = await getCreditos(guild.id, user.id);
      if (saldo < CUSTO_RECRUTAR) {
        return interaction.reply({ content: `❌ Você precisa de **${CUSTO_RECRUTAR} 💰** para recrutar. Saldo atual: **${saldo} 💰**.`, ephemeral: true });
      }

      await spendCreditos(guild.id, user.id, CUSTO_RECRUTAR);

      const roll = Math.floor(Math.random() * 100);
      const rarCd = raridade(roll);
      const clone = gerarClone(rarCd);
      tropa.push(clone);
      await saveTropa(guild.id, user.id, tropa);

      const cor = ["#90A4AE", "#4FC3F7", "#AB47BC", "#FFD700"][rarCd];
      const embed = new EmbedBuilder()
        .setTitle(`${RARIDADE_EMOJI[rarCd]} Novo Clone Recrutado!`)
        .setColor(cor)
        .setDescription(
          `**${RANKS[clone.rankId].emoji} ${clone.nome}** (${clone.numero})\n` +
          `> Especialidade: **${clone.especialidade}**\n` +
          `> Raridade: ${raridadeDisplay(clone)}\n` +
          `> Poder: **${clone.poder}**`
        )
        .addFields({ name: "🪖 Tropa atual", value: `${tropa.length}/${MAX_CLONES} clones`, inline: true })
        .setFooter({ text: `Custo: ${CUSTO_RECRUTAR} 💰 descontados` });

      return interaction.reply({ embeds: [embed] });
    }

    // ── TROPA ────────────────────────────────────────────────────────────────
    if (sub === "tropa") {
      const alvo = interaction.options.getUser("usuario") || user;
      const tropa = await getTropa(guild.id, alvo.id);

      if (tropa.length === 0) {
        return interaction.reply({ content: `📭 ${alvo.id === user.id ? "Você não tem" : `**${alvo.username}** não tem`} clones recrutados. Use \`/clone recrutar\`!`, ephemeral: false });
      }

      const poder = poderTotal(tropa);
      const linhas = tropa.map((c, i) =>
        `\`${i + 1}.\` ${RANKS[c.rankId].emoji} **${c.nome}** (${c.numero}) · ${RARIDADE_EMOJI[c.raridade]} · ⚔️ ${poderDisplay(c)} · *${c.especialidade}*`
      );

      const embed = new EmbedBuilder()
        .setTitle(`🪖 Tropa de ${alvo.username}`)
        .setColor("#4FC3F7")
        .setDescription(linhas.join("\n"))
        .addFields(
          { name: "⚔️ Poder Total", value: `**${poder}**`, inline: true },
          { name: "🪖 Clones", value: `${tropa.length}/${MAX_CLONES}`, inline: true },
        )
        .setFooter({ text: "Use /clone info <nome> para ver detalhes de um clone" });

      return interaction.reply({ embeds: [embed] });
    }

    // ── INFO ─────────────────────────────────────────────────────────────────
    if (sub === "info") {
      const busca = interaction.options.getString("nome").toLowerCase();
      const tropa = await getTropa(guild.id, user.id);
      const clone = tropa.find((c) => c.nome.toLowerCase() === busca || c.numero.toLowerCase() === busca);

      if (!clone) return interaction.reply({ content: `❌ Clone **${busca}** não encontrado na sua tropa.`, ephemeral: true });

      const rank = RANKS[clone.rankId];
      const proxRank = RANKS[clone.rankId + 1];
      const embed = new EmbedBuilder()
        .setTitle(`${rank.emoji} ${clone.nome} — ${clone.numero}`)
        .setColor(["#90A4AE", "#4FC3F7", "#AB47BC", "#FFD700"][clone.raridade])
        .addFields(
          { name: "🎖️ Rank",          value: rankDisplay(clone),         inline: true },
          { name: "🔮 Raridade",       value: raridadeDisplay(clone),     inline: true },
          { name: "🛡️ Especialidade", value: clone.especialidade,        inline: true },
          { name: "⚔️ Poder base",    value: `${clone.poder}`,           inline: true },
          { name: "📈 Nível",          value: `${clone.nivel}`,           inline: true },
          { name: "💪 Poder efetivo",  value: `**${poderDisplay(clone)}**`, inline: true },
          { name: "🎯 Missões",        value: `${clone.missoes}`,         inline: true },
          {
            name: "⬆️ Próximo rank",
            value: proxRank
              ? `${proxRank.emoji} ${proxRank.nome} — custo: **${proxRank.custoPromocao} 💰**`
              : "✅ Rank máximo atingido!",
            inline: false,
          },
        )
        .setFooter({ text: "Use /clone treinar para aumentar o nível · /clone promover para avançar o rank" });

      return interaction.reply({ embeds: [embed] });
    }

    // ── TREINAR ──────────────────────────────────────────────────────────────
    if (sub === "treinar") {
      const busca = interaction.options.getString("nome").toLowerCase();
      const tropa = await getTropa(guild.id, user.id);
      const idx = tropa.findIndex((c) => c.nome.toLowerCase() === busca);

      if (idx === -1) return interaction.reply({ content: `❌ Clone **${busca}** não encontrado.`, ephemeral: true });

      const saldo = await getCreditos(guild.id, user.id);
      if (saldo < CUSTO_TREINAR) {
        return interaction.reply({ content: `❌ Custo de treinamento: **${CUSTO_TREINAR} 💰**. Seu saldo: **${saldo} 💰**.`, ephemeral: true });
      }

      await spendCreditos(guild.id, user.id, CUSTO_TREINAR);

      const c = tropa[idx];
      const ganho = Math.floor(Math.random() * 6) + 5; // +5 a +10 poder
      c.poder += ganho;
      c.nivel += 1;
      tropa[idx] = c;
      await saveTropa(guild.id, user.id, tropa);

      return interaction.reply(
        `💪 **${c.nome}** completou o treinamento!\n` +
        `> Poder: **${c.poder - ganho}** → **${c.poder}** (+${ganho})\n` +
        `> Nível: **${c.nivel - 1}** → **${c.nivel}**\n` +
        `> Poder efetivo: **${poderDisplay(c)}**`
      );
    }

    // ── PROMOVER ─────────────────────────────────────────────────────────────
    if (sub === "promover") {
      const busca = interaction.options.getString("nome").toLowerCase();
      const tropa = await getTropa(guild.id, user.id);
      const idx = tropa.findIndex((c) => c.nome.toLowerCase() === busca);

      if (idx === -1) return interaction.reply({ content: `❌ Clone **${busca}** não encontrado.`, ephemeral: true });

      const c = tropa[idx];
      const proxRank = RANKS[c.rankId + 1];

      if (!proxRank) {
        return interaction.reply({ content: `✅ **${c.nome}** já está no rank máximo: **${RANKS[c.rankId].emoji} ${RANKS[c.rankId].nome}**!`, ephemeral: true });
      }

      const custo = proxRank.custoPromocao;
      const saldo = await getCreditos(guild.id, user.id);
      if (saldo < custo) {
        return interaction.reply({
          content: `❌ Promover **${c.nome}** para ${proxRank.emoji} ${proxRank.nome} custa **${custo} 💰**. Saldo: **${saldo} 💰**.`,
          ephemeral: true,
        });
      }

      await spendCreditos(guild.id, user.id, custo);
      const rankAntigo = RANKS[c.rankId];
      c.rankId += 1;
      c.poder += Math.floor(Math.random() * 11) + 10; // bônus de poder na promoção
      tropa[idx] = c;
      await saveTropa(guild.id, user.id, tropa);

      return interaction.reply(
        `🎖️ **${c.nome}** foi promovido!\n` +
        `> ${rankAntigo.emoji} ${rankAntigo.nome} → ${RANKS[c.rankId].emoji} **${RANKS[c.rankId].nome}**\n` +
        `> Poder efetivo: **${poderDisplay(c)}**`
      );
    }

    // ── MISSÃO ───────────────────────────────────────────────────────────────
    if (sub === "missao") {
      const tropa = await getTropa(guild.id, user.id);
      if (tropa.length === 0) {
        return interaction.reply({ content: "❌ Você não tem clones! Use `/clone recrutar` primeiro.", ephemeral: true });
      }

      // Cooldown 2h
      const cdKey = keyMissao(guild.id, user.id);
      const ultimo = await db.get(cdKey);
      const DOIS_H = 2 * 3600_000;
      if (ultimo && Date.now() - ultimo < DOIS_H) {
        const min = Math.ceil((DOIS_H - (Date.now() - ultimo)) / 60_000);
        return interaction.reply({ content: `⏳ Sua tropa ainda está em recuperação. Disponível em **${min} min**.`, ephemeral: true });
      }

      const missao = MISSOES_GUERRA[Math.floor(Math.random() * MISSOES_GUERRA.length)];
      const poder = poderTotal(tropa);
      const sucesso = poder >= missao.poderMin || Math.random() < 0.3; // 30% de chance mesmo com poder baixo

      // Atualizar missões dos clones
      const tropaAtualizada = tropa.map((c) => ({ ...c, missoes: c.missoes + 1 }));
      await saveTropa(guild.id, user.id, tropaAtualizada);
      await db.set(cdKey, Date.now());

      if (sucesso) {
        const xpGanho = Math.floor(Math.random() * 51) + 50;     // 50-100 XP
        const creditosGanho = Math.floor(Math.random() * 51) + 50; // 50-100 créditos
        await addCreditos(guild.id, user.id, creditosGanho);

        const xpKey = `xp_${guild.id}_${user.id}`;
        let xpData = (await db.get(xpKey)) || { xp: 0, level: 1 };
        xpData.xp += xpGanho;
        while (xpData.xp >= xpData.level * 100) { xpData.xp -= xpData.level * 100; xpData.level++; }
        await db.set(xpKey, xpData);

        const embed = new EmbedBuilder()
          .setTitle(`${missao.emoji} Missão Concluída: ${missao.nome}`)
          .setColor("#66BB6A")
          .setDescription(`*${missao.desc}*\n\n✅ **Operação bem-sucedida!** Sua tropa retornou vitoriosa.`)
          .addFields(
            { name: "⚔️ Poder da tropa", value: `${poder}`, inline: true },
            { name: "⚡ XP Ganho", value: `+${xpGanho}`, inline: true },
            { name: "💰 Créditos", value: `+${creditosGanho}`, inline: true },
          )
          .setFooter({ text: "Próxima missão disponível em 2 horas." });

        return interaction.reply({ embeds: [embed] });
      } else {
        const creditosGanho = Math.floor(Math.random() * 21) + 10; // consolação 10-30
        await addCreditos(guild.id, user.id, creditosGanho);

        const embed = new EmbedBuilder()
          .setTitle(`${missao.emoji} Missão Falhou: ${missao.nome}`)
          .setColor("#EF5350")
          .setDescription(
            `*${missao.desc}*\n\n` +
            `❌ **Missão fracassada.** Sua tropa recuou com perdas.\n` +
            `Poder necessário: **${missao.poderMin}** · Seu poder: **${poder}**`
          )
          .addFields({ name: "💰 Créditos de consolação", value: `+${creditosGanho}`, inline: true })
          .setFooter({ text: "Treine seus clones e tente novamente em 2 horas." });

        return interaction.reply({ embeds: [embed] });
      }
    }

    // ── BATALHA ──────────────────────────────────────────────────────────────
    if (sub === "batalha") {
      const oponente = interaction.options.getUser("oponente");
      if (oponente.id === user.id) return interaction.reply({ content: "❌ Você não pode batalhar contra si mesmo.", ephemeral: true });
      if (oponente.bot)           return interaction.reply({ content: "❌ Droids não têm tropas de clones!", ephemeral: true });

      // Cooldown 8h por par
      const cdKey = keyBatalha(guild.id, user.id, oponente.id);
      const ultimo = await db.get(cdKey);
      const OITO_H = 8 * 3600_000;
      if (ultimo && Date.now() - ultimo < OITO_H) {
        const h = Math.ceil((OITO_H - (Date.now() - ultimo)) / 3600_000);
        return interaction.reply({ content: `⏳ Você já batalhou contra **${oponente.username}** recentemente. Aguarde **${h}h**.`, ephemeral: true });
      }

      const tropaA = await getTropa(guild.id, user.id);
      const tropaB = await getTropa(guild.id, oponente.id);

      if (tropaA.length === 0) return interaction.reply({ content: "❌ Você não tem clones! Use `/clone recrutar`.", ephemeral: true });
      if (tropaB.length === 0) return interaction.reply({ content: `❌ **${oponente.username}** não tem clones ainda.`, ephemeral: true });

      const poderA = poderTotal(tropaA);
      const poderB = poderTotal(tropaB);
      // Fator aleatório de 0.85-1.15 para variar o resultado
      const scoreA = poderA * (0.85 + Math.random() * 0.30);
      const scoreB = poderB * (0.85 + Math.random() * 0.30);

      const vencedor = scoreA >= scoreB ? user : oponente;
      const perdedor = vencedor.id === user.id ? oponente : user;
      const premio = Math.floor(Math.random() * 41) + 30; // 30-70 créditos

      await db.set(cdKey, Date.now());
      await addCreditos(guild.id, vencedor.id, premio);

      const RELATOS = [
        "A linha de frente deles não resistiu ao avanço implacável.",
        "A tática de flanqueamento foi decisiva para a vitória.",
        "Os snippers eliminaram a linha de suporte inimiga.",
        "O fogo cruzado dos heavies virou o jogo.",
        "A mobilidade aérea garantiu a supremacia no campo.",
      ];
      const relato = RELATOS[Math.floor(Math.random() * RELATOS.length)];

      const embed = new EmbedBuilder()
        .setTitle("⚔️ Batalha de Tropas — Guerra dos Clones!")
        .setColor("#FFE81F")
        .addFields(
          { name: `🔵 ${user.username}`,     value: `${tropaA.length} clones · Poder: **${poderA}**`, inline: true },
          { name: "VS",                       value: "⚔️",                                             inline: true },
          { name: `🔴 ${oponente.username}`,  value: `${tropaB.length} clones · Poder: **${poderB}**`, inline: true },
          { name: "📖 Relato de batalha",     value: relato,                                           inline: false },
          { name: "🏆 Vencedor",              value: `**${vencedor.username}** ganhou **${premio} 💰**!`, inline: false },
        )
        .setFooter({ text: "Próxima batalha disponível em 8 horas." });

      return interaction.reply({ embeds: [embed] });
    }

    // ── DISPENSAR ────────────────────────────────────────────────────────────
    if (sub === "dispensar") {
      const busca = interaction.options.getString("nome").toLowerCase();
      const tropa = await getTropa(guild.id, user.id);
      const idx = tropa.findIndex((c) => c.nome.toLowerCase() === busca);

      if (idx === -1) return interaction.reply({ content: `❌ Clone **${busca}** não encontrado.`, ephemeral: true });

      const clone = tropa[idx];

      // Confirmação com botões
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("dispensar_sim").setLabel("Dispensar").setStyle(ButtonStyle.Danger).setEmoji("❌"),
        new ButtonBuilder().setCustomId("dispensar_nao").setLabel("Cancelar").setStyle(ButtonStyle.Secondary).setEmoji("↩️"),
      );

      const msg = await interaction.reply({
        content: `⚠️ Tem certeza que deseja dispensar **${RANKS[clone.rankId].emoji} ${clone.nome}** (${clone.numero})? Esta ação é permanente!`,
        components: [row],
        fetchReply: true,
      });

      const coletor = msg.createMessageComponentCollector({ filter: (i) => i.user.id === user.id, time: 15_000, max: 1 });
      coletor.on("collect", async (btn) => {
        if (btn.customId === "dispensar_sim") {
          tropa.splice(idx, 1);
          await saveTropa(guild.id, user.id, tropa);
          await btn.update({ content: `✅ **${clone.nome}** foi dispensado. Que a Força guie seu caminho, soldado.`, components: [] });
        } else {
          await btn.update({ content: "↩️ Operação cancelada.", components: [] });
        }
      });
      coletor.on("end", (col) => {
        if (col.size === 0) msg.edit({ content: "⏰ Tempo esgotado. Operação cancelada.", components: [] }).catch(() => {});
      });
    }

    // ── BATALHÕES ────────────────────────────────────────────────────────────
    if (sub === "batalhoes") {
      const embed = new EmbedBuilder()
        .setTitle("🪖 Batalhões Lendários da República")
        .setColor("#4FC3F7")
        .setDescription("Os clones recrutados podem pertencer a qualquer um desses batalhões lendários.");

      for (const b of BATALHOES) {
        embed.addFields({
          name: `${b.emoji} ${b.nome} — "${b.apelido}"`,
          value: `> Lider: **${b.lider}**`,
          inline: false,
        });
      }

      embed.setFooter({ text: "Use /clone recrutar para montar sua tropa!" });
      return interaction.reply({ embeds: [embed] });
    }
  },
};
