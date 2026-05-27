const { QuickDB } = require("quick.db");
const db = new QuickDB();

const FACCOES = {
  jedi: {
    id: "jedi",
    nome: "Ordem Jedi",
    emoji: "🔵",
    cor: "#4FC3F7",
    desc: "Guardiões da paz e da justiça. Servem à Força Luz com sabedoria e compaixão.",
    lema: "Não há emoção, há paz.",
  },
  sith: {
    id: "sith",
    nome: "Império Sith",
    emoji: "🔴",
    cor: "#EF5350",
    desc: "Senhores do poder e da ambição. A paixão os guia para além dos limites da galáxia.",
    lema: "Paz é uma mentira — só há paixão.",
  },
};

function keyUser(guildId, userId) { return `faccao_user_${guildId}_${userId}`; }
function keyPontos(guildId, faccaoId) { return `faccao_pts_${guildId}_${faccaoId}`; }

async function getFaccaoUser(guildId, userId) {
  return await db.get(keyUser(guildId, userId)) || null;
}

async function setFaccaoUser(guildId, userId, faccaoId) {
  if (!FACCOES[faccaoId]) return false;
  const atual = await getFaccaoUser(guildId, userId);
  if (atual) return "ja_tem"; // não pode trocar
  await db.set(keyUser(guildId, userId), faccaoId);
  return true;
}

async function addPontos(guildId, faccaoId, amount = 1) {
  const atual = (await db.get(keyPontos(guildId, faccaoId))) || 0;
  await db.set(keyPontos(guildId, faccaoId), atual + amount);
}

async function getPlacar(guildId) {
  const jedi = (await db.get(keyPontos(guildId, "jedi"))) || 0;
  const sith = (await db.get(keyPontos(guildId, "sith"))) || 0;
  return { jedi, sith };
}

module.exports = { FACCOES, getFaccaoUser, setFaccaoUser, addPontos, getPlacar };
