const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getCreditos, spendCreditos, addCreditos } = require("../../lib/credits");
const { unlock } = require("../../lib/conquistas");

const META = 23;

function cartaAleatoria() { return Math.floor(Math.random() * 9) + 1; }
function soma(mao) { return mao.reduce((a, b) => a + b, 0); }
function formatarMao(mao) { return mao.map((c) => `\`${c}\``).join(" + ") + ` = **${soma(mao)}**`; }

function buildEmbed(maoJogador, aposta, status = "") {
  return new EmbedBuilder()
    .setTitle("🃏 Sabacc — Apostas Galácticas")
    .setColor("#FFE81F")
    .setDescription(
      `**Sua mão:** ${formatarMao(maoJogador)}\n` +
      `**Meta:** chegar em ${META} sem ultrapassar\n` +
      (status ? `\n${status}` : "")
    )
    .setFooter({ text: `Aposta: ${aposta} 💰` });
}

function buildBotoes(disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("sabacc_comprar").setLabel("Comprar carta").setStyle(ButtonStyle.Primary).setEmoji("🃏").setDisabled(disabled),
    new ButtonBuilder().setCustomId("sabacc_parar").setLabel("Parar").setStyle(ButtonStyle.Secondary).setEmoji("✋").setDisabled(disabled)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sabacc")
    .setDescription("Jogue Sabacc contra o bot e aposte créditos galácticos!")
    .addIntegerOption((o) =>
      o.setName("aposta").setDescription("Quantos créditos apostar?").setRequired(true).setMinValue(10).setMaxValue(500)
    ),
  async execute(interaction) {
    const aposta = interaction.options.getInteger("aposta");
    const { guild, user } = interaction;

    const saldo = await getCreditos(guild.id, user.id);
    if (saldo < aposta) {
      return interaction.reply({ content: `❌ Saldo insuficiente! Você tem **${saldo} 💰** e a aposta é **${aposta} 💰**.`, ephemeral: true });
    }

    await spendCreditos(guild.id, user.id, aposta);
    await unlock(guild.id, user.id, "apostador", interaction.channel);

    const maoJogador = [cartaAleatoria(), cartaAleatoria()];

    const msg = await interaction.reply({
      embeds: [buildEmbed(maoJogador, aposta)],
      components: [buildBotoes()],
      fetchReply: true,
    });

    const coletor = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === user.id,
      time: 30_000,
    });

    coletor.on("collect", async (btn) => {
      await btn.deferUpdate();

      if (btn.customId === "sabacc_comprar") {
        maoJogador.push(cartaAleatoria());
        const total = soma(maoJogador);

        if (total > META) {
          coletor.stop("bust");
          await btn.editReply({
            embeds: [buildEmbed(maoJogador, aposta, `💥 **Você estourou!** (${total} > ${META})\nPerda: **-${aposta} 💰**`)],
            components: [buildBotoes(true)],
          });
          return;
        }

        if (total === META) {
          coletor.stop("sabacc");
          return;
        }

        await btn.editReply({ embeds: [buildEmbed(maoJogador, aposta)], components: [buildBotoes()] });
      }

      if (btn.customId === "sabacc_parar") {
        coletor.stop("parou");
      }
    });

    coletor.on("end", async (_, reason) => {
      if (reason === "bust") return;

      const totalJogador = soma(maoJogador);

      // Bot joga
      const maoBot = [cartaAleatoria(), cartaAleatoria()];
      while (soma(maoBot) < 15 && soma(maoBot) <= META) {
        maoBot.push(cartaAleatoria());
      }
      const totalBot = soma(maoBot);

      let resultado, ganhou;
      if (reason === "sabacc") {
        resultado = `🌟 **SABACC PERFEITO!** Você acertou ${META}!\nGanho: **+${aposta * 2} 💰**`;
        ganhou = true;
        await addCreditos(guild.id, user.id, aposta * 3);
      } else if (totalBot > META) {
        resultado = `🎉 O bot estourou (${totalBot})! **Você vence!**\nGanho: **+${aposta} 💰**`;
        ganhou = true;
        await addCreditos(guild.id, user.id, aposta * 2);
      } else if (totalJogador > totalBot) {
        resultado = `🎉 **Você vence!** (${totalJogador} vs ${totalBot})\nGanho: **+${aposta} 💰**`;
        ganhou = true;
        await addCreditos(guild.id, user.id, aposta * 2);
      } else if (totalBot > totalJogador) {
        resultado = `😔 **O bot vence.** (${totalJogador} vs ${totalBot})\nPerda: **-${aposta} 💰**`;
        ganhou = false;
      } else {
        resultado = `🤝 **Empate!** (${totalJogador} vs ${totalBot})\nAposta devolvida.`;
        ganhou = null;
        await addCreditos(guild.id, user.id, aposta);
      }

      const embed = new EmbedBuilder()
        .setTitle("🃏 Resultado do Sabacc")
        .setColor(ganhou === true ? "#66BB6A" : ganhou === false ? "#EF5350" : "#FFE81F")
        .addFields(
          { name: "🧑 Sua mão", value: formatarMao(maoJogador), inline: true },
          { name: "🤖 Mão do bot", value: formatarMao(maoBot), inline: true },
          { name: "\u200b", value: resultado }
        )
        .setFooter({ text: reason === "time" ? "Tempo esgotado — aposta perdida." : "Que a sorte esteja com você!" });

      try {
        await msg.edit({ embeds: [embed], components: [buildBotoes(true)] });
      } catch { /* ignored */ }
    });
  },
};
