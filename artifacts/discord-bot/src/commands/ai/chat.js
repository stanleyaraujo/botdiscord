const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with a Star Wars character (AI-powered).")
    .addStringOption((option) =>
      option
        .setName("character")
        .setDescription("Who do you want to talk to? (e.g. Yoda, Vader, Obi-Wan)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("message").setDescription("What do you want to say?").setRequired(true)
    ),
  async execute(interaction) {
    const character = interaction.options.getString("character");
    const userMessage = interaction.options.getString("message");

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return interaction.reply({
        content: "The AI Holocron is offline. No OpenAI API key is configured.",
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
              content: `You are ${character} from Star Wars. Always stay in character, using their personality, speech patterns, and knowledge. If you are Yoda, invert sentence structure. If you are Darth Vader, be imposing and dark. Keep responses concise (under 200 words).`,
            },
            { role: "user", content: userMessage },
          ],
          max_tokens: 250,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content;
      await interaction.editReply(`**${character}:** ${reply}`);
    } catch (error) {
      console.error("AI chat error:", error);
      await interaction.editReply(
        "Could not connect to the Holocron network. Check the OpenAI API key configuration."
      );
    }
  },
};
