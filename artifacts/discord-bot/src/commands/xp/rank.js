const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Mostra seu nível atual e XP na Ordem Jedi.")
    .addUserOption((option) =>
      option.setName("usuario").setDescription("O usuário para ver o rank")
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const key = `xp_${interaction.guild.id}_${alvo.id}`;
    const userData = (await db.get(key)) || { xp: 0, level: 1 };

    const embed = new EmbedBuilder()
      .setTitle(`📜 Registro da Ordem Jedi — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL())
      .setColor("#FFE81F")
      .addFields(
        { name: "⭐ Nível", value: `${userData.level}`, inline: true },
        { name: "✨ XP", value: `${userData.xp} / ${userData.level * 100}`, inline: true }
      )
      .setFooter({ text: "Continue treinando para se tornar um Mestre Jedi!" });

    await interaction.reply({ embeds: [embed] });
  },
};
