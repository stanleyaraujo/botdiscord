const { SlashCommandBuilder } = require("discord.js");
const { getCreditos, transferCreditos } = require("../../lib/credits");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transferir")
    .setDescription("Transfira créditos galácticos para outro membro.")
    .addUserOption((o) => o.setName("para").setDescription("Quem vai receber?").setRequired(true))
    .addIntegerOption((o) =>
      o.setName("quantidade").setDescription("Quantos créditos transferir?").setRequired(true).setMinValue(1)
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("para");
    const quantidade = interaction.options.getInteger("quantidade");
    const { guild, user } = interaction;

    if (alvo.id === user.id) return interaction.reply({ content: "❌ Você não pode transferir para si mesmo.", ephemeral: true });
    if (alvo.bot) return interaction.reply({ content: "❌ Droids não aceitam créditos.", ephemeral: true });

    const saldo = await getCreditos(guild.id, user.id);
    if (saldo < quantidade) {
      return interaction.reply({ content: `❌ Saldo insuficiente! Você tem apenas **${saldo}** créditos.`, ephemeral: true });
    }

    await transferCreditos(guild.id, user.id, alvo.id, quantidade);
    const novoSaldo = await getCreditos(guild.id, user.id);

    await interaction.reply(
      `💸 **${user.username}** transferiu **${quantidade} 💰** para **${alvo.username}**!\n` +
      `Seu novo saldo: **${novoSaldo} créditos**.`
    );
  },
};
