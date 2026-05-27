const { QuickDB } = require("quick.db");
const db = new QuickDB();

const CONQUISTAS = [
  { id: "guerreiro",      icone: "⚔️",  nome: "Guerreiro",             desc: "Participe do seu primeiro duelo" },
  { id: "invicto",        icone: "🏆",  nome: "Invicto",               desc: "Vença seu primeiro duelo" },
  { id: "centenario",     icone: "💬",  nome: "Centenário",            desc: "Envie 100 mensagens no servidor" },
  { id: "dj",             icone: "🎵",  nome: "DJ da Cantina",         desc: "Toque a primeira música" },
  { id: "sabio_trivia",   icone: "🧠",  nome: "Sábio",                 desc: "Acerte sua primeira trivia" },
  { id: "rico",           icone: "💰",  nome: "Crésus Galáctico",      desc: "Acumule 500 créditos" },
  { id: "colecionador",   icone: "🛍️", nome: "Colecionador",          desc: "Compre seu primeiro item na loja" },
  { id: "nivel5",         icone: "⭐",  nome: "Veterano",              desc: "Alcance o nível 5" },
  { id: "nivel10",        icone: "👑",  nome: "Lenda da Ordem",        desc: "Alcance o nível 10" },
  { id: "missao_mestre",  icone: "📋",  nome: "Mestre das Missões",    desc: "Complete 5 missões" },
  { id: "faccao_leal",    icone: "🏴",  nome: "Leal à Facção",         desc: "Escolha uma facção" },
  { id: "explorador",     icone: "🌌",  nome: "Explorador",            desc: "Use /planeta, /nave, /lado e /saber" },
  { id: "campeao",        icone: "🥇",  nome: "Campeão da Galáxia",    desc: "Vença um torneio" },
  { id: "apostador",      icone: "🃏",  nome: "Apostador",             desc: "Jogue Sabacc pela primeira vez" },
  { id: "corredor",       icone: "💨",  nome: "Mais Rápido que o Falcon", desc: "Vença uma corrida de digitação" },
];

function key(guildId, userId) {
  return `conquistas_${guildId}_${userId}`;
}

async function getConquistas(guildId, userId) {
  return (await db.get(key(guildId, userId))) || [];
}

// Retorna a conquista se foi desbloqueada agora, null se já tinha ou não existe
async function unlock(guildId, userId, conquistaId, notifyChannel = null) {
  const conquista = CONQUISTAS.find((c) => c.id === conquistaId);
  if (!conquista) return null;

  const atuais = await getConquistas(guildId, userId);
  if (atuais.includes(conquistaId)) return null;

  atuais.push(conquistaId);
  await db.set(key(guildId, userId), atuais);

  if (notifyChannel) {
    notifyChannel
      .send(`🏅 **Conquista desbloqueada!** <@${userId}> ganhou: ${conquista.icone} **${conquista.nome}** — *${conquista.desc}*`)
      .catch(() => {});
  }

  return conquista;
}

module.exports = { CONQUISTAS, getConquistas, unlock };
