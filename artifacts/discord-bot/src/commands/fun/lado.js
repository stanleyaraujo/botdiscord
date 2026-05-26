const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const JEDI = [
  { titulo: "Cavaleiro Jedi", desc: "Você é um guardião da paz. A Força Luz guia seus passos.", cor: "#4FC3F7" },
  { titulo: "Mestre Jedi", desc: "Sua sabedoria é lendária no Conselho. A Luz brilha em você.", cor: "#81D4FA" },
  { titulo: "Padawan da Luz", desc: "Ainda aprendiz, mas com um coração puro e determinado.", cor: "#B3E5FC" },
  { titulo: "Guardião da Ordem", desc: "Você protege os inocentes e jamais cede à escuridão.", cor: "#29B6F6" },
];

const SITH = [
  { titulo: "Aprendiz Sith", desc: "A escuridão te chama. Você sente o poder do Lado Sombrio.", cor: "#EF5350" },
  { titulo: "Lorde Sith", desc: "A ambição e a raiva são suas armas. Que o Lado Sombrio te guie.", cor: "#C62828" },
  { titulo: "Agente do Império", desc: "Você serve ao Império com lealdade absoluta e sem hesitação.", cor: "#B71C1C" },
  { titulo: "Discípulo das Trevas", desc: "A ira alimenta seu poder. A Força Sombria responde ao seu chamado.", cor: "#D32F2F" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lado")
    .setDescription("Descubra se você pertence ao Lado da Luz ou ao Lado Sombrio da Força.")
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Verificar outro usuário (padrão: você)")
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const seed = [...alvo.id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const isJedi = seed % 2 === 0;
    const lista = isJedi ? JEDI : SITH;
    const resultado = lista[seed % lista.length];
    const icone = isJedi ? "🔵" : "🔴";
    const ladoNome = isJedi ? "Lado da Luz" : "Lado Sombrio";

    const embed = new EmbedBuilder()
      .setTitle(`${icone} Diagnóstico da Força — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL())
      .setColor(resultado.cor)
      .setDescription(
        `**${ladoNome}**\n` +
        `*${resultado.titulo}*\n\n` +
        resultado.desc
      )
      .setFooter({ text: "A Força revela o que já está em seu coração." });

    await interaction.reply({ embeds: [embed] });
  },
};
