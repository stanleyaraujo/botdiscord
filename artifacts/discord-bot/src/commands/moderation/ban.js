const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bane um membro do servidor (Envia para o Lado Sombrio).")
    .addUserOption((option) =>
      option.setName("alvo").setDescription("O membro a ser banido").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("motivo").setDescription("Motivo do banimento")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser("alvo");
    const motivo = interaction.options.getString("motivo") || "Nenhum motivo fornecido";

    try {
      await interaction.guild.members.ban(user, { reason: motivo });
      await interaction.reply(
        `🚀 **${user.tag}** foi enviado para o exílio em Tatooine! (Banido)\n**Motivo:** ${motivo}`
      );
    } catch (error) {
      await interaction.reply({
        content: "Não foi possível banir este membro. Ele deve ter a Força ao seu lado (permissões insuficientes).",
        ephemeral: true,
      });
    }
  },
};
