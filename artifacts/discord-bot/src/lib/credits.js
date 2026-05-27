const { QuickDB } = require("quick.db");
const path = require("path");

// Caminho fixo para o banco de dados — evita perda de dados no Replit
const db = new QuickDB({
  filePath: path.join(__dirname, "..", "..", "json.sqlite"),
});

function key(guildId, userId) {
  return `creditos_${guildId}_${userId}`;
}

async function getCreditos(guildId, userId) {
  return (await db.get(key(guildId, userId))) || 0;
}

async function addCreditos(guildId, userId, amount) {
  const atual = await getCreditos(guildId, userId);
  const novo = Math.max(0, atual + amount);
  await db.set(key(guildId, userId), novo);
  return novo;
}

async function spendCreditos(guildId, userId, amount) {
  const atual = await getCreditos(guildId, userId);
  if (atual < amount) return false;
  await db.set(key(guildId, userId), atual - amount);
  return true;
}

async function transferCreditos(guildId, fromId, toId, amount) {
  const ok = await spendCreditos(guildId, fromId, amount);
  if (!ok) return false;
  await addCreditos(guildId, toId, amount);
  return true;
}

module.exports = { getCreditos, addCreditos, spendCreditos, transferCreditos };
