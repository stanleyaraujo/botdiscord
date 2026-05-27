const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { ITENS, getItemById } = require("../../lib/loja");
const { getCreditos, spendCreditos } = require("../../lib/credits");
const { addItem, temItem, ativarBoost, setTituloAtivo } = require("../../lib/inventario");
const { unlock } = require("../../lib/conquistas");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("comprar")
    .setDescription("Compre um item na Loja Galáctica.")
    .addStringOption((o) =>
      o.setName("item").setDescription("ID do item (veja em /loja)").setRequired(true)
        .addChoices(...ITENS.map((i) => ({ name: `${i.icone} ${i.nome} — ${i.preco}💰`, value: i.id })))
    ),
  async execute(interaction) {
    const itemId = interaction.options.getString("item");
    const item = getItemById(itemId);
    const { guild, user } = interaction;

    if (!item) return interaction.reply({ content: "❌ Item não encontrado.", ephemeral: true });

    // Verificar se já tem (exceto boost que pode reativar)
    if (item.tipo !== "boost" && await temItem(guild.id, user.id, itemId)) {
      return interaction.reply({ content: `⚠️ Você já possui **${item.nome}**!`, ephemeral: true });
    }

    const saldo = await getCreditos(guild.id, user.id);
    if (saldo < item.preco) {
      return interaction.reply({
        content: `❌ Créditos insuficientes! Você tem **${saldo}** e precisa de **${item.preco}** 💰`,
        ephemeral: true,
      });
    }

    await spendCreditos(guild.id, user.id, item.preco);
    await addItem(guild.id, user.id, itemId);

    // Aplicar efeito imediato
    if (item.tipo === "boost") {
      await ativarBoost(guild.id, user.id, 3600_000);
    }
    if (item.tipo === "titulo") {
      await setTituloAtivo(guild.id, user.id, itemId);
    }

    await unlock(guild.id, user.id, "colecionador", interaction.channel);

    const saldoNovo = saldo - item.preco;
    const embed = new EmbedBuilder()
      .setTitle(`✅ Compra realizada: ${item.icone} ${item.nome}`)
      .setColor("#66BB6A")
      .setDescription(item.desc)
      .addFields(
        { name: "💳 Saldo anterior", value: `${saldo} 💰`, inline: true },
        { name: "💸 Gasto", value: `-${item.preco} 💰`, inline: true },
        { name: "💰 Saldo atual", value: `${saldoNovo} 💰`, inline: true }
      )
      .setFooter({
        text: item.tipo === "boost"
          ? "⚡ Boost de XP ativado por 1 hora!"
          : item.tipo === "titulo"
          ? "🏅 Título equipado automaticamente! Veja em /info"
          : "🎁 Item adicionado ao seu inventário!",
      });

    await interaction.reply({ embeds: [embed] });
  },
};
