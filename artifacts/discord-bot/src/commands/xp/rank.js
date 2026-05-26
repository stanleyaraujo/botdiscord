const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Check your current level and XP in the Jedi Order.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to check rank for")
    ),
  async execute(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;
    const key = `xp_${interaction.guild.id}_${target.id}`;
    const userData = (await db.get(key)) || { xp: 0, level: 1 };

    const embed = new EmbedBuilder()
      .setTitle(`📜 Jedi Order Registry — ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .setColor("#FFE81F")
      .addFields(
        { name: "⭐ Level", value: `${userData.level}`, inline: true },
        { name: "✨ XP", value: `${userData.xp} / ${userData.level * 100}`, inline: true }
      )
      .setFooter({ text: "Keep training to become a Jedi Master!" });

    await interaction.reply({ embeds: [embed] });
  },
};
