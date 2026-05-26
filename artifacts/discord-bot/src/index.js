const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

// Carregando comandos
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`[AVISO] Comando ${file} não possui "data" ou "execute".`);
    }
  }
}

// Carregando eventos
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("A variável de ambiente DISCORD_TOKEN não está definida.");
  process.exit(1);
}

client.login(token);
