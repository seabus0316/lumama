require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`開始註冊 ${commands.length} 個斜線指令...`);

    if (process.env.GUILD_ID) {
      // 註冊到單一伺服器：立即生效，適合測試
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
      console.log(`已註冊到伺服器 ${process.env.GUILD_ID}（立即生效）`);
    } else {
      // 全域註冊：所有伺服器都能用，但可能需要等待約1小時才會生效
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
      console.log('已完成全域註冊（可能需要等待約1小時生效）');
    }
  } catch (error) {
    console.error('註冊指令失敗:', error);
  }
})();