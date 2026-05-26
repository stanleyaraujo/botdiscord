const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Verifica se o bot está ativo. Responde com Pong!"),
  async execute(interaction) {
    const sent = await interaction.reply({ content: "🏓 Calculando...", fetchReply: true });
    const latencia = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Latência: **${latencia}ms** | API: **${interaction.client.ws.ping}ms**`);
  },
};
