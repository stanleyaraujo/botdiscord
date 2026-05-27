const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { addCreditos } = require("../../lib/credits");
const { unlock } = require("../../lib/conquistas");

const FRASES = [
  "Que a Força esteja com você",
  "Faça ou não faça, tentativa não existe",
  "Este é o caminho",
  "Eu sou seu pai",
  "Não há emoção, há paz",
  "Só há dois e um mestre para dominar o poder",
  "O Império vai contra-atacar",
  "Ajuda-me Obi-Wan Kenobi, você é minha única esperança",
  "Já voei de Kessel para cá em menos de doze parsecs",
  "Procure não, faça ou não faça",
];

const ativasGuildChannel = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("corrida")
    .setDescription("Corrida de digitação! Quem digitar a frase primeiro ganha créditos!"),
  async execute(interaction) {
    const chave = `${interaction.guild.id}_${interaction.channel.id}`;
    if (ativasGuildChannel.has(chave)) {
      return interaction.reply({ content: "⚡ Já há uma corrida em andamento neste canal!", ephemeral: true });
    }

    const frase = FRASES[Math.floor(Math.random() * FRASES.length)];
    const premio = Math.floor(Math.random() * 31) + 20; // 20-50 créditos
    ativasGuildChannel.add(chave);

    const embed = new EmbedBuilder()
      .setTitle("💨 Corrida de Digitação — Mais Rápido que o Falcon!")
      .setColor("#FFE81F")
      .setDescription(`**Digite exatamente a frase abaixo o mais rápido possível:**\n\n> *${frase}*`)
      .addFields({ name: "🏆 Prêmio", value: `${premio} créditos galácticos 💰` })
      .setFooter({ text: "Você tem 20 segundos! Atenção ao texto exato." });

    await interaction.reply({ embeds: [embed] });

    const filtro = (m) => m.content.trim().toLowerCase() === frase.toLowerCase();
    const coletor = interaction.channel.createMessageCollector({ filter: filtro, time: 20_000, max: 1 });

    coletor.on("collect", async (m) => {
      await addCreditos(interaction.guild.id, m.author.id, premio);
      await unlock(interaction.guild.id, m.author.id, "corredor", interaction.channel);
      m.reply(`🏆 **${m.author.username}** venceu a corrida e ganhou **${premio} 💰**! Mais rápido que o Millennium Falcon!`);
    });

    coletor.on("end", (coletados) => {
      ativasGuildChannel.delete(chave);
      if (coletados.size === 0) {
        interaction.followUp(`⏰ Ninguém digitou a frase a tempo! A resposta era:\n> *${frase}*`);
      }
    });
  },
};
