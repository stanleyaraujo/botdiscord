const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { addCreditos, getCreditos } = require("../../lib/credits");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addcreditos")
    .setDescription("(Admin) Adiciona créditos galácticos a um membro.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((o) => o.setName("usuario").setDescription("Quem vai receber os créditos?").setRequired(true))
    .addIntegerOption((o) =>
      o.setName("quantidade").setDescription("Quantos créditos adicionar?").setRequired(true).setMinValue(1)
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario");
    const quantidade = interaction.options.getInteger("quantidade");
    const { guild } = interaction;

    const novoSaldo = await addCreditos(guild.id, alvo.id, quantidade);

    await interaction.reply({
      content: `✅ **+${quantidade} 💰** adicionados para **${alvo.username}**.\nNovo saldo: **${novoSaldo} créditos**.`,
      ephemeral: true,
    });
  },
};
