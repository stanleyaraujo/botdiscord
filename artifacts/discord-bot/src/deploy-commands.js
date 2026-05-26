const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error("Variáveis DISCORD_TOKEN, CLIENT_ID ou GUILD_ID não configuradas.");
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`Registrando ${commands.length} comandos slash...`);
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log(`${data.length} comandos registrados com sucesso!`);
  } catch (error) {
    console.error(error);
  }
})();
