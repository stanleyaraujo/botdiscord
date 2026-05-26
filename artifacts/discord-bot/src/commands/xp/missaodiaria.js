const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const MISSOES_DIARIAS = [
  "Patrulhou os corredores da base rebelde com sucesso.",
  "Completou uma simulação de voo X-Wing sem falhas.",
  "Decifrou um holocron antigo e extraiu informações valiosas.",
  "Ajudou um Padawan a entender um ensinamento da Força.",
  "Interceptou uma comunicação imperial e enviou o relatório.",
  "Sobreviveu a um interrogatório de Stormtroopers e escapou.",
  "Realizou manutenção no R2-D2 e no Millennium Falcon.",
  "Meditou por horas e fortaleceu sua conexão com a Força.",
  "Negociou com Jawas e conseguiu peças importantes para a Aliança.",
  "Destruiu um TIE Fighter em simulação de combate.",
];

function formatarTempo(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}min`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("missaodiaria")
    .setDescription("Complete sua missão diária e ganhe XP bônus! (1x por dia)"),
  async execute(interaction) {
    const chaveCD = `diaria_${interaction.guild.id}_${interaction.user.id}`;
    const chaveXP = `xp_${interaction.guild.id}_${interaction.user.id}`;

    const ultima = await db.get(chaveCD);
    const agora = Date.now();
    const VINTE_QUATRO_HORAS = 24 * 60 * 60 * 1000;

    if (ultima && agora - ultima < VINTE_QUATRO_HORAS) {
      const restante = VINTE_QUATRO_HORAS - (agora - ultima);
      return interaction.reply({
        content: `⏳ Você já completou sua missão diária! Volte em **${formatarTempo(restante)}**.`,
        ephemeral: true,
      });
    }

    const xpBonus = Math.floor(Math.random() * 101) + 50; // 50–150 XP
    const missao = MISSOES_DIARIAS[Math.floor(Math.random() * MISSOES_DIARIAS.length)];

    let userData = (await db.get(chaveXP)) || { xp: 0, level: 1 };
    userData.xp += xpBonus;

    const xpProximoNivel = userData.level * 100;
    let subiu = false;
    while (userData.xp >= xpProximoNivel) {
      userData.level++;
      userData.xp -= xpProximoNivel;
      subiu = true;
    }

    await db.set(chaveXP, userData);
    await db.set(chaveCD, agora);

    const embed = new EmbedBuilder()
      .setTitle("📋 Missão Diária Concluída!")
      .setColor("#66BB6A")
      .setDescription(`✅ *${missao}*`)
      .addFields(
        { name: "✨ XP Recebido", value: `+${xpBonus} XP`, inline: true },
        { name: "⭐ Nível atual", value: `${userData.level}`, inline: true },
      )
      .setFooter({ text: "Volte amanhã para uma nova missão!" });

    if (subiu) {
      embed.addFields({ name: "🎉 Subiu de nível!", value: `Você alcançou o nível **${userData.level}**!` });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
