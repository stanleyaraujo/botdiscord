const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Toca uma música no canal de voz.")
    .addStringOption((option) =>
      option
        .setName("musica")
        .setDescription("Nome ou URL da música")
        .setRequired(true)
    ),
  async execute(interaction) {
    const canalVoz = interaction.member.voice.channel;
    if (!canalVoz) {
      return interaction.reply({
        content: "🔇 Você precisa estar em um canal de voz para ouvir a banda da Cantina!",
        ephemeral: true,
      });
    }

    const query = interaction.options.getString("musica");
    await interaction.reply(`🔍 Procurando: **${query}** na Galáxia...`);

    try {
      const distube = interaction.client.distube;
      if (!distube) {
        return interaction.editReply("⚠️ O player de música não está disponível no momento.");
      }
      await distube.play(canalVoz, query, {
        textChannel: interaction.channel,
        member: interaction.member,
      });
    } catch (error) {
      console.error("Erro no play:", error);
      await interaction.editReply("❌ Erro ao tentar tocar a música. Verifique se a URL é válida.");
    }
  },
};
