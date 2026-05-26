const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const TEMPLATES = [
  { texto: '"{nome} é mais poderoso do que qualquer um de nós poderia imaginar. A Força flui por suas veias."', fonte: "Mestre Yoda" },
  { texto: '"{nome}, eu sou seu... aliado. Junte-se a mim e juntos governaremos a galáxia."', fonte: "Darth Vader (versão alternativa)" },
  { texto: '"Nunca subestime {nome}. Já vi mundos caírem diante de olhos menos determinados."', fonte: "Obi-Wan Kenobi" },
  { texto: '"O Conselho debateu por horas. A conclusão foi unânime: {nome} é o escolhido."', fonte: "Mace Windu" },
  { texto: '"Eu já voei de Kessel para cá em menos de 12 parsecs. Mas {nome} fez em 9. Impressionante."', fonte: "Han Solo" },
  { texto: '"Há algo diferente em {nome}. A Força fala nomes raros — e o dela ecoa em todo o universo."', fonte: "Qui-Gon Jinn" },
  { texto: '"Se {nome} tivesse chegado antes, a Ordem 66 jamais teria acontecido."', fonte: "Ahsoka Tano" },
  { texto: '"Droidi, faça um registro: {nome} foi o único ser que me deixou sem resposta calculada."', fonte: "C-3PO" },
  { texto: '"Beep boo boop beeep." — (tradução: {nome} salvou a galáxia de novo.)', fonte: "R2-D2" },
  { texto: '"O Mandaloriano perguntou quem era o mais temido da galáxia. Todos responderam: {nome}."', fonte: "Din Djarin" },
  { texto: '"Este é o caminho — seguir os passos de {nome}."', fonte: "Credo Mandaloriano" },
  { texto: '"Até o Lado Sombrio hesitou diante de {nome}. E o Lado Sombrio não hesita."', fonte: "Darth Sidious" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("citacao")
    .setDescription("Gera uma citação épica Star Wars com o nome de um usuário.")
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Quem vai ser a lenda desta citação?")
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    const texto = template.texto.replace("{nome}", alvo.displayName || alvo.username);

    const embed = new EmbedBuilder()
      .setTitle("📜 Citação Galáctica")
      .setThumbnail(alvo.displayAvatarURL())
      .setColor("#FFE81F")
      .setDescription(`*${texto}*\n\n— **${template.fonte}**`)
      .setFooter({ text: "Registrado nos Arquivos da Ordem Jedi" });

    await interaction.reply({ embeds: [embed] });
  },
};
