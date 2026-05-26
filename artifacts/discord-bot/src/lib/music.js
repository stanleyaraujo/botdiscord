const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} = require("@discordjs/voice");
const playdl = require("play-dl");

// Mapa de filas por servidor: guildId -> { connection, player, queue, textChannel }
const queues = new Map();

async function getOrCreateQueue(guildId, voiceChannel, textChannel) {
  if (queues.has(guildId)) {
    const q = queues.get(guildId);
    q.textChannel = textChannel;
    return q;
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer();

  connection.subscribe(player);

  const queue = { connection, player, songs: [], textChannel, playing: false };
  queues.set(guildId, queue);

  player.on(AudioPlayerStatus.Idle, () => {
    queue.songs.shift();
    if (queue.songs.length > 0) {
      playSong(guildId, queue.songs[0]);
    } else {
      queue.playing = false;
      queue.textChannel?.send("⏹️ Fila encerrada. Que a Força esteja com você!");
      setTimeout(() => {
        if (!queue.playing) {
          connection.destroy();
          queues.delete(guildId);
        }
      }, 60_000);
    }
  });

  player.on("error", (error) => {
    console.error("Erro no player:", error.message);
    queue.textChannel?.send(`❌ Erro ao tocar: ${error.message}`);
    queue.songs.shift();
    if (queue.songs.length > 0) playSong(guildId, queue.songs[0]);
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch {
      connection.destroy();
      queues.delete(guildId);
    }
  });

  return queue;
}

async function playSong(guildId, song) {
  const queue = queues.get(guildId);
  if (!queue) return;

  try {
    const stream = await playdl.stream(song.url, { quality: 2 });
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    queue.player.play(resource);
    queue.playing = true;
    queue.textChannel?.send(
      `🎶 Tocando agora: **${song.title}** - \`${song.duration}\` (Pedido por: ${song.requestedBy})`
    );
  } catch (err) {
    console.error("Erro ao criar stream:", err.message);
    queue.textChannel?.send(`❌ Não consegui tocar **${song.title}**: ${err.message}`);
    queue.songs.shift();
    if (queue.songs.length > 0) playSong(guildId, queue.songs[0]);
  }
}

async function addSong(guildId, voiceChannel, textChannel, query) {
  let songInfo;

  try {
    const validation = playdl.yt_validate(query);
    if (validation === "video") {
      // URL direta de vídeo — extrai ID e usa URL canônica
      const info = await playdl.video_info(query);
      const videoId = info.video_details.id;
      songInfo = {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: info.video_details.title || "Desconhecido",
        duration: info.video_details.durationRaw || "?",
      };
    } else if (validation === "playlist") {
      // URL de playlist — pega o primeiro vídeo
      const results = await playdl.search(query, { source: { youtube: "video" }, limit: 1 });
      if (!results || results.length === 0) return null;
      const video = results[0];
      songInfo = {
        url: `https://www.youtube.com/watch?v=${video.id}`,
        title: video.title || "Desconhecido",
        duration: video.durationRaw || "?",
      };
    } else {
      // Busca por nome
      const results = await playdl.search(query, { source: { youtube: "video" }, limit: 1 });
      if (!results || results.length === 0) return null;
      const video = results[0];
      songInfo = {
        url: `https://www.youtube.com/watch?v=${video.id}`,
        title: video.title || "Desconhecido",
        duration: video.durationRaw || "?",
      };
    }
  } catch (err) {
    console.error("Erro na busca:", err.message);
    return null;
  }

  const queue = await getOrCreateQueue(guildId, voiceChannel, textChannel);

  const song = { ...songInfo, requestedBy: textChannel.guild?.members?.cache?.get(voiceChannel.id)?.displayName || "alguém" };
  queue.songs.push(song);

  if (!queue.playing) {
    playSong(guildId, queue.songs[0]);
  } else {
    textChannel.send(`✅ Adicionado à fila: **${song.title}**`);
  }

  return song;
}

function stopMusic(guildId) {
  const queue = queues.get(guildId);
  if (!queue) return false;
  queue.songs = [];
  queue.player.stop(true);
  queue.connection.destroy();
  queues.delete(guildId);
  return true;
}

module.exports = { addSong, stopMusic };
