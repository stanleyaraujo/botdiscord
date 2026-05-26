const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const SABRES = [
  { cor: "Azul",     hex: "#4FC3F7", icone: "🔵", desc: "Sabre azul — o clássico da Ordem Jedi. Você é um guardião da paz e da justiça.", portador: "Obi-Wan Kenobi, Anakin Skywalker" },
  { cor: "Verde",    hex: "#66BB6A", icone: "🟢", desc: "Sabre verde — reservado aos mais sintonizados com a Força. Sabedoria e serenidade te definem.", portador: "Yoda, Luke Skywalker" },
  { cor: "Vermelho", hex: "#EF5350", icone: "🔴", desc: "Sabre vermelho — forjado pelo ódio e pelo poder. O Lado Sombrio pulsa em você.", portador: "Darth Vader, Darth Maul" },
  { cor: "Roxo",     hex: "#AB47BC", icone: "🟣", desc: "Sabre roxo — raro e enigmático. Você transita entre a Luz e a Sombra com maestria.", portador: "Mace Windu" },
  { cor: "Amarelo",  hex: "#FFE81F", icone: "🟡", desc: "Sabre amarelo — símbolo dos Guardas do Templo Jedi. Disciplina e proteção são seus pilares.", portador: "Guardas Jedi, Ahsoka Tano" },
  { cor: "Branco",   hex: "#ECEFF1", icone: "⚪", desc: "Sabre branco — purificado e único. Você não segue nenhum lado — segue a própria Força.", portador: "Ahsoka Tano (exílio)" },
  { cor: "Preto (Darksaber)", hex: "#37474F", icone: "⬛", desc: "Darksaber — a lâmina mais lendária da galáxia. Você lidera pela força da vontade e conquista.", portador: "Pre Vizsla, Moff Gideon, Din Djarin" },
  { cor: "Laranja",  hex: "#FFA726", icone: "🟠", desc: "Sabre laranja — extremamente raro. Representa ambição temperada com diplomacia e esperteza.", portador: "Yaddle (lendas), Cal Kestis (certos cristais)" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saber")
    .setDescription("Descubra a cor do seu sabre de luz!")
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Ver o sabre de outro usuário")
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const seed = [...alvo.id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const sabre = SABRES[seed % SABRES.length];

    const embed = new EmbedBuilder()
      .setTitle(`${sabre.icone} Sabre de Luz — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL())
      .setColor(sabre.hex)
      .setDescription(`**${sabre.cor}**\n\n${sabre.desc}`)
      .addFields({ name: "⚔️ Portadores famosos", value: sabre.portador })
      .setFooter({ text: "O cristal Kyber escolhe seu dono — não o contrário." });

    await interaction.reply({ embeds: [embed] });
  },
};
