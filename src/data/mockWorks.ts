import type { Work, UrgeMessage, UrgeState } from '../types';

export const mockWorks: Work[] = [
  {
    id: 'work-1',
    title: '星河彼岸',
    author: '流光',
    cover: '🌌',
    type: '小说',
    description: '跨越星海的冒险故事，少年与神秘少女的相遇，揭开宇宙的秘密。',
    lastChapter: '第128章 星门开启',
    lastUpdateDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceUpdate: 1,
    popularity: 9800,
    hasNewChapter: false,
  },
  {
    id: 'work-2',
    title: '雾山奇谭',
    author: '墨白',
    cover: '⛰️',
    type: '漫画',
    description: '云雾缭绕的深山之中，隐藏着不为人知的奇异世界。',
    lastChapter: '第45话 山灵之约',
    lastUpdateDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceUpdate: 5,
    popularity: 7600,
    hasNewChapter: true,
  },
  {
    id: 'work-3',
    title: '甜品店的猫',
    author: '糖糖',
    cover: '🍰',
    type: '漫画',
    description: '街角甜品店里的一只橘猫，每天都在见证温暖的小故事。',
    lastChapter: '第32话 草莓蛋糕',
    lastUpdateDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceUpdate: 12,
    popularity: 5400,
    hasNewChapter: false,
  },
  {
    id: 'work-4',
    title: '赛博都市',
    author: 'Neon',
    cover: '🌆',
    type: '小说',
    description: '霓虹闪烁的未来都市，黑客与AI的博弈，人性与科技的边界。',
    lastChapter: '第256章 数据洪流',
    lastUpdateDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceUpdate: 20,
    popularity: 12000,
    hasNewChapter: false,
  },
  {
    id: 'work-5',
    title: '花间集',
    author: '林清',
    cover: '🌸',
    type: '漫画',
    description: '十二种花，十二个故事，每一朵花都有它的花语和传说。',
    lastChapter: '第12话 紫阳花',
    lastUpdateDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceUpdate: 3,
    popularity: 8900,
    hasNewChapter: false,
  },
  {
    id: 'work-6',
    title: '深海回响',
    author: '蓝',
    cover: '🌊',
    type: '小说',
    description: '海洋深处传来神秘的声音，少女踏上了寻找失落文明的旅程。',
    lastChapter: '第89章 人鱼之歌',
    lastUpdateDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceUpdate: 30,
    popularity: 6700,
    hasNewChapter: true,
  },
  {
    id: 'work-7',
    title: '妖怪食堂',
    author: '宵夜',
    cover: '🍜',
    type: '漫画',
    description: '只在深夜营业的神秘食堂，客人都是各式各样的妖怪。',
    lastChapter: '第67话 九尾狐的拉面',
    lastUpdateDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceUpdate: 7,
    popularity: 11200,
    hasNewChapter: false,
  },
  {
    id: 'work-8',
    title: '时间邮局',
    author: '钟晓',
    cover: '✉️',
    type: '小说',
    description: '可以寄给过去或未来的邮局，每一封信都承载着沉甸甸的思念。',
    lastChapter: '第56章 十年后的回信',
    lastUpdateDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    daysSinceUpdate: 2,
    popularity: 8500,
    hasNewChapter: false,
  },
];

export const encouragementMessages = [
  '作者大大辛苦啦！慢慢来，注意身体~',
  '好期待下一章！会一直等你的✨',
  '你的作品我超喜欢！加油加油！',
  '每天都来看看，等着你的新惊喜',
  '不急不急，好故事值得等待💕',
  '谢谢你带来这么棒的故事！',
  '注意休息哦，我们一直都在~',
  '太太的画工/文笔越来越好了！',
];

export const urgeMessageOptions = [
  '太太加油！我们都在等你~',
  '蹲一个更新，不急慢慢来',
  '好期待下一章！',
  '每天都来刷新，希望有惊喜',
  '辛苦了，注意身体哦',
  '催一下下，轻轻的那种~',
];

