const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("enquete")
    .setDescription("Cria uma enquete temática com até 4 opções.")
    .addStringOption((opt) =>
      opt.setName("pergunta").setDescription("A pergunta da enquete").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("opcao1").setDescription("Opção 1").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("opcao2").setDescription("Opção 2").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("opcao3").setDescription("Opção 3 (opcional)")
    )
    .addStringOption((opt) =>
      opt.setName("opcao4").setDescription("Opção 4 (opcional)")
    ),
  async execute(interaction) {
    const pergunta = interaction.options.getString("pergunta");
    const opcoes = [
      interaction.options.getString("opcao1"),
      interaction.options.getString("opcao2"),
      interaction.options.getString("opcao3"),
      interaction.options.getString("opcao4"),
    ].filter(Boolean);

    const linhas = opcoes.map((o, i) => `${EMOJIS[i]} ${o}`).join("\n");

    const embed = new EmbedBuilder()
      .setTitle("📊 Enquete Galáctica")
      .setColor("#FFE81F")
      .setDescription(`**${pergunta}**\n\n${linhas}`)
      .setFooter({ text: `Enquete criada por ${interaction.user.username} · Vote com os emojis abaixo!` });

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < opcoes.length; i++) {
      await msg.react(EMOJIS[i]);
    }
  },
};
