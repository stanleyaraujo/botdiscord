const { QuickDB } = require("quick.db");
const db = new QuickDB();

function key(guildId) { return `evento_${guildId}`; }

// { nome, desc, multiplicadorXP, expiry, criadoPor }
async function getEvento(guildId) {
  const ev = await db.get(key(guildId));
  if (!ev) return null;
  if (Date.now() > ev.expiry) {
    await db.delete(key(guildId));
    return null;
  }
  return ev;
}

async function criarEvento(guildId, { nome, desc, multiplicadorXP, duracaoHoras, criadoPor }) {
  const ev = {
    nome,
    desc,
    multiplicadorXP: multiplicadorXP || 2,
    expiry: Date.now() + duracaoHoras * 3600_000,
    criadoPor,
  };
  await db.set(key(guildId), ev);
  return ev;
}

async function encerrarEvento(guildId) {
  const ev = await db.get(key(guildId));
  if (!ev) return false;
  await db.delete(key(guildId));
  return true;
}

async function getMultiplicador(guildId) {
  const ev = await getEvento(guildId);
  return ev ? ev.multiplicadorXP : 1;
}

module.exports = { getEvento, criarEvento, encerrarEvento, getMultiplicador };