const fanNames = [
  { name: '星星爱好者', avatar: '⭐' },
  { name: '银河漫游', avatar: '🚀' },
  { name: '山中客', avatar: '🍃' },
  { name: '猫猫党', avatar: '🐱' },
  { name: '书虫一号', avatar: '🐛' },
  { name: '夜读侠', avatar: '🦉' },
  { name: '甜食控', avatar: '🍩' },
  { name: '画中仙', avatar: '🎨' },
  { name: '追光者', avatar: '🌟' },
  { name: '暖阳', avatar: '☀️' },
  { name: '小鱼干', avatar: '�' },
  { name: '蜜桃酱', avatar: '🍑' },
];

const fanMessages = [
  '等不及想看后续了！',
  '太太加油！期待更新~',
  '等了好久终于等到了！',
  '每天必刷的更新页面！',
  '求更新！跪求！',
  '好想看下一章啊~',
  '追了两年的老粉来催更了',
  '不更新就...就继续等！',
  '催更不急，注意身体',
  '等着你的好故事呢！',
  '太太快更新！想你了~',
  '沙发！一定要坐上！',
];

function generateFanMessages(workId: string, count: number): UrgeMessage[] {
  const messages: UrgeMessage[] = [];
  for (let i = 0; i < count; i++) {
    const fan = fanNames[Math.floor(Math.random() * fanNames.length)];
    const msg = fanMessages[Math.floor(Math.random() * fanMessages.length)];
    messages.push({
      id: `fan-${workId}-${i}`,
      workId,
      userName: fan.name,
      avatar: fan.avatar,
      message: msg,
      createdAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
    });
  }
  return messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const supportCardSlogans = [
  '每一份等待，都是最好的陪伴',
  '慢慢来，我们一直都在',
  '好故事值得等待，好作者值得守护',
  '你的读者，永远温柔以待',
  '并肩守候，不负期待',
];

export const urgeStates: Record<string, UrgeState> = {
  'work-1': {
    workId: 'work-1',
    currentCount: 432,
    targetCount: 500,
    messages: generateFanMessages('work-1', 8),
    userHasUrged: false,
    supportCard: null,
  },
  'work-2': {
    workId: 'work-2',
    currentCount: 489,
    targetCount: 500,
    messages: generateFanMessages('work-2', 6),
    userHasUrged: false,
    supportCard: null,
  },
  'work-3': {
    workId: 'work-3',
    currentCount: 189,
    targetCount: 300,
    messages: generateFanMessages('work-3', 5),
    userHasUrged: false,
    supportCard: null,
  },
  'work-4': {
    workId: 'work-4',
    currentCount: 620,
    targetCount: 800,
    messages: generateFanMessages('work-4', 10),
    userHasUrged: false,
    supportCard: null,
  },
  'work-5': {
    workId: 'work-5',
    currentCount: 345,
    targetCount: 400,
    messages: generateFanMessages('work-5', 4),
    userHasUrged: false,
    supportCard: null,
  },
  'work-6': {
    workId: 'work-6',
    currentCount: 560,
    targetCount: 600,
    messages: generateFanMessages('work-6', 7),
    userHasUrged: false,
    supportCard: null,
  },
  'work-7': {
    workId: 'work-7',
    currentCount: 298,
    targetCount: 500,
    messages: generateFanMessages('work-7', 9),
    userHasUrged: false,
    supportCard: null,
  },
  'work-8': {
    workId: 'work-8',
    currentCount: 175,
    targetCount: 300,
    messages: generateFanMessages('work-8', 3),
    userHasUrged: false,
    supportCard: null,
  },
};

export const beastColors = [
  '#FF8C69',
  '#FFB5C5',
  '#98D8C8',
  '#FFE66D',
  '#A8E6CF',
  '#DDA0DD',
  '#87CEEB',
  '#F0E68C',
];
