const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lembrar")
    .setDescription("Define um lembrete (Um holocron será ativado).")
    .addIntegerOption((option) =>
      option.setName("tempo").setDescription("Tempo em minutos").setRequired(true).setMinValue(1).setMaxValue(1440)
    )
    .addStringOption((option) =>
      option.setName("mensagem").setDescription("O que devo te lembrar?").setRequired(true)
    ),
  async execute(interaction) {
    const tempo = interaction.options.getInteger("tempo");
    const mensagem = interaction.options.getString("mensagem");

    await interaction.reply(
      `📟 **Holocron ativado!** Vou te lembrar de: "${mensagem}" em ${tempo} minuto(s).`
    );

    setTimeout(async () => {
      try {
        await interaction.user.send(
          `🔵 **MENSAGEM DO HOLOCRON:** Você me pediu para te lembrar de: "${mensagem}"`
        );
      } catch {
        await interaction.channel.send(
          `${interaction.user}, 🔵 **MENSAGEM DO HOLOCRON:** "${mensagem}"`
        );
      }
    }, tempo * 60_000);
  },
};
