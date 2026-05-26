const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const ENSINAMENTOS_JEDI = [
  { texto: "\"Não há emoção, há paz. Não há ignorância, há conhecimento. Não há paixão, há serenidade.\"", fonte: "Código Jedi" },
  { texto: "\"O medo é o caminho para o lado sombrio. O medo leva à raiva, a raiva leva ao ódio, o ódio leva ao sofrimento.\"", fonte: "Mestre Yoda" },
  { texto: "\"Faça ou não faça. Tentativa não existe.\"", fonte: "Mestre Yoda" },
  { texto: "\"A Força será sempre com você.\"", fonte: "Obi-Wan Kenobi" },
  { texto: "\"Em sua jornada de aprendizado, seja humilde — pois a arrogância fecha a mente para a sabedoria.\"", fonte: "Holocron Jedi" },
  { texto: "\"A paciência é a virtude de quem compreende a Força.\"", fonte: "Mestre Ki-Adi-Mundi" },
  { texto: "\"Um Jedi usa a Força para o conhecimento e defesa, jamais para o ataque.\"", fonte: "Mestre Yoda" },
  { texto: "\"A morte é uma parte natural da vida. Lamente os que se foram, não os sinta falta. Apego leva ao ciúme.\"", fonte: "Mestre Yoda" },
];

const MANDAMENTOS_SITH = [
  { texto: "\"Paz é uma mentira — só há paixão. Pela paixão, ganho força. Pela força, ganho poder. Pelo poder, ganho vitória.\"", fonte: "Código Sith" },
  { texto: "\"Dois há, não mais, não menos. Um para dominar o poder, outro para ansiar por ele.\"", fonte: "Regra dos Dois — Darth Bane" },
  { texto: "\"O poder é o único caminho. Aquele que não busca poder é digno de ser escravo.\"", fonte: "Darth Sidious" },
  { texto: "\"Sua raiva é sua força. Não a reprima — a liberte.\"", fonte: "Darth Vader" },
  { texto: "\"O forte devora o fraco. Essa é a essência da lei Sith.\"", fonte: "Darth Revan" },
  { texto: "\"Use a dor como combustível. O sofrimento forja guerreiros.\"", fonte: "Holocron Sith" },
  { texto: "\"Nunca revele todo o seu poder. A surpresa é a arma mais letal.\"", fonte: "Darth Sidious" },
  { texto: "\"Sobreviva a qualquer custo. A vitória justifica todos os meios.\"", fonte: "Código Sith" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("holocron")
    .setDescription("Abre um Holocron e recebe um ensinamento da Força.")
    .addStringOption((opt) =>
      opt
        .setName("lado")
        .setDescription("Qual lado da Força você consulta?")
        .addChoices(
          { name: "🔵 Jedi (Luz)", value: "jedi" },
          { name: "🔴 Sith (Sombrio)", value: "sith" },
          { name: "🎲 Aleatório", value: "random" }
        )
    ),
  async execute(interaction) {
    const escolha = interaction.options.getString("lado") || "random";
    let lista, cor, titulo, rodape;

    const isJedi = escolha === "jedi" || (escolha === "random" && Math.random() < 0.5);

    if (isJedi) {
      lista = ENSINAMENTOS_JEDI;
      cor = "#4FC3F7";
      titulo = "🔵 Holocron Jedi";
      rodape = "Que a Luz da Força guie seu caminho.";
    } else {
      lista = MANDAMENTOS_SITH;
      cor = "#C62828";
      titulo = "🔴 Holocron Sith";
      rodape = "O poder está ao seu alcance — se você for digno.";
    }

    const ensinamento = lista[Math.floor(Math.random() * lista.length)];

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setColor(cor)
      .setDescription(`*${ensinamento.texto}*\n\n— **${ensinamento.fonte}**`)
      .setFooter({ text: rodape });

    await interaction.reply({ embeds: [embed] });
  },
};
