const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const questions = [
  { q: "What color is Mace Windu's lightsaber?", a: "purple" },
  { q: "Who is Luke Skywalker's father?", a: "darth vader" },
  { q: "What planet is Anakin Skywalker from?", a: "tatooine" },
  { q: "Who killed Han Solo?", a: "kylo ren" },
  { q: "What is the name of Han Solo's ship?", a: "millennium falcon" },
  { q: "Who trained Obi-Wan Kenobi?", a: "qui-gon jinn" },
  { q: "What species is Yoda?", a: "unknown" },
  { q: "Who is Darth Vader's master?", a: "palpatine" },
  { q: "What Order ordered the clone troopers to kill the Jedi?", a: "order 66" },
  { q: "What is the name of the Wookiee home planet?", a: "kashyyyk" },
  { q: "Who built C-3PO?", a: "anakin skywalker" },
  { q: "What planet is Yoda hiding on in the original trilogy?", a: "dagobah" },
  { q: "What is the real name of Kylo Ren?", a: "ben solo" },
  { q: "What is the Mandalorian's creed called?", a: "the way" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Answer a Star Wars trivia question. You have 20 seconds!"),
  async execute(interaction) {
    const item = questions[Math.floor(Math.random() * questions.length)];

    const embed = new EmbedBuilder()
      .setTitle("🧠 Star Wars Trivia")
      .setDescription(item.q)
      .setColor("#FFE81F")
      .setFooter({ text: "Type your answer in chat — you have 20 seconds!" });

    await interaction.reply({ embeds: [embed] });

    const filter = (m) => m.content.toLowerCase().includes(item.a.toLowerCase());
    const collector = interaction.channel.createMessageCollector({ filter, time: 20_000, max: 1 });

    collector.on("collect", (m) => {
      m.reply(`✅ **${m.author.username}** got it! The answer was: **${item.a}**. May the Force be with you!`);
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.followUp(`⏰ Time's up! Nobody answered correctly. The answer was: **${item.a}**.`);
      }
    });
  },
};
