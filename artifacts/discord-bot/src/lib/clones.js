// ─── Dados base ──────────────────────────────────────────────────────────────

const NOMES_FAMOSOS = [
  { nome: "Rex",      numero: "CT-7567",    rank: 3, especialidade: "Liderança"      },
  { nome: "Cody",     numero: "CC-2224",    rank: 4, especialidade: "Estratégia"     },
  { nome: "Wolffe",   numero: "CC-3636",    rank: 4, especialidade: "Liderança"      },
  { nome: "Fox",      numero: "CC-1010",    rank: 4, especialidade: "Vigilância"     },
  { nome: "Fives",    numero: "CT-27-5555", rank: 2, especialidade: "Reconhecimento" },
  { nome: "Echo",     numero: "CT-1409",    rank: 2, especialidade: "Inteligência"   },
  { nome: "Jesse",    numero: "CT-5597",    rank: 1, especialidade: "Atirador"       },
  { nome: "Kix",      numero: "CT-6116",    rank: 1, especialidade: "Médico"         },
  { nome: "Hardcase", numero: "CT-7843",    rank: 1, especialidade: "Heavy"          },
  { nome: "Tup",      numero: "CT-5385",    rank: 1, especialidade: "Atirador"       },
  { nome: "Boil",     numero: "CT-0000",    rank: 1, especialidade: "Reconhecimento" },
  { nome: "Waxer",    numero: "CT-0001",    rank: 1, especialidade: "Reconhecimento" },
  { nome: "Ponds",    numero: "CC-6454",    rank: 4, especialidade: "Estratégia"     },
  { nome: "Bly",      numero: "CC-5052",    rank: 4, especialidade: "Liderança"      },
  { nome: "Gree",     numero: "CC-1004",    rank: 4, especialidade: "Estratégia"     },
  { nome: "Doom",     numero: "CC-0411",    rank: 3, especialidade: "Combate"        },
  { nome: "Boost",    numero: "CT-7700",    rank: 1, especialidade: "Piloto"         },
  { nome: "Sinker",   numero: "CT-7714",    rank: 1, especialidade: "Piloto"         },
  { nome: "Dogma",    numero: "CT-8",       rank: 1, especialidade: "Combate"        },
];

const NOMES_GENERICOS = [
  "Blade","Hawk","Rook","Vale","Grit","Stone","Dusk","Finn","Blaze","Claw",
  "Viper","Buck","Sarge","Torch","Crater","Lock","Ace","Ghost","Rum","Bolt",
  "Flash","Duke","Flint","Tank","Bricks","Slick","Hevy","Cutup","Droidbait","Nub",
];

const ESPECIALIDADES = [
  "Atirador", "Médico", "Engenheiro", "Piloto", "Demolidor",
  "Reconhecimento", "Heavy", "Sniper", "Liderança", "Estratégia",
  "Inteligência", "Vigilância", "Combate",
];

const RANKS = [
  { id: 0, nome: "Soldado CT",     emoji: "🪖", custoPromocao: 0   },
  { id: 1, nome: "Especialista",   emoji: "⭐", custoPromocao: 80  },
  { id: 2, nome: "Sargento",       emoji: "🔸", custoPromocao: 150 },
  { id: 3, nome: "Tenente",        emoji: "🔷", custoPromocao: 250 },
  { id: 4, nome: "Capitão",        emoji: "🔵", custoPromocao: 400 },
  { id: 5, nome: "Comandante",     emoji: "🟣", custoPromocao: 600 },
  { id: 6, nome: "ARC Trooper",    emoji: "⚡", custoPromocao: null },
];

