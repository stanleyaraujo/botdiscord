const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { ITENS } = require("../../lib/loja");

const RARIDADE_COR = { Comum: "⚪", Raro: "🔵", Épico: "🟣", Lendário: "🟡" };

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loja")
    .setDescription("Veja os itens disponíveis na Loja Galáctica."),
  async execute(interaction) {
    const porTipo = {};
    for (const item of ITENS) {
      if (!porTipo[item.tipo]) porTipo[item.tipo] = [];
      porTipo[item.tipo].push(item);
    }

    const NOMES_TIPO = { titulo: "🏅 Títulos", boost: "⚡ Boosts", colecao: "🎁 Colecionáveis" };

    const embed = new EmbedBuilder()
      .setTitle("🏪 Loja Galáctica")
      .setColor("#FFE81F")
      .setDescription("Use `/comprar <id>` para adquirir um item. Ganhe créditos enviando mensagens e completando missões!")
      .setFooter({ text: "Os créditos não expiram. Economize para os itens raros!" });

    for (const [tipo, itens] of Object.entries(porTipo)) {
      const linhas = itens.map((i) =>
        `\`${i.id}\` ${i.icone} **${i.nome}** — **${i.preco}** 💰\n> ${RARIDADE_COR[i.raridade] || "⚪"} ${i.raridade} · ${i.desc}`
      );
      embed.addFields({ name: NOMES_TIPO[tipo] || tipo, value: linhas.join("\n"), inline: false });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
