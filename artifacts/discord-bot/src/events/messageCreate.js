const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const key = `xp_${message.guild.id}_${message.author.id}`;
    let userData = (await db.get(key)) || { xp: 0, level: 1 };

    const xpGain = Math.floor(Math.random() * 11) + 5;
    userData.xp += xpGain;

    const nextLevelXP = userData.level * 100;

    if (userData.xp >= nextLevelXP) {
      userData.level++;
      userData.xp = 0;
      message.reply(
        `✨ **Congratulations, Young Padawan!** You reached level **${userData.level}**! May the Force be with you.`
      );
    }

    await db.set(key, userData);
  },
};
