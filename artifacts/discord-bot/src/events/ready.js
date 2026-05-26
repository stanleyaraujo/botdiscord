const { ActivityType } = require("discord.js");

const STATUS = [
  { type: ActivityType.Watching, name: "o Império se expandir" },
  { type: ActivityType.Listening, name: "Imperial March" },
  { type: ActivityType.Playing, name: "Jedi: Survivor" },
  { type: ActivityType.Watching, name: "a Aliança Rebelde" },
  { type: ActivityType.Playing, name: "Star Wars Battlefront" },
  { type: ActivityType.Listening, name: "os sussurros da Força" },
  { type: ActivityType.Watching, name: "o Mandaloriano" },
  { type: ActivityType.Playing, name: "LEGO Star Wars" },
  { type: ActivityType.Listening, name: "Duel of the Fates" },
  { type: ActivityType.Watching, name: "a Ordem 66 acontecer" },
];

let statusIndex = 0;

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`[Bot Star Wars] Online! Logado como ${client.user.tag}`);
    console.log(`[Bot Star Wars] Servindo ${client.guilds.cache.size} servidor(es).`);

    const atualizar = () => {
      const s = STATUS[statusIndex % STATUS.length];
      client.user.setPresence({
        activities: [{ name: s.name, type: s.type }],
        status: "online",
      });
      statusIndex++;
    };

    atualizar();
    setInterval(atualizar, 5 * 60 * 1000); // muda a cada 5 minutos
  },
};
