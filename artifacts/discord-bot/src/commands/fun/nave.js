const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const NAVES = [
  { nome: "Millennium Falcon", classe: "Cargueiro YT-1300 modificado", desc: "A nave mais rápida da galáxia — fez o Corredor de Kessel em menos de 12 parsecs.", icone: "🚀", raridade: "🌟 Lendária" },
  { nome: "X-Wing T-65", classe: "Caça Estelar de Ataque", desc: "O símbolo da Aliança Rebelde. Ágil, poderoso e com torpedos de prótons.", icone: "✈️", raridade: "⚔️ Rara" },
  { nome: "TIE Fighter", classe: "Caça TIE/In", desc: "Veloz e letal. O rugido do Império atravessa o espaço.", icone: "👁️", raridade: "🔩 Comum" },
  { nome: "Star Destroyer", classe: "Destruidor Estelar Classe Venator", desc: "Imponente. Apenas a sua sombra já faz planetas tremerem.", icone: "🛸", raridade: "💎 Épica" },
  { nome: "Nave Razor Crest", classe: "Transporte Pré-Imperial", desc: "A nave do Mandaloriano. Resistente, discreta e confiável — como seu piloto.", icone: "🛩️", raridade: "⚔️ Rara" },
  { nome: "Slave I (Firespray-31)", classe: "Interceptor Classe Firespray", desc: "A nave de Jango e Boba Fett. Cheia de armamento escondido e surpresas.", icone: "🔫", raridade: "💎 Épica" },
  { nome: "Nave Invisible Hand", classe: "Cruzador de Ataque Providence", desc: "O flagshipde Grievous. Enorme e aterrorizante.", icone: "☠️", raridade: "💎 Épica" },
  { nome: "A-Wing", classe: "Interceptor RZ-1", desc: "O caça mais rápido da Aliança. Difícil de acertar, impossível de ignorar.", icone: "💨", raridade: "⚔️ Rara" },
  { nome: "B-Wing", classe: "Bombardeiro Estelar A/SF-01", desc: "Pesado e poderoso. O pesadelo dos Destroyers imperiais.", icone: "💣", raridade: "⚔️ Rara" },
  { nome: "Naboo Royal Starship", classe: "Nave Real de Naboo", desc: "Elegante como sua rainha. Cromada e inconfundível.", icone: "👑", raridade: "🌟 Lendária" },
  { nome: "TIE Interceptor", classe: "Caça TIE/In Avançado", desc: "Mais rápido e mais letal que o TIE comum. Pilotado pela elite imperial.", icone: "⚡", raridade: "⚔️ Rara" },
  { nome: "Ghost", classe: "Transporte VCX-100", desc: "A nave da tripulação do Ghost. Lar dos Rebeldes de Spectres.", icone: "👻", raridade: "🔩 Comum" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nave")
    .setDescription("Descubra qual nave do universo Star Wars você pilotaria!")
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Ver a nave de outro usuário")
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const seed = [...alvo.id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const nave = NAVES[seed % NAVES.length];

    const embed = new EmbedBuilder()
      .setTitle(`${nave.icone} Nave Atribuída — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL())
      .setColor("#FFE81F")
      .addFields(
        { name: "🚀 Nave", value: nave.nome, inline: true },
        { name: "🔧 Classe", value: nave.classe, inline: true },
        { name: "✨ Raridade", value: nave.raridade, inline: true },
        { name: "📖 Sobre", value: nave.desc }
      )
      .setFooter({ text: "Cada piloto tem sua nave. A galáxia escolheu a sua." });

    await interaction.reply({ embeds: [embed] });
  },
};
