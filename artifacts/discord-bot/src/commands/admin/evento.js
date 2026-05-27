const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { criarEvento, encerrarEvento, getEvento } = require("../../lib/eventos");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("evento")
    .setDescription("Gerencie eventos especiais do servidor. (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((s) =>
      s.setName("criar")
        .setDescription("Cria um novo evento especial")
        .addStringOption((o) => o.setName("nome").setDescription("Nome do evento").setRequired(true))
        .addIntegerOption((o) =>
          o.setName("duracao").setDescription("Duração em horas (1-72)").setRequired(true).setMinValue(1).setMaxValue(72)
        )
        .addIntegerOption((o) =>
          o.setName("multiplicador").setDescription("Multiplicador de XP (padrão: 2x)").setMinValue(2).setMaxValue(5)
        )
        .addStringOption((o) => o.setName("descricao").setDescription("Descrição do evento"))
    )
    .addSubcommand((s) => s.setName("info").setDescription("Veja o evento ativo no momento"))
    .addSubcommand((s) => s.setName("encerrar").setDescription("Encerra o evento ativo")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const { guild, user } = interaction;

    if (sub === "criar") {
      const existente = await getEvento(guild.id);
      if (existente) {
        return interaction.reply({ content: `⚠️ Já existe um evento ativo: **${existente.nome}**. Encerre-o primeiro.`, ephemeral: true });
      }

      const nome = interaction.options.getString("nome");
      const duracao = interaction.options.getInteger("duracao");
      const multiplicador = interaction.options.getInteger("multiplicador") || 2;
      const desc = interaction.options.getString("descricao") || "Um evento especial galáctico!";

      const ev = await criarEvento(guild.id, { nome, desc, multiplicadorXP: multiplicador, duracaoHoras: duracao, criadoPor: user.id });
      const expiry = Math.floor(ev.expiry / 1000);

      const embed = new EmbedBuilder()
        .setTitle(`🎉 EVENTO ATIVO: ${nome}`)
        .setColor("#FFE81F")
        .setDescription(desc)
        .addFields(
          { name: "⚡ Multiplicador de XP", value: `**${multiplicador}x XP** em todas as mensagens!`, inline: true },
          { name: "⏰ Termina em", value: `<t:${expiry}:R>`, inline: true }
        )
        .setFooter({ text: `Evento criado por ${user.username}` });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "info") {
      const ev = await getEvento(guild.id);
      if (!ev) return interaction.reply({ content: "📭 Nenhum evento ativo no momento.", ephemeral: true });

      const expiry = Math.floor(ev.expiry / 1000);
      const embed = new EmbedBuilder()
        .setTitle(`🎉 Evento Ativo: ${ev.nome}`)
        .setColor("#FFE81F")
        .setDescription(ev.desc)
        .addFields(
          { name: "⚡ Multiplicador", value: `${ev.multiplicadorXP}x XP`, inline: true },
          { name: "⏰ Termina", value: `<t:${expiry}:R>`, inline: true }
        );
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "encerrar") {
      const ok = await encerrarEvento(guild.id);
      if (!ok) return interaction.reply({ content: "❌ Nenhum evento ativo para encerrar.", ephemeral: true });
      return interaction.reply("✅ Evento encerrado. O servidor voltou ao normal.");
    }
  },
};
