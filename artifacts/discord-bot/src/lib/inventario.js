const { QuickDB } = require("quick.db");
const { getItemById } = require("./loja");
const db = new QuickDB();

function key(guildId, userId) {
  return `inv_${guildId}_${userId}`;
}

// { itens: ["item_id",...], tituloAtivo: "titulo_id"|null, boostExpiry: timestamp|null }
async function getInventario(guildId, userId) {
  return (await db.get(key(guildId, userId))) || { itens: [], tituloAtivo: null, boostExpiry: null };
}

async function addItem(guildId, userId, itemId) {
  const inv = await getInventario(guildId, userId);
  inv.itens.push(itemId);
  await db.set(key(guildId, userId), inv);
  return inv;
}

async function temItem(guildId, userId, itemId) {
  const inv = await getInventario(guildId, userId);
  return inv.itens.includes(itemId);
}

async function ativarBoost(guildId, userId, duracaoMs) {
  const inv = await getInventario(guildId, userId);
  inv.boostExpiry = Date.now() + duracaoMs;
  await db.set(key(guildId, userId), inv);
}

async function temBoostAtivo(guildId, userId) {
  const inv = await getInventario(guildId, userId);
  if (!inv.boostExpiry) return false;
  if (Date.now() > inv.boostExpiry) {
    inv.boostExpiry = null;
    await db.set(key(guildId, userId), inv);
    return false;
  }
  return true;
}

async function setTituloAtivo(guildId, userId, tituloId) {
  const inv = await getInventario(guildId, userId);
  if (!inv.itens.includes(tituloId)) return false;
  inv.tituloAtivo = tituloId;
  await db.set(key(guildId, userId), inv);
  return true;
}

async function getTituloAtivo(guildId, userId) {
  const inv = await getInventario(guildId, userId);
  if (!inv.tituloAtivo) return null;
  return getItemById(inv.tituloAtivo);
}

module.exports = { getInventario, addItem, temItem, ativarBoost, temBoostAtivo, setTituloAtivo, getTituloAtivo };
