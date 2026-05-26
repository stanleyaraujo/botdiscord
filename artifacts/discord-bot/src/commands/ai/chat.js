const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Converse com um personagem de Star Wars (IA).")
    .addStringOption((option) =>
      option
        .setName("personagem")
        .setDescription("Com quem você quer falar? (Ex: Yoda, Vader, Obi-Wan)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("mensagem").setDescription("O que você quer dizer?").setRequired(true)
    ),
  async execute(interaction) {
    const personagem = interaction.options.getString("personagem");
    const mensagemUsuario = interaction.options.getString("mensagem");

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return interaction.reply({
        content: "O Holocron de IA está offline. Nenhuma chave OpenAI configurada.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Você é ${personagem} de Star Wars. Sempre mantenha o personagem, usando sua personalidade, forma de falar e conhecimento. Se for Yoda, inverta a ordem das frases. Se for Darth Vader, seja imponente e sombrio. Se for Han Solo, seja sarcástico e confiante. Responda sempre em português do Brasil. Seja conciso (menos de 200 palavras).`,
            },
            { role: "user", content: mensagemUsuario },
          ],
          max_tokens: 250,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const resposta = data.choices[0].message.content;
      await interaction.editReply(`**${personagem}:** ${resposta}`);
    } catch (error) {
      console.error("Erro no chat de IA:", error);
      await interaction.editReply(
        "Não foi possível conectar à rede Holocron. Verifique a configuração da chave OpenAI."
      );
    }
  },
};
