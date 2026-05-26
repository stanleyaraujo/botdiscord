const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder (A holocron will be activated).")
    .addIntegerOption((option) =>
      option.setName("minutes").setDescription("Time in minutes").setRequired(true).setMinValue(1).setMaxValue(1440)
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("What should I remind you about?").setRequired(true)
    ),
  async execute(interaction) {
    const time = interaction.options.getInteger("minutes");
    const message = interaction.options.getString("message");

    await interaction.reply(
      `📟 **Holocron activated!** I'll remind you about: "${message}" in ${time} minute(s).`
    );

    setTimeout(async () => {
      try {
        await interaction.user.send(
          `🔵 **HOLOCRON MESSAGE:** You asked me to remind you: "${message}"`
        );
      } catch {
        await interaction.channel.send(
          `${interaction.user}, 🔵 **HOLOCRON MESSAGE:** "${message}"`
        );
      }
    }, time * 60_000);
  },
};
