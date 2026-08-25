const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// 台中購物節開始日期：每年 10/24（月份需 -1，Date 從 0 開始算）
const FESTIVAL_MONTH_INDEX = 9; // 10月
const FESTIVAL_DAY = 24;

function getNextFestivalDate() {
  const now = new Date();
  let year = now.getFullYear();
  let target = new Date(year, FESTIVAL_MONTH_INDEX, FESTIVAL_DAY, 0, 0, 0);

  // 若今年的購物節已經過了，改算明年的
  if (target.getTime() <= now.getTime()) {
    year += 1;
    target = new Date(year, FESTIVAL_MONTH_INDEX, FESTIVAL_DAY, 0, 0, 0);
  }

  return { target, now };
}

function formatCountdown(diffMs) {
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('購物節倒數計時')
    .setDescription('顯示距離台中購物節還有多久'),

  async execute(interaction) {
    const { target, now } = getNextFestivalDate();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) {
      await interaction.reply('🎉 台中購物節已經開始了，快去搶購吧！');
      return;
    }

    const { days, hours, minutes, seconds } = formatCountdown(diffMs);
    const dateLabel = `${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()}`;

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle('🛍️ 台中購物節倒數計時')
      .setDescription(`距離 ${dateLabel} 台中購物節開跑還有：`)
      .addFields(
        { name: '天', value: `${days}`, inline: true },
        { name: '時', value: `${hours}`, inline: true },
        { name: '分', value: `${minutes}`, inline: true },
        { name: '秒', value: `${seconds}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};