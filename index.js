require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // 抓成員清單以隨機挑選獻祭對象時需要
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`已登入為 ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`執行指令 ${interaction.commandName} 時發生錯誤:`, error);
    const errorMessage = { content: '指令執行時發生錯誤，請稍後再試。', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage).catch(() => {});
    } else {
      await interaction.reply(errorMessage).catch(() => {});
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// --- Render 部署用的簡易健康檢查伺服器 ---
// Render 的 Web Service 需要監聽一個 PORT 才會判定服務存活，
// 若日後改用 Background Worker 類型部署，可以移除以下這段。
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('盧媽媽鬼抓人 Bot 運作中！');
});

app.listen(PORT, () => {
  console.log(`健康檢查伺服器已啟動，監聽埠號 ${PORT}`);
});