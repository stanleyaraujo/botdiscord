const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  StreamType,
  entersState,
} = require("@discordjs/voice");
const { spawn, execFile } = require("node:child_process");

const YTDLP = "yt-dlp";

// Busca informações do vídeo (por nome ou URL)
function getVideoInfo(query) {
  return new Promise((resolve, reject) => {
    const isUrl = query.startsWith("http://") || query.startsWith("https://");
    const searchQuery = isUrl ? query : `ytsearch1:${query}`;

    execFile(
      YTDLP,
      [
        "--no-warnings",
        "--no-playlist",
        "-j",
        searchQuery,
      ],
      { timeout: 15000 },
      (error, stdout, stderr) => {
        if (error) return reject(new Error(stderr || error.message));
        try {
          const info = JSON.parse(stdout.trim());
          resolve({
            url: `https://www.youtube.com/watch?v=${info.id}`,
            title: info.title || "Desconhecido",
            duration: formatDuration(info.duration || 0),
          });
        } catch {
          reject(new Error("Não foi possível processar as informações do vídeo."));
        }
      }
    );
  });
}

// Cria um stream de áudio via yt-dlp pipe
function createYtDlpStream(url) {
  const ytdlp = spawn(YTDLP, [
    "--no-warnings",
    "--no-playlist",
    "-f", "bestaudio",
    "-o", "-",
    "--quiet",
    url,
  ]);

  ytdlp.stderr.on("data", (d) => {
    const msg = d.toString().trim();
    if (msg) console.error("[yt-dlp]", msg);
  });

  return ytdlp.stdout;
}

function formatDuration(seconds) {
  if (!seconds) return "?";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Mapa de filas por servidor
const queues = new Map();

async function playSong(guildId, song) {
  const queue = queues.get(guildId);
  if (!queue) return;

  try {
    const rawStream = createYtDlpStream(song.url);
    const resource = createAudioResource(rawStream, { inputType: StreamType.Arbitrary });

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

async function addSong(guildId, voiceChannel, textChannel, query) {
  let songInfo;
  try {
    songInfo = await getVideoInfo(query);
  } catch (err) {
    console.error("Erro na busca:", err.message);
    return null;
  }

  const queue = await getOrCreateQueue(guildId, voiceChannel, textChannel);

  const member = voiceChannel.members?.get(voiceChannel.guild.members?.cache?.first()?.id);
  const song = {
    ...songInfo,
    requestedBy: textChannel.guild?.members?.cache?.find(
      (m) => m.voice?.channelId === voiceChannel.id && !m.user.bot
    )?.displayName || "alguém",
  };

  queue.songs.push(song);

  if (!queue.playing) {
    playSong(guildId, queue.songs[0]);
  } else {
    textChannel.send(`✅ Adicionado à fila: **${song.title}** - \`${song.duration}\``);
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
