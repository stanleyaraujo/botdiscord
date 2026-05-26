const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const MISSOES = [
  { titulo: "Infiltração na Estrela da Morte", desc: "Disfarce-se de Stormtrooper e recupere os planos secretos da superarma do Império.", recompensa: "500 créditos galácticos + título de Herói da Aliança" },
  { titulo: "Resgate em Jabba's Palace", desc: "Seu aliado foi capturado por Jabba the Hutt. Infiltre o palácio e traga-o de volta com vida.", recompensa: "Gratidão eterna + acesso à sala secreta do Conselho" },
  { titulo: "Destruição do Gerador de Escudo", desc: "A frota precisa de você em Endor. Desative o gerador de escudo antes que a batalha comece.", recompensa: "Medalha da Batalha de Endor + rank especial" },
  { titulo: "Treinamento com Mestre Yoda", desc: "Viaje a Dagobah e complete o treinamento na Força por 7 dias sem perder a paciência.", recompensa: "Sabre de luz forjado pelo próprio Yoda" },
  { titulo: "Escolta do Mandaloriano", desc: "Proteja o Mandaloriano e a criança enquanto cruzam território inimigo até o ponto seguro.", recompensa: "Armadura Beskar personalizada" },
  { titulo: "Missão Cética em Mustafar", desc: "Recupere documentos imperiais das ruínas da fortaleza de Vader antes que o Império retorne.", recompensa: "Arquivos secretos do Império + XP bônus" },
  { titulo: "Operação Leia", desc: "A princesa está em apuros novamente. Encontre o sinal do R2-D2 e interceda antes que seja tarde.", recompensa: "Holografia pessoal da Senadora + honra da Aliança" },
  { titulo: "Caça ao Recompensa", desc: "Um alvo valioso foi avistado em Nar Shaddaa. Capture-o vivo — o Hutt paga bem.", recompensa: "Recompensa de 1.000 créditos + armamento de elite" },
  { titulo: "Espionagem no Senado Galáctico", desc: "Infiltre-se na sessão secreta e descubra quem está financiando o lado sombrio por dentro.", recompensa: "Informações classificadas Nível Omega" },
  { titulo: "Patrulha nos Campos de Asteroides", desc: "Piratas estão atacando naves de suprimentos. Proteja o comboio até o porto seguro.", recompensa: "Nave melhorada + combustível hiperespacial" },
];

const DIFICULDADES = ["🟢 Fácil", "🟡 Média", "🟠 Difícil", "🔴 Lendária"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("missao")
    .setDescription("Receba uma missão épica do universo Star Wars!"),
  async execute(interaction) {
    const missao = MISSOES[Math.floor(Math.random() * MISSOES.length)];
    const dificuldade = DIFICULDADES[Math.floor(Math.random() * DIFICULDADES.length)];

    const embed = new EmbedBuilder()
      .setTitle(`📋 Missão: ${missao.titulo}`)
      .setColor("#FFE81F")
      .setDescription(missao.desc)
      .addFields(
        { name: "⚔️ Dificuldade", value: dificuldade, inline: true },
        { name: "🏆 Recompensa", value: missao.recompensa, inline: false }
      )
      .setFooter({ text: `Missão aceita por ${interaction.user.username} · Que a Força esteja com você!` });

    await interaction.reply({ embeds: [embed] });
  },
};
