const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const TIPOS = {
  boasvindas: { label: "Boas-vindas", desc: "Mensagem quando alguém entra no servidor" },
  levelup: { label: "Subiu de nível", desc: "Notificação de XP ao subir de nível" },
  musica: { label: "Música", desc: "Mensagens do sistema de música" },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configura os canais das mensagens automáticas do bot. (Admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("canal")
        .setDescription("Define o canal para um tipo de mensagem")
        .addStringOption((opt) =>
          opt
            .setName("tipo")
            .setDescription("Tipo de mensagem")
            .setRequired(true)
            .addChoices(
              { name: "🎉 Boas-vindas", value: "boasvindas" },
              { name: "⭐ Subiu de nível (XP)", value: "levelup" },
              { name: "🎶 Música", value: "musica" }
            )
        )
        .addChannelOption((opt) =>
          opt
            .setName("canal")
            .setDescription("Canal de texto onde as mensagens serão enviadas")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("ver")
        .setDescription("Mostra a configuração atual dos canais")
    )
    .addSubcommand((sub) =>
      sub
        .setName("limpar")
        .setDescription("Remove a configuração de um canal (volta ao padrão)")
        .addStringOption((opt) =>
          opt
            .setName("tipo")
            .setDescription("Tipo de mensagem para limpar")
            .setRequired(true)
            .addChoices(
              { name: "🎉 Boas-vindas", value: "boasvindas" },
              { name: "⭐ Subiu de nível (XP)", value: "levelup" },
              { name: "🎶 Música", value: "musica" }
            )
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const configKey = `config_${interaction.guild.id}`;

    if (sub === "canal") {
      const tipo = interaction.options.getString("tipo");
      const canal = interaction.options.getChannel("canal");

      let config = (await db.get(configKey)) || {};
      config[tipo] = canal.id;
      await db.set(configKey, config);

      return interaction.reply({
        content: `✅ Canal de **${TIPOS[tipo].label}** definido para ${canal}!`,
        ephemeral: true,
      });
    }

    if (sub === "ver") {
      const config = (await db.get(configKey)) || {};

      const embed = new EmbedBuilder()
        .setTitle("⚙️ Configuração de Canais — " + interaction.guild.name)
        .setColor("#FFE81F")
        .setDescription("Canais configurados para as mensagens automáticas do bot:")
        .setFooter({ text: "Use /config canal para alterar • /config limpar para remover" });

      for (const [tipo, info] of Object.entries(TIPOS)) {
        const canalId = config[tipo];
        embed.addFields({
          name: info.label,
          value: canalId ? `<#${canalId}>` : "*Canal padrão do servidor*",
          inline: true,
        });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === "limpar") {
      const tipo = interaction.options.getString("tipo");
      let config = (await db.get(configKey)) || {};
      delete config[tipo];
      await db.set(configKey, config);

      return interaction.reply({
        content: `🗑️ Canal de **${TIPOS[tipo].label}** removido. Voltará ao canal padrão do servidor.`,
        ephemeral: true,
      });
    }
  },
};
