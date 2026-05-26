const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const characters = [
  { name: "Luke Skywalker", role: "Jedi Knight", side: "Light", description: "The farm boy who became a legendary Jedi." },
  { name: "Darth Vader", role: "Dark Lord of the Sith", side: "Dark", description: "Once Anakin Skywalker, now servant of the Emperor." },
  { name: "Yoda", role: "Jedi Grand Master", side: "Light", description: "900 years old and the wisest being in the galaxy." },
  { name: "Han Solo", role: "Smuggler", side: "Light", description: "Pilot of the Millennium Falcon and reluctant hero." },
  { name: "Leia Organa", role: "Princess / General", side: "Light", description: "Leader of the Rebellion and a Force-sensitive herself." },
  { name: "Obi-Wan Kenobi", role: "Jedi Master", side: "Light", description: "The master of Anakin Skywalker and mentor to Luke." },
  { name: "Darth Maul", role: "Sith Lord", side: "Dark", description: "A fearsome Sith apprentice with a double-bladed lightsaber." },
  { name: "Ahsoka Tano", role: "Former Padawan", side: "Light", description: "Anakin's apprentice who walked her own path." },
  { name: "Boba Fett", role: "Bounty Hunter", side: "Neutral", description: "The most feared bounty hunter in the galaxy." },
  { name: "Din Djarin (Mando)", role: "Mandalorian", side: "Light", description: "This is the Way." },
  { name: "Kylo Ren", role: "Supreme Leader", side: "Dark", description: "Ben Solo, torn between light and darkness." },
  { name: "Rey", role: "Jedi", side: "Light", description: "A scavenger from Jakku who rose to become a Jedi." },
  { name: "Palpatine", role: "Emperor / Sith Lord", side: "Dark", description: "The true mastermind behind the fall of the Republic." },
  { name: "Chewbacca", role: "Wookiee Co-pilot", side: "Light", description: "Han's loyal partner and an incredible mechanic." },
  { name: "Grogu (Baby Yoda)", role: "Force Youngling", side: "Light", description: "A powerful Force-sensitive child of Yoda's species." },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("character")
    .setDescription("Get a random Star Wars character."),
  async execute(interaction) {
    const c = characters[Math.floor(Math.random() * characters.length)];
    const color = c.side === "Light" ? "#4FC3F7" : c.side === "Dark" ? "#B71C1C" : "#757575";

    const embed = new EmbedBuilder()
      .setTitle(`👤 Random Character: ${c.name}`)
      .setDescription(c.description)
      .setColor(color)
      .addFields(
        { name: "🎭 Role", value: c.role, inline: true },
        { name: "⚖️ Side", value: c.side, inline: true }
      )
      .setFooter({ text: "May the Force be with you." });

    await interaction.reply({ embeds: [embed] });
  },
};
