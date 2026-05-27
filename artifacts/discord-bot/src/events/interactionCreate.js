const { Events } = require("discord.js");
const { trackProgress } = require("../lib/missions");

// Comandos que rastreiam progresso da missão "Explorador"
const CMDS_EXPLORADOR = new Set(["planeta", "nave", "lado", "saber"]);

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Nenhum comando encontrado para: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erro ao executar o comando ${interaction.commandName}:`, error);
      const msg = { content: "Houve um erro ao executar este comando!", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg);
      } else {
        await interaction.reply(msg);
      }
    }

    // Rastreamento de missões por comando (após execução)
    if (!interaction.guild) return;

    const cmd = interaction.commandName;

    if (cmd === "holocron") {
      await trackProgress(interaction.guild.id, interaction.user.id, "holocron", 1).catch(() => {});
    }

    if (CMDS_EXPLORADOR.has(cmd)) {
      await trackProgress(interaction.guild.id, interaction.user.id, "explorador", 1).catch(() => {});
    }
  },
};
