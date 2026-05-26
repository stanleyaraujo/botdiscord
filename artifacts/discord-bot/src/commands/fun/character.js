const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const personagens = [
  { nome: "Luke Skywalker", papel: "Cavaleiro Jedi", lado: "Luz", descricao: "O fazendeiro que se tornou um lendário Jedi." },
  { nome: "Darth Vader", papel: "Lorde Sith", lado: "Sombrio", descricao: "Antes Anakin Skywalker, agora servo do Imperador." },
  { nome: "Yoda", papel: "Grão-Mestre Jedi", lado: "Luz", descricao: "Com 900 anos, o ser mais sábio da galáxia." },
  { nome: "Han Solo", papel: "Contrabandista", lado: "Luz", descricao: "Piloto do Millennium Falcon e herói relutante." },
  { nome: "Leia Organa", papel: "Princesa / General", lado: "Luz", descricao: "Líder da Rebelião e sensível à Força." },
  { nome: "Obi-Wan Kenobi", papel: "Mestre Jedi", lado: "Luz", descricao: "Mestre de Anakin Skywalker e mentor de Luke." },
  { nome: "Darth Maul", papel: "Lorde Sith", lado: "Sombrio", descricao: "Um feroz aprendiz Sith com sabre de luz duplo." },
  { nome: "Ahsoka Tano", papel: "Ex-Padawan", lado: "Luz", descricao: "A aprendiz de Anakin que seguiu seu próprio caminho." },
  { nome: "Boba Fett", papel: "Caçador de Recompensas", lado: "Neutro", descricao: "O caçador de recompensas mais temido da galáxia." },
  { nome: "Din Djarin (Mando)", papel: "Mandaloriano", lado: "Luz", descricao: "Isto é o Caminho." },
  { nome: "Kylo Ren", papel: "Líder Supremo", lado: "Sombrio", descricao: "Ben Solo, dividido entre a luz e a escuridão." },
  { nome: "Rey", papel: "Jedi", lado: "Luz", descricao: "Uma catadora de Jakku que se tornou Jedi." },
  { nome: "Palpatine", papel: "Imperador / Lorde Sith", lado: "Sombrio", descricao: "O verdadeiro mentor por trás da queda da República." },
  { nome: "Chewbacca", papel: "Co-piloto Wookiee", lado: "Luz", descricao: "O leal parceiro de Han e um mecânico incrível." },
  { nome: "Grogu (Baby Yoda)", papel: "Jovem Sensível à Força", lado: "Luz", descricao: "Uma criança poderosa da espécie de Yoda." },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("personagem")
    .setDescription("Sorteia um personagem aleatório de Star Wars."),
  async execute(interaction) {
    const p = personagens[Math.floor(Math.random() * personagens.length)];
    const cor = p.lado === "Luz" ? "#4FC3F7" : p.lado === "Sombrio" ? "#B71C1C" : "#757575";

    const embed = new EmbedBuilder()
      .setTitle(`👤 Personagem Sorteado: ${p.nome}`)
      .setDescription(p.descricao)
      .setColor(cor)
      .addFields(
        { name: "🎭 Papel", value: p.papel, inline: true },
        { name: "⚖️ Lado", value: p.lado, inline: true }
      )
      .setFooter({ text: "Que a Força esteja com você." });

    await interaction.reply({ embeds: [embed] });
  },
};
