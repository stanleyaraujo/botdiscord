const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { CONQUISTAS, getConquistas } = require("../../lib/conquistas");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("conquistas")
    .setDescription("Veja as conquistas desbloqueadas.")
    .addUserOption((o) => o.setName("usuario").setDescription("Ver conquistas de outro membro")),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const desbloqueadas = await getConquistas(interaction.guild.id, alvo.id);

    const linhas = CONQUISTAS.map((c) => {
      const tem = desbloqueadas.includes(c.id);
      return tem
        ? `${c.icone} **${c.nome}** — *${c.desc}*`
        : `🔒 ~~${c.nome}~~ — *${c.desc}*`;
    });

    const progresso = desbloqueadas.length;
    const total = CONQUISTAS.length;
    const barra = "█".repeat(Math.round((progresso / total) * 10)) + "░".repeat(10 - Math.round((progresso / total) * 10));

    const embed = new EmbedBuilder()
      .setTitle(`🏅 Conquistas — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL())
      .setColor("#FFE81F")
      .setDescription(linhas.join("\n"))
      .addFields({ name: "📊 Progresso", value: `\`[${barra}]\` ${progresso}/${total}` })
      .setFooter({ text: "Continue explorando o universo Star Wars para desbloquear mais!" });

    await interaction.reply({ embeds: [embed] });
  },
};
