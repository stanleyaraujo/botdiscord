const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server (Send them to the Dark Side).")
    .addUserOption((option) =>
      option.setName("target").setDescription("The member to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the ban")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason provided";

    try {
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply(
        `🚀 **${user.tag}** has been exiled to Tatooine! (Banned)\n**Reason:** ${reason}`
      );
    } catch (error) {
      await interaction.reply({
        content: "Failed to ban this member. They must have the Force on their side (insufficient permissions).",
        ephemeral: true,
      });
    }
  },
};
