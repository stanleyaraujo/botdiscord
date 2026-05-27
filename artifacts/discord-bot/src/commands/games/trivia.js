const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { trackProgress } = require("../../lib/missions");

const perguntas = [
  { p: "Qual é a cor do sabre de luz de Mace Windu?", r: "roxo" },
  { p: "Quem é o pai de Luke Skywalker?", r: "darth vader" },
  { p: "Qual é o planeta natal de Anakin Skywalker?", r: "tatooine" },
  { p: "Quem matou Han Solo?", r: "kylo ren" },
  { p: "Qual é o nome da nave de Han Solo?", r: "millennium falcon" },
  { p: "Qual Mestre Jedi treinou Obi-Wan Kenobi?", r: "qui-gon jinn" },
  { p: "Quem é o mestre de Darth Vader?", r: "palpatine" },
  { p: "Qual ordem mandou os clones eliminarem os Jedi?", r: "ordem 66" },
  { p: "Qual é o planeta natal dos Wookiees?", r: "kashyyyk" },
  { p: "Quem construiu o C-3PO?", r: "anakin skywalker" },
  { p: "Em qual planeta Yoda se esconde na trilogia original?", r: "dagobah" },
  { p: "Qual é o nome verdadeiro de Kylo Ren?", r: "ben solo" },
  { p: "Como se chama o credo dos Mandalorianos?", r: "o caminho" },
  { p: "De qual planeta é a Princesa Leia?", r: "alderaan" },
  { p: "Qual é o nome do pai adotivo de Luke?", r: "owen lars" },
  { p: "Quantos anos Yoda viveu?", r: "900" },
  { p: "Qual é o nome do bartender alienígena da Cantina de Mos Eisley?", r: "wuher" },
  { p: "Em qual filme Anakin Skywalker se torna Darth Vader?", r: "a vingança dos sith" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Responda uma pergunta de trivia sobre Star Wars. Você tem 20 segundos!"),
  async execute(interaction) {
    const item = perguntas[Math.floor(Math.random() * perguntas.length)];

    const embed = new EmbedBuilder()
      .setTitle("🧠 Trivia Star Wars")
      .setDescription(item.p)
      .setColor("#FFE81F")
      .setFooter({ text: "Digite sua resposta no chat — você tem 20 segundos!" });

    await interaction.reply({ embeds: [embed] });

    const filtro = (m) => m.author.id === interaction.user.id && m.content.toLowerCase().includes(item.r.toLowerCase());
    const coletor = interaction.channel.createMessageCollector({ filter: filtro, time: 20_000, max: 1 });

    coletor.on("collect", async (m) => {
      m.reply(`✅ **${m.author.username}** acertou! A resposta era: **${item.r}**. Que a Força esteja com você!`);
      // Rastrear acerto para missão Sábio
      await trackProgress(interaction.guild.id, m.author.id, "trivia_acerto", 1).catch(() => {});
    });

    coletor.on("end", (coletados) => {
      if (coletados.size === 0) {
        interaction.followUp(`⏰ Tempo esgotado! Ninguém acertou. A resposta era: **${item.r}**.`);
      }
    });
  },
};
