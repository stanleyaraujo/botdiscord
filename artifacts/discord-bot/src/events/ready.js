module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`[Bot Star Wars] Online! Logado como ${client.user.tag}`);
    console.log(`[Bot Star Wars] Servindo ${client.guilds.cache.size} servidor(es).`);
  },
};
