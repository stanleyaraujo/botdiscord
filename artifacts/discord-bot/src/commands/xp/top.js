const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const TITULOS = [
  { min: 1,  max: 2,  titulo: "🌱 Iniciante" },
  { min: 3,  max: 5,  titulo: "📚 Padawan" },
  { min: 6,  max: 9,  titulo: "🌟 Cavaleiro Jedi" },
  { min: 10, max: 14, titulo: "⚔️ Mestre Jedi" },
  { min: 15, max: 19, titulo: "🔵 Conselho Jedi" },
  { min: 20, max: Infinity, titulo: "👑 Grande Mestre" },
];

function getTitulo(level) {
  for (const t of TITULOS) {
    if (level >= t.min && level <= t.max) return t.titulo;
  }
  return "🌱 Iniciante";
}

const MEDALHAS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Mostra o ranking dos membros com mais XP do servidor."),
  async execute(interaction) {
    await interaction.deferReply();

    const prefix = `xp_${interaction.guild.id}_`;
    const todos = await db.all();
    const dados = todos
      .filter((e) => e.id.startsWith(prefix))
      .map((e) => ({ userId: e.id.replace(prefix, ""), ...e.value }))
      .sort((a, b) => b.level !== a.level ? b.level - a.level : b.xp - a.xp)
      .slice(0, 10);

    if (dados.length === 0) {
      return interaction.editReply("📭 Ainda não há dados de XP neste servidor. Conversem mais! 😄");
    }

    const linhas = await Promise.all(
      dados.map(async (d, i) => {
        let nome;
        try {
          const membro = await interaction.guild.members.fetch(d.userId);
          nome = membro.displayName;
        } catch {
          nome = `Usuário desconhecido`;
        }
        const titulo = getTitulo(d.level);
        return `${MEDALHAS[i]} **${nome}** — Nível ${d.level} · ${d.xp} XP · ${titulo}`;
      })
    );

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Ranking da Ordem Jedi — ${interaction.guild.name}`)
      .setColor("#FFE81F")
      .setDescription(linhas.join("\n"))
      .setFooter({ text: "Continue enviando mensagens para subir no ranking!" });

    await interaction.editReply({ embeds: [embed] });
  },
};
