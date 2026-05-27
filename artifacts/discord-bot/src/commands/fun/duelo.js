const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { trackProgress } = require("../../lib/missions");
const { addCreditos } = require("../../lib/credits");
const { unlock } = require("../../lib/conquistas");
const { addPontos, getFaccaoUser } = require("../../lib/faccao");

const MOVIMENTOS = [
  "atacou com um golpe Forma IV — Ataru",
  "usou a Forma VII — Juyo sem piedade",
  "desviou um raio com o sabre e contra-atacou",
  "saltou sobre o adversário e desferiu um golpe descendente",
  "usou a Força para empurrar o oponente e avançou",
  "bloqueou três golpes e respondeu com uma rasteira",
  "girou o sabre em Niman e enganou o adversário",
  "chamou seu sabre de volta com a Força e atacou de surpresa",
];

const FINAIS_VENCEDOR = [
  "O adversário caiu e a Força guiou o golpe final.",
  "Vitória absoluta. O Conselho Jedi se orgulha.",
  "O sabre do vencedor brilha diante da derrota do rival.",
  "Apenas um permanece de pé no campo de batalha.",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duelo")
    .setDescription("Desafie alguém para um duelo de sabres de luz!")
    .addUserOption((opt) =>
      opt.setName("oponente").setDescription("Quem você quer desafiar?").setRequired(true)
    ),
  async execute(interaction) {
    const desafiante = interaction.member;
    const oponente = interaction.options.getMember("oponente");

    if (!oponente || oponente.id === desafiante.id) {
      return interaction.reply({ content: "❌ Escolha um oponente válido — você não pode duelar consigo mesmo!", ephemeral: true });
    }
    if (oponente.user.bot) {
      return interaction.reply({ content: "⚔️ Os droids não aceitam duelos de honra!", ephemeral: true });
    }

    const mov1 = MOVIMENTOS[Math.floor(Math.random() * MOVIMENTOS.length)];
    const mov2 = MOVIMENTOS[Math.floor(Math.random() * MOVIMENTOS.length)];
    const vencedor = Math.random() < 0.5 ? desafiante : oponente;
    const perdedor = vencedor.id === desafiante.id ? oponente : desafiante;
    const final = FINAIS_VENCEDOR[Math.floor(Math.random() * FINAIS_VENCEDOR.length)];

    const embed = new EmbedBuilder()
      .setTitle("⚔️ Duelo de Sabres de Luz!")
      .setColor("#FF0000")
      .setDescription(
        `**${desafiante.displayName}** desafia **${oponente.displayName}** para um duelo!\n\n` +
        `🔵 ${desafiante.displayName} *${mov1}*.\n` +
        `🔴 ${oponente.displayName} *${mov2}*.\n\n` +
        `✨ **${vencedor.displayName}** vence! ${final}\n` +
        `😔 ${perdedor.displayName} foi derrotado e se rende.\n\n` +
        `🏆 **${vencedor.displayName}** ganhou **20 💰 créditos**!`
      )
      .setFooter({ text: "Que a Força decida sempre o mais digno." });

    await interaction.reply({ embeds: [embed] });

    const guildId = interaction.guild.id;

    // Conquistas e recompensas para ambos
    await Promise.all([
      unlock(guildId, desafiante.id, "guerreiro", interaction.channel),
      unlock(guildId, oponente.id, "guerreiro", interaction.channel),
      unlock(guildId, vencedor.id, "invicto", interaction.channel),
      addCreditos(guildId, vencedor.id, 20),
      trackProgress(guildId, vencedor.id, "vitorias_duelo", 1),
    ]).catch(() => {});

    // Pontos de facção para o vencedor
    const faccaoVencedor = await getFaccaoUser(guildId, vencedor.id).catch(() => null);
    if (faccaoVencedor) {
      await addPontos(guildId, faccaoVencedor, 1).catch(() => {});
    }
  },
};
