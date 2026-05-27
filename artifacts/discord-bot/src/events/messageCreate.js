const { QuickDB } = require("quick.db");
const { getCanal } = require("../lib/config");
const { trackProgress, trackNivel } = require("../lib/missions");
const { addCreditos } = require("../lib/credits");
const { temBoostAtivo } = require("../lib/inventario");
const { getMultiplicador } = require("../lib/eventos");
const { unlock } = require("../lib/conquistas");
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
  "...guie seus passos! ⚡",
  "...esteja com você sempre. — *Obi-Wan Kenobi* 🌿",
];

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const { guild, author } = message;

    // Auto-resposta "que a força"
    if (message.content.toLowerCase().includes("que a força")) {
      const resposta = RESPOSTAS_FORCA[Math.floor(Math.random() * RESPOSTAS_FORCA.length)];
      await message.reply(`Que a Força ${resposta}`).catch(() => {});
    }

    // ── Créditos por mensagem ──────────────────────────────────────
    const credGanhos = Math.floor(Math.random() * 3) + 1;
    const novoSaldo = await addCreditos(guild.id, author.id, credGanhos);

    // Conquista: Crésus Galáctico (500 créditos)
    if (novoSaldo >= 500) {
      await unlock(guild.id, author.id, "rico", message.channel).catch(() => {});
    }

    // ── Contagem de mensagens para conquista Centenário ──────────
    const msgKey = `msgs_${guild.id}_${author.id}`;
    const msgCount = ((await db.get(msgKey)) || 0) + 1;
    await db.set(msgKey, msgCount);
    if (msgCount >= 100) {
      await unlock(guild.id, author.id, "centenario", message.channel).catch(() => {});
    }

    // ── Missão: Patrulha ──────────────────────────────────────────
    await trackProgress(guild.id, author.id, "mensagens", 1).catch(() => {});

    // ── XP (com multiplicadores de evento e boost) ────────────────
    const xpKey = `xp_${guild.id}_${author.id}`;
    let userData = (await db.get(xpKey)) || { xp: 0, level: 1 };

    const baseXP = Math.floor(Math.random() * 11) + 5;
    const multEvento = await getMultiplicador(guild.id);
    const temBoost = await temBoostAtivo(guild.id, author.id);
    const multBoost = temBoost ? 2 : 1;
    const xpGanho = baseXP * multEvento * multBoost;

    userData.xp += xpGanho;
    const xpProximoNivel = userData.level * 100;

    if (userData.xp >= xpProximoNivel) {
      userData.level++;
      userData.xp = 0;
      const titulo = getTitulo(userData.level);
      const texto =
        `✨ **Parabéns, ${author.username}!** Você subiu para o nível **${userData.level}**!\n` +
        `Seu novo título: **${titulo}**\nQue a Força esteja com você.`;

      const canalLevelUp = await getCanal(guild, "levelup");
      if (canalLevelUp && canalLevelUp.id !== message.channel.id) {
        await canalLevelUp.send(`<@${author.id}> ${texto}`).catch(() => {});
      } else {
        await message.reply(texto).catch(() => {});
      }

      // Conquistas de nível
      if (userData.level >= 5)  await unlock(guild.id, author.id, "nivel5",  message.channel).catch(() => {});
      if (userData.level >= 10) await unlock(guild.id, author.id, "nivel10", message.channel).catch(() => {});

      // Missão: Veterano
      await trackNivel(guild.id, author.id, userData.level).catch(() => {});
    }

    await db.set(xpKey, userData);
  },
};