const BATALHOES = [
  { id: "501", nome: "501º Batalhão", apelido: "Anéis Azuis",    lider: "Capitão Rex",     cor: "#4FC3F7", emoji: "🔵" },
  { id: "212", nome: "212º Batalhão de Ataque", apelido: "Laranja de Cody", lider: "Comandante Cody", cor: "#FFA726", emoji: "🟠" },
  { id: "wolfpack", nome: "Wolfpack",  apelido: "Pack de Wolffe", lider: "Comandante Wolffe", cor: "#78909C", emoji: "🐺" },
  { id: "coruscant", nome: "Guarda de Coruscant", apelido: "Guarda Vermelha", lider: "Comandante Fox", cor: "#EF5350", emoji: "🔴" },
  { id: "327", nome: "327º Corpo Estelar", apelido: "Terra da Batalha", lider: "Comandante Bly", cor: "#66BB6A", emoji: "🟢" },
];

const MISSOES_GUERRA = [
  { id: "recon",    nome: "Reconhecimento Separatista", emoji: "🔭", desc: "Infiltre o território inimigo e colete informações vitais.", poderMin: 50  },
  { id: "invasao",  nome: "Invasão à Base Separatista", emoji: "💥", desc: "Tome a base de controle das forças de Grievous!",           poderMin: 120 },
  { id: "resgate",  nome: "Resgate de Prisioneiros",    emoji: "🔓", desc: "Resgates membros do Senado capturados pelos Sith.",         poderMin: 80  },
  { id: "sabotagem",nome: "Sabotagem de Fábrica Droid", emoji: "💣", desc: "Destrua a linha de produção de Super Droides de Batalha.",  poderMin: 100 },
  { id: "escolta",  nome: "Escolta Diplomática",        emoji: "🛡️", desc: "Proteja o senador em território hostil.",                   poderMin: 60  },
  { id: "orbital",  nome: "Batalha Orbital",            emoji: "🚀", desc: "Pilote sua frota contra os Star Destroyers Separatistas.",  poderMin: 150 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randn(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function poderPorRank(rankId) {
  const bases = [20, 35, 45, 55, 65, 75, 85];
  const extras = [20, 20, 20, 20, 20, 15, 15];
  return randn(bases[rankId], bases[rankId] + extras[rankId]);
}

function novoNumero(rankId) {
  const prefix = rankId >= 4 ? "CC" : "CT";
  return `${prefix}-${randn(1000, 9999)}`;
}

function gerarClone(raridade) {
  // raridade: 0=Comum, 1=Incomum, 2=Raro, 3=Lendário
  let rankId;
  if      (raridade === 0) rankId = 0;
  else if (raridade === 1) rankId = randn(1, 2);
  else if (raridade === 2) rankId = randn(3, 4);
  else                     rankId = randn(5, 6);

  // Chance de nome famoso
  const candidatos = NOMES_FAMOSOS.filter((n) => n.rank === rankId);
  let nomeFamoso = null;
  if (raridade >= 2 && candidatos.length > 0 && Math.random() < 0.5) {
    nomeFamoso = candidatos[Math.floor(Math.random() * candidatos.length)];
  }

  const especialidade = nomeFamoso?.especialidade
    || ESPECIALIDADES[Math.floor(Math.random() * ESPECIALIDADES.length)];

  return {
    id: `clone_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    nome: nomeFamoso?.nome || NOMES_GENERICOS[Math.floor(Math.random() * NOMES_GENERICOS.length)],
    numero: nomeFamoso?.numero || novoNumero(rankId),
    rankId,
    especialidade,
    poder: poderPorRank(rankId),
    nivel: 1,
    missoes: 0,
    raridade,
  };
}

function raridade(roll) {
  if (roll < 70) return 0; // Comum
  if (roll < 90) return 1; // Incomum
  if (roll < 98) return 2; // Raro
  return 3;                // Lendário
}

const RARIDADE_NOME  = ["Comum", "Incomum", "Raro", "Lendário"];
const RARIDADE_EMOJI = ["⚪",    "🔵",     "🟣",   "🟡"];

function poderTotal(clones) {
  return clones.reduce((sum, c) => sum + c.poder * c.nivel, 0);
}

module.exports = {
  RANKS, BATALHOES, MISSOES_GUERRA, RARIDADE_NOME, RARIDADE_EMOJI,
  gerarClone, raridade, poderTotal,
};
