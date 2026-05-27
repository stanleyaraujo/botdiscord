const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { ITENS, getItemById } = require("../../lib/loja");
const { getInventario, setTituloAtivo, temBoostAtivo } = require("../../lib/inventario");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventario")
    .setDescription("Gerencie seu inventário galáctico.")
    .addSubcommand((s) => s.setName("ver").setDescription("Veja seus itens"))
    .addSubcommand((s) =>
      s.setName("usar")
        .setDescription("Equipe um título do seu inventário")
        .addStringOption((o) =>
          o.setName("titulo")
            .setDescription("ID do título para equipar")
            .setRequired(true)
            .addChoices(
              ...ITENS.filter((i) => i.tipo === "titulo").map((i) => ({ name: `${i.icone} ${i.nome}`, value: i.id }))
            )
        )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const { guild, user } = interaction;

    if (sub === "ver") {
      const inv = await getInventario(guild.id, user.id);
      const boostAtivo = await temBoostAtivo(guild.id, user.id);

      if (inv.itens.length === 0) {
        return interaction.reply({ content: "📭 Seu inventário está vazio. Use `/loja` para comprar itens!", ephemeral: true });
      }

      // Agrupar por tipo
      const grupos = { titulo: [], boost: [], colecao: [] };
      for (const id of inv.itens) {
        const item = getItemById(id);
        if (item) grupos[item.tipo]?.push(item);
      }

      const embed = new EmbedBuilder()
        .setTitle(`🎒 Inventário — ${user.username}`)
        .setColor("#FFE81F")
        .setFooter({ text: "Use /inventario usar <titulo> para equipar um título" });

      if (grupos.titulo.length > 0) {
        embed.addFields({
          name: "🏅 Títulos",
          value: grupos.titulo.map((i) =>
            `${i.icone} **${i.nome}**${inv.tituloAtivo === i.id ? " ✅ *[Equipado]*" : ""}`
          ).join("\n"),
        });
      }
      if (grupos.boost.length > 0) {
        embed.addFields({
          name: "⚡ Boosts",
          value: grupos.boost.map((i) =>
            `${i.icone} **${i.nome}**${boostAtivo ? " ✅ *[Ativo]*" : " *(use /comprar para reativar)*"}`
          ).join("\n"),
        });
      }
      if (grupos.colecao.length > 0) {
        embed.addFields({
          name: "🎁 Colecionáveis",
          value: grupos.colecao.map((i) => `${i.icone} **${i.nome}**`).join("\n"),
        });
      }

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "usar") {
      const tituloId = interaction.options.getString("titulo");
      const ok = await setTituloAtivo(guild.id, user.id, tituloId);

      if (!ok) {
        return interaction.reply({ content: "❌ Você não possui este título. Compre-o em `/loja`!", ephemeral: true });
      }

      const item = getItemById(tituloId);
      return interaction.reply(`✅ Título **${item.icone} ${item.nome}** equipado! Aparecerá no seu \`/info\`.`);
    }
  },
};
