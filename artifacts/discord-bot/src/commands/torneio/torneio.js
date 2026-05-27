const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { QuickDB } = require("quick.db");
const { addCreditos } = require("../../lib/credits");
const { unlock } = require("../../lib/conquistas");
const db = new QuickDB();

const MOVIMENTOS = [
  "atacou com Forma IV — Ataru",
  "usou a Forma VII — Juyo sem piedade",
  "desviou e contra-atacou com precisão",
  "chamou seu sabre pela Força e golpeou",
  "executou um salto mortal e desferiu o golpe final",
];

function keyTorneio(guildId) { return `torneio_${guildId}`; }

async function getTorneio(guildId) {
  return await db.get(keyTorneio(guildId)) || null;
}

function gerarBracket(inscritos) {
  const shuffled = [...inscritos].sort(() => Math.random() - 0.5);
  const partidas = [];
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    partidas.push({ j1: shuffled[i], j2: shuffled[i + 1], vencedor: null });
  }
  // Bye automático se número ímpar
  if (shuffled.length % 2 !== 0) {
    partidas.push({ j1: shuffled[shuffled.length - 1], j2: null, vencedor: shuffled[shuffled.length - 1] });
  }
  return partidas;
}

async function resolverTodosRodadas(inscritos) {
  let rodadaAtual = inscritos;
  const historico = [];

  while (rodadaAtual.length > 1) {
    const rodada = [];
    const vencedores = [];

    for (let i = 0; i < rodadaAtual.length; i += 2) {
      const j1 = rodadaAtual[i];
      const j2 = rodadaAtual[i + 1];

      if (!j2) {
        vencedores.push(j1);
        rodada.push({ j1, j2: null, vencedor: j1, bye: true });
        continue;
      }

      const vencedor = Math.random() < 0.5 ? j1 : j2;
      const perdedor = vencedor === j1 ? j2 : j1;
      const mov = MOVIMENTOS[Math.floor(Math.random() * MOVIMENTOS.length)];
      vencedores.push(vencedor);
      rodada.push({ j1, j2, vencedor, perdedor, mov });
    }

    historico.push(rodada);
    rodadaAtual = vencedores;
  }

  return { historico, campeao: rodadaAtual[0] };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("torneio")
    .setDescription("Sistema de torneio de duelos do servidor.")
    .addSubcommand((s) => s.setName("inscrever").setDescription("Inscreva-se no próximo torneio"))
    .addSubcommand((s) =>
      s.setName("iniciar").setDescription("(Admin) Inicia o torneio com os inscritos")
    )
    .addSubcommand((s) => s.setName("ver").setDescription("Veja os inscritos e status do torneio"))
    .addSubcommand((s) =>
      s.setName("cancelar").setDescription("(Admin) Cancela o torneio atual")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const { guild } = interaction;
    const key = keyTorneio(guild.id);

    if (sub === "inscrever") {
      let torneio = await getTorneio(guild.id);

      if (torneio && torneio.encerrado) {
        return interaction.reply({ content: "⚠️ O torneio já foi encerrado. Aguarde o próximo!", ephemeral: true });
      }

      if (!torneio) {
        torneio = { inscritos: [], encerrado: false };
      }

      if (torneio.inscritos.includes(interaction.user.id)) {
        return interaction.reply({ content: "✅ Você já está inscrito no torneio!", ephemeral: true });
      }

      torneio.inscritos.push(interaction.user.id);
      await db.set(key, torneio);

      return interaction.reply(`⚔️ **${interaction.user.username}** entrou no torneio! Total de inscritos: **${torneio.inscritos.length}**.`);
    }

    if (sub === "ver") {
      const torneio = await getTorneio(guild.id);

      if (!torneio || torneio.inscritos.length === 0) {
        return interaction.reply({ content: "📭 Nenhum torneio em andamento. Use `/torneio inscrever` para começar!", ephemeral: false });
      }

      const nomes = await Promise.all(
        torneio.inscritos.map(async (id) => {
          const m = await guild.members.fetch(id).catch(() => null);
          return `• ${m ? m.displayName : `<@${id}>`}`;
        })
      );

      const embed = new EmbedBuilder()
        .setTitle("🏆 Torneio de Duelos")
        .setColor("#FFE81F")
        .setDescription(torneio.encerrado ? "✅ Torneio encerrado." : "🔄 Aberto para inscrições.")
        .addFields({ name: `Inscritos (${torneio.inscritos.length})`, value: nomes.join("\n") || "Nenhum" })
        .setFooter({ text: "Admin usa /torneio iniciar para começar" });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "iniciar") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "❌ Apenas administradores podem iniciar o torneio.", ephemeral: true });
      }
      const torneio = await getTorneio(guild.id);

      if (!torneio || torneio.inscritos.length < 2) {
        return interaction.reply({ content: "❌ São necessários pelo menos 2 inscritos para iniciar o torneio.", ephemeral: true });
      }

      await interaction.deferReply();

      const { historico, campeao } = await resolverTodosRodadas(torneio.inscritos);

      torneio.encerrado = true;
      await db.set(key, torneio);

      let descricao = "";
      for (let r = 0; r < historico.length; r++) {
        descricao += `**— Rodada ${r + 1} —**\n`;
        for (const p of historico[r]) {
          if (p.bye) {
            descricao += `↳ <@${p.j1}> avança automaticamente (bye)\n`;
          } else {
            descricao += `↳ <@${p.vencedor}> *${p.mov}* e derrotou <@${p.perdedor}>!\n`;
          }
        }
        descricao += "\n";
      }

      await addCreditos(guild.id, campeao, 500);
      await unlock(guild.id, campeao, "campeao", interaction.channel);

      const embed = new EmbedBuilder()
        .setTitle("🏆 TORNEIO CONCLUÍDO!")
        .setColor("#FFD700")
        .setDescription(descricao)
        .addFields({ name: "👑 CAMPEÃO DA GALÁXIA", value: `<@${campeao}> — **+500 💰 créditos**` })
        .setFooter({ text: "Glória ao vencedor! Que a Força sempre guie o mais digno." });

      await interaction.editReply({ embeds: [embed] });

      await db.delete(key);
    }

    if (sub === "cancelar") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "❌ Apenas administradores podem cancelar o torneio.", ephemeral: true });
      }
      await db.delete(keyTorneio(guild.id));
      return interaction.reply({ content: "✅ Torneio cancelado e lista de inscritos apagada.", ephemeral: true });
    }
  },
};
