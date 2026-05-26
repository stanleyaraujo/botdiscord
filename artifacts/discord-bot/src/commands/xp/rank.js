const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const TITULOS = [
  { min: 1,  max: 2,  titulo: "🌱 Iniciante da Ordem" },
  { min: 3,  max: 5,  titulo: "📚 Padawan" },
  { min: 6,  max: 9,  titulo: "🌟 Cavaleiro Jedi" },
  { min: 10, max: 14, titulo: "⚔️ Mestre Jedi" },
  { min: 15, max: 19, titulo: "🔵 Membro do Conselho Jedi" },
  { min: 20, max: Infinity, titulo: "👑 Grande Mestre da Ordem" },
];

function getTitulo(level) {
  for (const t of TITULOS) {
    if (level >= t.min && level <= t.max) return t.titulo;
  }
  return "🌱 Iniciante da Ordem";
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Mostra seu nível atual e XP na Ordem Jedi.")
    .addUserOption((option) =>
      option.setName("usuario").setDescription("O usuário para ver o rank")
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const key = `xp_${interaction.guild.id}_${alvo.id}`;
    const userData = (await db.get(key)) || { xp: 0, level: 1 };
    const titulo = getTitulo(userData.level);
    const xpProximo = userData.level * 100;
    const progresso = Math.round((userData.xp / xpProximo) * 10);
    const barra = "█".repeat(progresso) + "░".repeat(10 - progresso);

    const embed = new EmbedBuilder()
      .setTitle(`📜 Registro da Ordem Jedi — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL())
      .setColor("#FFE81F")
      .addFields(
        { name: "🏅 Título", value: titulo, inline: false },
        { name: "⭐ Nível", value: `${userData.level}`, inline: true },
        { name: "✨ XP", value: `${userData.xp} / ${xpProximo}`, inline: true },
        { name: "📊 Progresso", value: `\`[${barra}]\``, inline: false }
      )
      .setFooter({ text: "Continue treinando para avançar na Ordem!" });

    await interaction.reply({ embeds: [embed] });
  },
};
