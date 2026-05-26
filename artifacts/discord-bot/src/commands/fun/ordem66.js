const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const MENSAGENS = [
  "🔴 **ORDEM 66 EXECUTADA.** Todos os Jedis serão eliminados. O Império não aceita resistência.",
  "☠️ **ORDEM 66 ATIVADA.** Clonetrooper aqui — o chanceler enviou uma mensagem especial para todos vocês.",
  "⚠️ **ORDEM 66.** \"Execute-os.\" — Darth Sidious. Nenhum Jedi deve sobreviver.",
  "🌑 **PALPATINE:** *'Eu sou o Senado.'* — **Ordem 66 em efeito.** Que o Império prevaleça.",
  "💀 **ORDEM 66 DECRETADA.** Os Clonetrooper estão a caminho. Que a Força esteja... com os sobreviventes.",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ordem66")
    .setDescription("Executa a Ordem 66 no servidor. (requer permissão de admin)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const msg = MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)];
    await interaction.reply(`@everyone\n\n${msg}`);
  },
};
