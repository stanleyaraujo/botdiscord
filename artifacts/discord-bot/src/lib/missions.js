const { QuickDB } = require("quick.db");
const db = new QuickDB();

// ─── Definições das missões ────────────────────────────────────────────────

const MISSOES = [
  {
    id: "patrulha",
    nome: "Patrulha da Aliança",
    desc: "Prove seu comprometimento enviando mensagens no servidor.",
    objetivo: "Envie 50 mensagens",
    tipo: "mensagens",
    meta: 50,
    recompensa: { xp: 200 },
    icone: "📡",
    dificuldade: "🟢 Fácil",
  },
  {
    id: "duelista",
    nome: "Duelista das Estrelas",
    desc: "Vença duelos de sabre de luz contra outros membros.",
    objetivo: "Vença 3 duelos",
    tipo: "vitorias_duelo",
    meta: 3,
    recompensa: { xp: 300 },
    icone: "⚔️",
    dificuldade: "🟡 Média",
  },
  {
    id: "guardiao",
    nome: "Guardião do Conhecimento",
    desc: "Consulte os holocrons e absorva os ensinamentos da Força.",
    objetivo: "Use /holocron 5 vezes",
    tipo: "holocron",
    meta: 5,
    recompensa: { xp: 150 },
    icone: "🔮",
    dificuldade: "🟢 Fácil",
  },
  {
    id: "agente",
    nome: "Agente da Resistência",
    desc: "Complete missões diárias para provar sua dedicação.",
    objetivo: "Complete 5 missões diárias",
    tipo: "missao_diaria",
    meta: 5,
    recompensa: { xp: 500 },
    icone: "🎯",
    dificuldade: "🟡 Média",
  },
  {
    id: "dj",
    nome: "DJ da Cantina",
    desc: "Toque músicas para animar o servidor.",
    objetivo: "Toque 10 músicas com /play",
    tipo: "play",
    meta: 10,
    recompensa: { xp: 250 },
    icone: "🎵",
    dificuldade: "🟢 Fácil",
  },
  {
    id: "veterano",
    nome: "Veterano da Ordem",
    desc: "Suba de nível e mostre sua experiência na Força.",
    objetivo: "Alcance o nível 5",
    tipo: "nivel",
    meta: 5,
    recompensa: { xp: 400 },
    icone: "🏅",
    dificuldade: "🟠 Difícil",
  },
  {
    id: "sabio",
    nome: "Sábio da Galáxia",
    desc: "Teste seu conhecimento do universo Star Wars.",
    objetivo: "Acerte 5 questões de trivia",
    tipo: "trivia_acerto",
    meta: 5,
    recompensa: { xp: 200 },
    icone: "🧠",
    dificuldade: "🟡 Média",
  },
  {
    id: "explorador",
    nome: "Explorador da Galáxia",
    desc: "Use variados comandos de lore e descubra o universo Star Wars.",
    objetivo: "Use /planeta, /nave, /lado e /saber (4 ao todo)",
    tipo: "explorador",
    meta: 4,
    recompensa: { xp: 180 },
    icone: "🌌",
    dificuldade: "🟢 Fácil",
  },
  {
    id: "lenda",
    nome: "Lenda da Galáxia",
    desc: "Complete outras missões e entre para os anais da história.",
    objetivo: "Complete 3 missões",
    tipo: "missoes_completas",
    meta: 3,
    recompensa: { xp: 1000 },
    icone: "🌟",
    dificuldade: "🔴 Lendária",
  },
];

// ─── Helpers de DB ─────────────────────────────────────────────────────────

function getMissaoById(id) {
  return MISSOES.find((m) => m.id === id) || null;
}

async function getUserMissoes(guildId, userId) {
  const key = `missao_${guildId}_${userId}`;
  return (await db.get(key)) || { ativas: [], completas: [] };
}

async function saveUserMissoes(guildId, userId, data) {
  await db.set(`missao_${guildId}_${userId}`, data);
}

// ─── Tracking de progresso ─────────────────────────────────────────────────

async function trackProgress(guildId, userId, tipo, amount = 1) {
  const data = await getUserMissoes(guildId, userId);
  let updated = false;

  for (const ativa of data.ativas) {
    const missao = getMissaoById(ativa.id);
    if (!missao || missao.tipo !== tipo) continue;
    if (ativa.progresso >= missao.meta) continue;
    ativa.progresso = Math.min(ativa.progresso + amount, missao.meta);
    updated = true;
  }

  if (updated) await saveUserMissoes(guildId, userId, data);
  return updated;
}

// Versão especial para missão de nível — compara com valor atual
async function trackNivel(guildId, userId, nivelAtual) {
  const data = await getUserMissoes(guildId, userId);
  let updated = false;

  for (const ativa of data.ativas) {
    const missao = getMissaoById(ativa.id);
    if (!missao || missao.tipo !== "nivel") continue;
    const novo = Math.min(nivelAtual, missao.meta);
    if (novo > ativa.progresso) {
      ativa.progresso = novo;
      updated = true;
    }
  }

  if (updated) await saveUserMissoes(guildId, userId, data);
  return updated;
}

module.exports = { MISSOES, getMissaoById, getUserMissoes, saveUserMissoes, trackProgress, trackNivel };
