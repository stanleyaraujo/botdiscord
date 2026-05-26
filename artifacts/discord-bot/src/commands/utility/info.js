const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

// ─── Dados compartilhados ──────────────────────────────────────────────────

const TITULOS_XP = [
  { min: 1,  max: 2,  titulo: "🌱 Iniciante da Ordem" },
  { min: 3,  max: 5,  titulo: "📚 Padawan" },
  { min: 6,  max: 9,  titulo: "🌟 Cavaleiro Jedi" },
  { min: 10, max: 14, titulo: "⚔️ Mestre Jedi" },
  { min: 15, max: 19, titulo: "🔵 Membro do Conselho Jedi" },
  { min: 20, max: Infinity, titulo: "👑 Grande Mestre da Ordem" },
];
function getTitulo(level) {
  for (const t of TITULOS_XP) {
    if (level >= t.min && level <= t.max) return t.titulo;
  }
  return "🌱 Iniciante da Ordem";
}

const LADOS_JEDI = [
  { titulo: "Cavaleiro Jedi", label: "🔵 Lado da Luz" },
  { titulo: "Mestre Jedi",    label: "🔵 Lado da Luz" },
  { titulo: "Padawan da Luz", label: "🔵 Lado da Luz" },
  { titulo: "Guardião",       label: "🔵 Lado da Luz" },
];
const LADOS_SITH = [
  { titulo: "Aprendiz Sith",  label: "🔴 Lado Sombrio" },
  { titulo: "Lorde Sith",     label: "🔴 Lado Sombrio" },
  { titulo: "Agente do Império", label: "🔴 Lado Sombrio" },
  { titulo: "Discípulo das Trevas", label: "🔴 Lado Sombrio" },
];
function getLado(userId) {
  const seed = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const isJedi = seed % 2 === 0;
  const lista = isJedi ? LADOS_JEDI : LADOS_SITH;
  return lista[seed % lista.length];
}

const SABRES = [
  { cor: "Azul 🔵",     hex: "#4FC3F7" },
  { cor: "Verde 🟢",    hex: "#66BB6A" },
  { cor: "Vermelho 🔴", hex: "#EF5350" },
  { cor: "Roxo 🟣",     hex: "#AB47BC" },
  { cor: "Amarelo 🟡",  hex: "#FFE81F" },
  { cor: "Branco ⚪",   hex: "#ECEFF1" },
  { cor: "Darksaber ⬛", hex: "#37474F" },
  { cor: "Laranja 🟠",  hex: "#FFA726" },
];
function getSabre(userId) {
  const seed = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0);
  return SABRES[seed % SABRES.length];
}

const NAVES = [
  "Millennium Falcon 🚀", "X-Wing ✈️", "TIE Fighter 👁️", "Star Destroyer 🛸",
  "Razor Crest 🛩️", "Slave I 🔫", "A-Wing 💨", "B-Wing 💣",
  "Naboo Royal Starship 👑", "TIE Interceptor ⚡", "Ghost 👻", "Invisible Hand ☠️",
];
function getNave(userId) {
  const seed = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0);
  return NAVES[seed % NAVES.length];
}

const PLANETAS = [
  "Tatooine ☀️", "Coruscant 🏙️", "Naboo 🌿", "Hoth ❄️", "Endor 🌲",
  "Dagobah 🌫️", "Mustafar 🌋", "Mandalore ⚔️", "Kashyyyk 🦁", "Alderaan 🕊️",
  "Jakku 🔧", "Bespin ☁️",
];
function getPlaneta(userId) {
  const seed = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0) + 7;
  return PLANETAS[seed % PLANETAS.length];
}

// ─── Comando ───────────────────────────────────────────────────────────────

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Exibe a ficha completa de um membro no universo Star Wars.")
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Ver a ficha de outro membro")
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const membro = await interaction.guild.members.fetch(alvo.id).catch(() => null);

    const chaveXP = `xp_${interaction.guild.id}_${alvo.id}`;
    const userData = (await db.get(chaveXP)) || { xp: 0, level: 1 };

    const titulo   = getTitulo(userData.level);
    const lado     = getLado(alvo.id);
    const sabre    = getSabre(alvo.id);
    const nave     = getNave(alvo.id);
    const planeta  = getPlaneta(alvo.id);

    const xpProximo = userData.level * 100;
    const progresso = Math.round((userData.xp / xpProximo) * 10);
    const barra = "█".repeat(progresso) + "░".repeat(10 - progresso);

    const entrou = membro?.joinedAt
      ? `<t:${Math.floor(membro.joinedAt.getTime() / 1000)}:R>`
      : "Desconhecido";

    const embed = new EmbedBuilder()
      .setTitle(`🪪 Ficha Galáctica — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL({ size: 256 }))
      .setColor(sabre.hex)
      .addFields(
        { name: "⚔️ Afiliação",     value: `${lado.label}\n*${lado.titulo}*`,          inline: true },
        { name: "💡 Sabre de Luz",  value: sabre.cor,                                  inline: true },
        { name: "🌍 Planeta Natal", value: planeta,                                    inline: true },
        { name: "🚀 Nave",          value: nave,                                       inline: true },
        { name: "🏅 Título",        value: titulo,                                     inline: true },
        { name: "📅 Entrou",        value: entrou,                                     inline: true },
        { name: "⭐ Nível",         value: `${userData.level}`,                        inline: true },
        { name: "✨ XP",            value: `${userData.xp} / ${xpProximo}`,            inline: true },
        { name: "📊 Progresso",     value: `\`[${barra}]\``,                           inline: false },
      )
      .setFooter({ text: "Arquivos da Ordem Jedi · Classificação: Pública" });

    await interaction.reply({ embeds: [embed] });
  },
};
