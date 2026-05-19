const { 
  Client, 
  GatewayIntentBits, 
  Collection 
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ====================
// Discord Client
// ====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ====================
// Slash Command 読み込み
// ====================
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

// ====================
// 起動確認
// ====================
client.on("ready", () => {
  console.log("Bot起動！");
});

// ====================
// Slash Command / Autocomplete
// ====================
client.on("interactionCreate", async interaction => {

  // 予測変換（オートコンプリート）
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (command?.autocomplete) {
      await command.autocomplete(interaction);
    }
    return;
  }

  // Slash Command 実行
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "エラー出たで…", ephemeral: true });
    } else {
      await interaction.reply({ content: "エラー出たで…", ephemeral: true });
    }
  }
});

// ====================
// 既存：テキストBot処理
// ====================
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const content = message.content;

  /* --------------------
     ① 四天王ワード
  -------------------- */
  const shitenouWords = [
    "何してる",
    "何してる？",
    "なんしとん",
    "なにやってるん",
    "なにをしてんの"
  ];

  if (shitenouWords.includes(content)) {
    message.reply("何を四天王！？");
    return;
  }

  /* --------------------
     ② 構文
  -------------------- */
  const trigger = ".set";

  if (content.endsWith(trigger)) {
    const userMessage = content
      .slice(0, -trigger.length)
      .trim();

    if (userMessage !== "") {
      message.reply(`いったん「${userMessage}」ではある`);
    }
    return;
  }
});

client.login("MTQ1MTU5NTAzOTQxODQ4Mjg5MA.Gk4VKI.7pllhYkrs5yIJDEdV3mb9pfRlYO59L7GhintsM");
