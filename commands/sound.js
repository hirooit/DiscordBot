const {
  SlashCommandBuilder,
  ChannelType
} = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");
const path = require("path");
const fs = require("fs");

const sounds = require("../sounds.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sound")
    .setDescription("ミーム音声を再生する")
    .addStringOption(option =>
      option
        .setName("name")
        .setDescription("再生するミーム")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  // 予測変換
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();

    const choices = Object.entries(sounds).map(([key, value]) => ({
      name: `${key} ─ ${value.description}`,
      value: key
    }));

    const filtered = choices.filter(choice =>
      choice.name.includes(focusedValue)
    );

    await interaction.respond(filtered.slice(0, 25));
  },

  // 実行処理
  async execute(interaction) {
    const name = interaction.options.getString("name");
    const sound = sounds[name];

    if (!sound) {
      await interaction.reply({ content: "そのミーム無いで", ephemeral: true });
      return;
    }

    const member = interaction.member;
    const channel = member.voice.channel;

    if (!channel) {
      await interaction.reply({ content: "先にVC入ってや！", ephemeral: true });
      return;
    }

    const soundPath = path.join(__dirname, "..", "sounds", sound.file);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(soundPath);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await interaction.reply({ content: `🎵 ${name} 再生中` });
  }
};
