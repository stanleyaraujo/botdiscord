module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`[Star Wars Bot] Online! Logged in as ${client.user.tag}`);
    console.log(`[Star Wars Bot] Serving ${client.guilds.cache.size} server(s).`);
  },
};
