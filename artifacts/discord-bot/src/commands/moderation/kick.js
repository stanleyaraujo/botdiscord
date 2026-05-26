const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server (Eject them from the ship).")
    .addUserOption((option) =>
      option.setName("target").setDescription("The member to kick").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason for the kick")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason provided";
    const member = await interaction.guild.members.fetch(user.id);

    try {
      await member.kick(reason);
      await interaction.reply(
        `🛸 **${user.tag}** has been ejected from the ship!\n**Reason:** ${reason}`
      );
    } catch (error) {
      await interaction.reply({
        content: "Could not kick this member. They must be a very powerful Jedi Master.",
        ephemeral: true,
      });
    }
  },
};
