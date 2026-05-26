const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa um membro do servidor (Ejeta da nave).")
    .addUserOption((option) =>
      option.setName("alvo").setDescription("O membro a ser expulso").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("motivo").setDescription("Motivo da expulsão")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("alvo");
    const motivo = interaction.options.getString("motivo") || "Nenhum motivo fornecido";
    const member = await interaction.guild.members.fetch(user.id);

    try {
      await member.kick(motivo);
      await interaction.reply(
        `🛸 **${user.tag}** foi ejetado da nave com sucesso!\n**Motivo:** ${motivo}`
      );
    } catch (error) {
      await interaction.reply({
        content: "Não foi possível expulsar este membro. Ele deve ser um Mestre Jedi muito poderoso.",
        ephemeral: true,
      });
    }
  },
};
