const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { FACCOES, getFaccaoUser, setFaccaoUser, addPontos, getPlacar } = require("../../lib/faccao");
const { unlock } = require("../../lib/conquistas");
const { addCreditos } = require("../../lib/credits");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("faccao")
    .setDescription("Gerencie sua facção no universo Star Wars.")
    .addSubcommand((s) =>
      s.setName("escolher")
        .setDescription("Escolha sua facção (decisão permanente!)")
        .addStringOption((o) =>
          o.setName("lado").setDescription("Qual lado você serve?").setRequired(true)
            .addChoices(
              { name: "🔵 Ordem Jedi", value: "jedi" },
              { name: "🔴 Império Sith", value: "sith" }
            )
        )
    )
    .addSubcommand((s) => s.setName("info").setDescription("Veja informações da sua facção"))
    .addSubcommand((s) => s.setName("placar").setDescription("Placar atual entre Jedi e Sith"))
    .addSubcommand((s) =>
      s.setName("contribuir").setDescription("Contribua 1 ponto para sua facção (cooldown: 1h)")
    )
    .addSubcommand((s) =>
      s.setName("resetar").setDescription("(Admin) Reseta o placar das facções")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const { guild, user } = interaction;

    if (sub === "escolher") {
      const ladoId = interaction.options.getString("lado");
      const resultado = await setFaccaoUser(guild.id, user.id, ladoId);

      if (resultado === "ja_tem") {
        const faccaoAtual = FACCOES[await getFaccaoUser(guild.id, user.id)];
        return interaction.reply({ content: `⚠️ Você já pertence à **${faccaoAtual.emoji} ${faccaoAtual.nome}**. A escolha é permanente!`, ephemeral: true });
      }

      const faccao = FACCOES[ladoId];
      await unlock(guild.id, user.id, "faccao_leal", interaction.channel);

      const embed = new EmbedBuilder()
        .setTitle(`${faccao.emoji} Bem-vindo à ${faccao.nome}!`)
        .setColor(faccao.cor)
        .setDescription(`*"${faccao.lema}"*\n\n${faccao.desc}`)
        .setFooter({ text: "Esta escolha é permanente. Sirva bem à sua facção!" });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "info") {
      const faccaoId = await getFaccaoUser(guild.id, user.id);
      if (!faccaoId) {
        return interaction.reply({ content: "❓ Você ainda não escolheu uma facção. Use `/faccao escolher`!", ephemeral: true });
      }

      const faccao = FACCOES[faccaoId];
      const placar = await getPlacar(guild.id);

      const embed = new EmbedBuilder()
        .setTitle(`${faccao.emoji} ${faccao.nome}`)
        .setColor(faccao.cor)
        .setDescription(faccao.desc)
        .addFields(
          { name: "⚔️ Lema", value: `*"${faccao.lema}"*`, inline: false },
          { name: "📊 Pontos da facção", value: `${placar[faccaoId]} pontos`, inline: true }
        )
        .setFooter({ text: "Use /faccao contribuir para ganhar pontos para sua facção!" });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "placar") {
      const placar = await getPlacar(guild.id);
      const jedi = FACCOES.jedi;
      const sith = FACCOES.sith;
      const total = placar.jedi + placar.sith || 1;
      const pctJedi = Math.round((placar.jedi / total) * 10);
      const pctSith = 10 - pctJedi;
      const barra = `${"🔵".repeat(pctJedi)}${"🔴".repeat(pctSith)}`;
      const lider = placar.jedi > placar.sith ? jedi : placar.sith > placar.jedi ? sith : null;

      const embed = new EmbedBuilder()
        .setTitle("⚔️ Placar das Facções")
        .setColor("#FFE81F")
        .setDescription(`${barra}\n\n🔵 **${jedi.nome}**: ${placar.jedi} pts\n🔴 **${sith.nome}**: ${placar.sith} pts`)
        .setFooter({ text: lider ? `${lider.emoji} ${lider.nome} está liderando!` : "Empate galáctico!" });

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "contribuir") {
      const faccaoId = await getFaccaoUser(guild.id, user.id);
      if (!faccaoId) {
        return interaction.reply({ content: "❓ Escolha uma facção primeiro com `/faccao escolher`!", ephemeral: true });
      }

      const cdKey = `faccao_cd_${guild.id}_${user.id}`;
      const { QuickDB } = require("quick.db");
      const db = new QuickDB();
      const ultimo = await db.get(cdKey);
      const agora = Date.now();
      const UMA_HORA = 3600_000;

      if (ultimo && agora - ultimo < UMA_HORA) {
        const min = Math.ceil((UMA_HORA - (agora - ultimo)) / 60000);
        return interaction.reply({ content: `⏳ Você já contribuiu recentemente. Tente em **${min} minuto(s)**.`, ephemeral: true });
      }

      await addPontos(guild.id, faccaoId, 1);
      await addCreditos(guild.id, user.id, 5);
      await db.set(cdKey, agora);

      const faccao = FACCOES[faccaoId];
      return interaction.reply(`${faccao.emoji} **+1 ponto** para a **${faccao.nome}**! Você também ganhou **5 créditos** galácticos. 💰`);
    }

    if (sub === "resetar") {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "❌ Apenas administradores podem resetar o placar.", ephemeral: true });
      }
      const { QuickDB } = require("quick.db");
      const db = new QuickDB();
      await db.set(`faccao_pts_${guild.id}_jedi`, 0);
      await db.set(`faccao_pts_${guild.id}_sith`, 0);
      return interaction.reply({ content: "✅ Placar das facções resetado.", ephemeral: true });
    }
  },
};
