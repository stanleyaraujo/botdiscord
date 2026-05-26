const { QuickDB } = require("quick.db");
const db = new QuickDB();

async function getCanal(guild, tipo) {
  const configKey = `config_${guild.id}`;
  const config = (await db.get(configKey)) || {};
  const canalId = config[tipo];

  if (canalId) {
    const canal = guild.channels.cache.get(canalId);
    if (canal) return canal;
  }

  // Fallback: canal padrão do servidor
  return guild.systemChannel || null;
}

module.exports = { getCanal };
