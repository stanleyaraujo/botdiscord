const { SlashCommandBuilder } = require("discord.js");

const quotes = [
  { text: "May the Force be with you.", source: "Various" },
  { text: "I have a bad feeling about this.", source: "Various" },
  { text: "Do. Or do not. There is no try.", source: "Yoda" },
  { text: "I am your father!", source: "Darth Vader" },
  { text: "Fear is the path to the dark side.", source: "Yoda" },
  { text: "Chewie, we're home.", source: "Han Solo" },
  { text: "That's no moon. It's a space station.", source: "Obi-Wan Kenobi" },
  { text: "The Force is strong with this one.", source: "Darth Vader" },
  { text: "There's always a bigger fish.", source: "Qui-Gon Jinn" },
  { text: "Hello there!", source: "Obi-Wan Kenobi" },
  { text: "General Kenobi!", source: "General Grievous" },
  { text: "This is the Way.", source: "The Mandalorian" },
  { text: "Patience you must have, my young Padawan.", source: "Yoda" },
  { text: "Your lack of faith is disturbing.", source: "Darth Vader" },
  { text: "Never tell me the odds!", source: "Han Solo" },
  { text: "I find your lack of faith disturbing.", source: "Darth Vader" },
  { text: "The Force will be with you. Always.", source: "Obi-Wan Kenobi" },
  { text: "So this is how liberty dies — with thunderous applause.", source: "Padmé Amidala" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Get a random iconic Star Wars quote."),
  async execute(interaction) {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    await interaction.reply(`🎬 **Star Wars Quote:**\n\n> "${q.text}"\n> — *${q.source}*`);
  },
};
