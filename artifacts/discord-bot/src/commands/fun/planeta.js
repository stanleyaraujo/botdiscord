const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const PLANETAS = [
  { nome: "Tatooine",   tipo: "Deserto",          desc: "Dois sóis, areia em todo lugar e os Jawas te observando. Lar de lendas como Luke e Anakin.", hex: "#FFB74D", icone: "☀️" },
  { nome: "Coruscant",  tipo: "Cidade-planeta",   desc: "O coração político da galáxia. Você nasceu entre as torres e as luzes eternas da capital.", hex: "#90CAF9", icone: "🏙️" },
  { nome: "Naboo",      tipo: "Campestre/Aquático",desc: "Planeta de beleza incomparável, com planícies verdes e cidades subaquáticas Gungan.", hex: "#66BB6A", icone: "🌿" },
  { nome: "Hoth",       tipo: "Gelo eterno",       desc: "Frio, hostil e silencioso. Mas foi aqui que a Aliança provou que nunca desiste.", hex: "#B3E5FC", icone: "❄️" },
  { nome: "Endor",      tipo: "Floresta",          desc: "Lua arborizada lar dos Ewoks. Pequenos, mas responsáveis pela queda do Império.", hex: "#4CAF50", icone: "🌲" },
  { nome: "Dagobah",    tipo: "Pântano",           desc: "Sombrio e úmido — mas foi aqui que os maiores Mestres Jedi escolheram o exílio.", hex: "#388E3C", icone: "🌫️" },
  { nome: "Mustafar",   tipo: "Vulcânico",         desc: "Planeta de lava e destruição. Local do duelo que mudou o destino da galáxia para sempre.", hex: "#EF5350", icone: "🌋" },
  { nome: "Mandalore",  tipo: "Árido/Destruído",   desc: "Lar dos guerreiros mais temidos da galáxia. A honra e o dever correm no seu sangue.", hex: "#78909C", icone: "⚔️" },
  { nome: "Kashyyyk",   tipo: "Floresta gigante",  desc: "Mundo natal dos Wookiees. Árvores colossais e guerreiros leais onde quer que vá.", hex: "#2E7D32", icone: "🦁" },
  { nome: "Alderaan",   tipo: "Montanhas e paz",   desc: "Um planeta de cultura e diplomacia. Infelizmente, sua beleza foi destruída pelo Império.", hex: "#42A5F5", icone: "🕊️" },
  { nome: "Jakku",      tipo: "Deserto de sucata", desc: "Esquecido pelo universo, mas foi aqui que novos heróis encontraram seu destino.", hex: "#FFA726", icone: "🔧" },
  { nome: "Bespin",     tipo: "Cidade nas nuvens",  desc: "Flutuante e elegante, Bespin esconde segredos e traições nas suas torres de tibanna.", hex: "#CE93D8", icone: "☁️" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("planeta")
    .setDescription("Descubra seu planeta natal no universo Star Wars!")
    .addUserOption((opt) =>
      opt.setName("usuario").setDescription("Ver o planeta de outro usuário")
    ),
  async execute(interaction) {
    const alvo = interaction.options.getUser("usuario") || interaction.user;
    const seed = [...alvo.id].reduce((acc, c) => acc + c.charCodeAt(0), 0) + 7;
    const planeta = PLANETAS[seed % PLANETAS.length];

    const embed = new EmbedBuilder()
      .setTitle(`${planeta.icone} Planeta Natal — ${alvo.username}`)
      .setThumbnail(alvo.displayAvatarURL())
      .setColor(planeta.hex)
      .setDescription(`**${planeta.nome}** — *${planeta.tipo}*\n\n${planeta.desc}`)
      .setFooter({ text: "As estrelas guardam segredos sobre a origem de cada ser." });

    await interaction.reply({ embeds: [embed] });
  },
};
