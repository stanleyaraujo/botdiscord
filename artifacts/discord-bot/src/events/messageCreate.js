const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const key = `xp_${message.guild.id}_${message.author.id}`;
    let userData = (await db.get(key)) || { xp: 0, level: 1 };

    const xpGanho = Math.floor(Math.random() * 11) + 5;
    userData.xp += xpGanho;

    const xpProximoNivel = userData.level * 100;

    if (userData.xp >= xpProximoNivel) {
      userData.level++;
      userData.xp = 0;
      message.reply(
        `✨ **Parabéns, Jovem Padawan!** Você subiu para o nível **${userData.level}**! Que a Força esteja com você.`
      );
    }

    await db.set(key, userData);
  },
};
