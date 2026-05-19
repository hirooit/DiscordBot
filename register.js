const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken("MTQ1MTU5NTAzOTQxODQ4Mjg5MA.Gk4VKI.7pllhYkrs5yIJDEdV3mb9pfRlYO59L7GhintsM");

(async () => {
  try {
    console.log("Slash Command 登録中…");

    await rest.put(
      Routes.applicationCommands("1451595039418482890"),
      { body: commands }
    );

    console.log("登録完了！");
  } catch (error) {
    console.error(error);
  }
})();
