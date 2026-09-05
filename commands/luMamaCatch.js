const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');
const path = require('path');

// 獻祭圖片路徑（自備的 webp 檔，放在 assets 資料夾內）
const SACRIFICE_IMAGE_PATH = path.join(__dirname, '..', 'assets', 'sacrifice.webp');
const SACRIFICE_IMAGE_FILENAME = 'sacrifice.webp';

// 思考中訊息的點點動畫設定
const THINKING_TEXT = '盧媽媽正在思考該抓誰向自己獻祭';
const THINKING_STEPS = 7; // 點點總共增加幾次
const THINKING_INTERVAL_MS = 1000; // 每次增加的間隔（毫秒）

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('盧媽媽鬼抓人')
    .setDescription('盧媽媽決定抓一位群內用戶向她獻祭')
    .addUserOption((option) =>
      option
        .setName('目標')
        .setDescription('指定要獻祭的成員（選填，留空則隨機抽選）')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: '這個指令只能在伺服器內使用喔。',
        ephemeral: true,
      });
      return;
    }

    // 取得指令輸入的指定對象（若有）
    const specifiedUser = interaction.options.getUser('目標');

    // 先送出「思考中」訊息，之後用 editReply 做出點點越來越多的動畫
    await interaction.reply(THINKING_TEXT);

    for (let i = 1; i <= THINKING_STEPS; i += 1) {
      await sleep(THINKING_INTERVAL_MS);
      await interaction.editReply(THINKING_TEXT + '。'.repeat(i));
    }

    let targetUser = specifiedUser;

    // 若未指定目標，才從伺服器的非 Bot 成員中隨機挑選獻祭對象
    if (!targetUser) {
      const targetMember = await pickRandomMember(interaction);

      if (!targetMember) {
        await interaction.editReply('盧媽媽找不到可以獻祭的對象，只好先放過大家了。');
        return;
      }

      targetUser = targetMember.user;
    }

    const embed = new EmbedBuilder()
      .setColor(0x8b0000)
      .setTitle('盧媽媽鬼抓人')
      .setDescription(`🩸 盧媽媽決定抓 <@${targetUser.id}> 向她獻祭。`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .setImage(`attachment://${SACRIFICE_IMAGE_FILENAME}`)
      .setFooter({ text: '獻祭已完成' })
      .setTimestamp();

    const attachment = new AttachmentBuilder(SACRIFICE_IMAGE_PATH, {
      name: SACRIFICE_IMAGE_FILENAME,
    });

    await interaction.editReply({
      content: null,
      embeds: [embed],
      files: [attachment],
    });
  },
};

async function pickRandomMember(interaction) {
  try {
    const members = await interaction.guild.members.fetch();
    const candidates = members.filter((member) => !member.user.bot);
    if (candidates.size === 0) return null;
    const randomIndex = Math.floor(Math.random() * candidates.size);
    return [...candidates.values()][randomIndex];
  } catch (err) {
    console.error('抓取伺服器成員清單失敗:', err);
    return null;
  }
}
