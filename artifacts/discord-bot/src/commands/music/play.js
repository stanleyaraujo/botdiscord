const { SlashCommandBuilder } = require("discord.js");
const { addSong } = require("../../lib/music");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Toca uma música no canal de voz.")
    .addStringOption((option) =>
      option
        .setName("musica")
        .setDescription("Nome ou URL do YouTube")
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
    await interaction.reply(`🔍 Procurando: **${query}**...`);

    try {
      const song = await addSong(
        interaction.guild.id,
        canalVoz,
        interaction.channel,
        query
      );

      if (!song) {
        await interaction.editReply("❌ Nenhum resultado encontrado. Tente outro nome ou uma URL do YouTube.");
      } else {
        await interaction.editReply(`✅ **${song.title}** adicionado à fila!`);
      }
    } catch (error) {
      console.error("Erro no /play:", error);
      await interaction.editReply("❌ Erro ao tentar tocar a música. Tente novamente.");
    }
  },
};
