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

const RESPOSTAS_FORCA = [
  "...esteja com você também! 🌟",
  "...esteja com você, Padawan! ✨",
  "...e que ela nunca o abandone! 🔵",
  "...esteja com você sempre. — *Obi-Wan Kenobi* 🌿",
  "...guie seus passos! ⚡",
];

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    // Auto-resposta "que a força"
    if (message.content.toLowerCase().includes("que a força")) {
      const resposta = RESPOSTAS_FORCA[Math.floor(Math.random() * RESPOSTAS_FORCA.length)];
      await message.reply(`Que a Força ${resposta}`).catch(() => {});
    }

    // Sistema de XP
    const key = `xp_${message.guild.id}_${message.author.id}`;
    let userData = (await db.get(key)) || { xp: 0, level: 1 };

    const xpGanho = Math.floor(Math.random() * 11) + 5;
    userData.xp += xpGanho;

    const xpProximoNivel = userData.level * 100;

    if (userData.xp >= xpProximoNivel) {
      userData.level++;
      userData.xp = 0;
      const titulo = getTitulo(userData.level);
      message.reply(
        `✨ **Parabéns, ${message.author.username}!** Você subiu para o nível **${userData.level}**!\n` +
        `Seu novo título: **${titulo}**\nQue a Força esteja com você.`
      ).catch(() => {});
    }

    await db.set(key, userData);
  },
};
