const { SlashCommandBuilder } = require("discord.js");

const frases = [
  { texto: "Que a Força esteja com você.", fonte: "Vários personagens" },
  { texto: "Eu tenho um mau pressentimento sobre isso.", fonte: "Vários personagens" },
  { texto: "Faça ou não faça. A tentativa não existe.", fonte: "Yoda" },
  { texto: "Eu sou seu pai!", fonte: "Darth Vader" },
  { texto: "O medo é o caminho para o lado sombrio.", fonte: "Yoda" },
  { texto: "Chewie, estamos em casa.", fonte: "Han Solo" },
  { texto: "Isso não é uma lua. É uma estação espacial.", fonte: "Obi-Wan Kenobi" },
  { texto: "A Força é forte neste aqui.", fonte: "Darth Vader" },
  { texto: "Sempre há um peixe maior.", fonte: "Qui-Gon Jinn" },
  { texto: "Hello there!", fonte: "Obi-Wan Kenobi" },
  { texto: "General Kenobi!", fonte: "General Grievous" },
  { texto: "Isto é o Caminho.", fonte: "O Mandaloriano" },
  { texto: "Paciência você deve ter, meu jovem Padawan.", fonte: "Yoda" },
  { texto: "Sua falta de fé é perturbadora.", fonte: "Darth Vader" },
  { texto: "Nunca me diga as probabilidades!", fonte: "Han Solo" },
  { texto: "Que a Força esteja com você. Sempre.", fonte: "Obi-Wan Kenobi" },
  { texto: "É assim que a liberdade morre — com aplausos ensurdecedores.", fonte: "Padmé Amidala" },
  { texto: "Eu não sou um monstro. Sou um Mandaloriano.", fonte: "Din Djarin" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("frase")
    .setDescription("Receba uma frase icônica de Star Wars."),
  async execute(interaction) {
    const f = frases[Math.floor(Math.random() * frases.length)];
    await interaction.reply(`🎬 **Citação da Galáxia:**\n\n> "${f.texto}"\n> — *${f.fonte}*`);
  },
};
