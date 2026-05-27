const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getCreditos } = require("../../lib/credits");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("creditos")
    .setDescription("Veja seus créditos galácticos.")
    .addUserOption((o) => o.setName("usuario").setDescription("Ver créditos de outro membro")),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const total = await getCreditos(interaction.guild.id, alvo.id);

    const nivel =
      total >= 1000 ? "💎 Magnata Galáctico" :
      total >= 500  ? "💰 Comerciante Rico" :
      total >= 200  ? "🪙 Mercador" :
      total >= 50   ? "🔩 Trabalhador" :
                      "🌱 Sem créditos suficientes";

    const embed = new EmbedBuilder()
      .setTitle(`💰 Créditos Galácticos — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL())
      .setColor("#FFE81F")
      .addFields(
        { name: "💳 Saldo", value: `**${total}** créditos`, inline: true },
        { name: "📊 Status", value: nivel, inline: true }
      )
      .setFooter({ text: "Ganhe créditos enviando mensagens, vencendo duelos e completando missões!" });

    await interaction.reply({ embeds: [embed] });
  },
};
