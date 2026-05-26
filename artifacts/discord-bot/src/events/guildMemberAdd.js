const BOAS_VINDAS = [
  "Um novo recruta chegou à **Aliança Rebelde**! Que a Força esteja com você, {user}! ⚡",
  "Sentimos sua presença na Força, {user}! Bem-vindo(a) ao servidor, Padawan! 🌟",
  "O Conselho Jedi reconhece sua chegada, {user}. Que sua jornada comece aqui! 🔵",
  "{user} aterrissou no hangar! Bem-vindo(a) à base da Resistência! 🚀",
  "A Força despertou em {user}! Seja bem-vindo(a), jovem aprendiz! ✨",
  "Novo membro detectado pelos sensores da Estrela da Morte — mas não se preocupe, {user}, estamos do lado certo! ☀️",
];

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const canal = member.guild.systemChannel;
    if (!canal) return;

    const msg = BOAS_VINDAS[Math.floor(Math.random() * BOAS_VINDAS.length)].replace(
      "{user}",
      `<@${member.id}>`
    );

    await canal.send(msg).catch(() => {});
  },
};
