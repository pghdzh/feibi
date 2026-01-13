<template>
  <div class="sacred-prayer-page">
    <!-- 神圣背景 -->
    <div class="sacred-background">
      <div class="bg-glow-1"></div>
      <div class="bg-glow-2"></div>
      <div class="bg-glow-3"></div>
      <div class="floating-candles">
        <div
          class="candle"
          v-for="n in 5"
          :key="n"
          :style="getCandleStyle(n)"
        ></div>
      </div>
      <div class="prayer-dust">
        <div
          class="dust"
          v-for="n in 20"
          :key="n"
          :style="getDustStyle(n)"
        ></div>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="prayer-container">
      <!-- 神圣标题区 -->
      <header class="sacred-header">
        <div class="header-ornament left">❖</div>
        <div class="header-content">
          <h1 class="sacred-title">
            <span class="title-text">菲比的祈福殿</span>
            <span class="title-icon">🕊️</span>
          </h1>
          <p class="sacred-subtitle">于此，为你书写今日的吉言与温柔指引</p>
          <div class="title-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-star">✦</div>
            <div class="decoration-line"></div>
          </div>
        </div>
        <div class="header-ornament right">❖</div>
      </header>

      <!-- 神圣时钟 -->
      <div class="sacred-clock">
        <div class="clock-inner">
          <div class="clock-hour">{{ currentHour }}</div>
          <div class="clock-colon">:</div>
          <div class="clock-minute">{{ currentMinute }}</div>
        </div>
        <div class="clock-date">{{ currentDate }}</div>
      </div>

      <!-- 祈福主卡片 -->
      <main class="sacred-altar">
        <div class="altar-glow"></div>
        <div class="altar-base"></div>

        <!-- 卡片容器 -->
        <div class="prayer-card-container">
          <!-- 正面卡片 -->
          <transition name="card-flip">
            <div
              v-if="!result || revealMode === 'front'"
              class="prayer-card front"
              :class="{ 'card-shake': isAnimating }"
            >
              <div class="card-sacred-border"></div>
              <div class="card-content">
                <div class="sacred-icon">🕯️</div>
                <h2 class="prayer-title">向菲比许愿</h2>
                <p class="prayer-desc">每日一次祈福 · 聆听温柔指引</p>

                <div class="sacred-button-wrapper">
                  <button
                    class="sacred-pray-button"
                    :disabled="isAnimating || !dailyAvailable"
                    @click="prayOnce"
                    :class="{ 'button-disabled': !dailyAvailable }"
                  >
                    <span class="button-text">
                      {{ dailyAvailable ? "祈 福" : "今日已祈福" }}
                    </span>
                    <span class="button-glow"></span>
                    <span class="button-sparkles">
                      <span class="sparkle" v-for="n in 8" :key="n"></span>
                    </span>
                  </button>

                  <div class="prayer-hint" v-if="!dailyAvailable">
                    <span class="hint-icon">⏳</span>
                    <span>明日 {{ resetTime }} 后可再次祈福</span>
                  </div>
                </div>

                <div class="prayer-stats">
                  <div class="stat">
                    <span class="stat-icon">📅</span>
                    <span class="stat-label">今日运势</span>
                    <span class="stat-value">{{
                      dailyAvailable ? "待开启" : "已获得"
                    }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">🎵</span>
                    <span class="stat-label">语音祝福</span>
                    <span class="stat-value">{{ totalAudioCount }} 种</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- 背面卡片 -->
          <transition name="card-reveal">
            <div
              v-if="result && revealMode === 'back'"
              class="prayer-card back"
            >
              <div class="card-sacred-border"></div>
              <div class="card-content">
                <!-- 运势头部 -->
                <div class="fortune-header">
                  <div
                    class="fortune-rarity"
                    :class="result.rarity.toLowerCase()"
                  >
                    <span class="rarity-icon">✨</span>
                    <span class="rarity-text">{{ result.rarity }}</span>
                    <span class="rarity-glow"></span>
                  </div>
                  <h3 class="fortune-name">{{ result.name }}</h3>
                </div>

                <!-- 运势主体 -->
                <div class="fortune-body">
                  <!-- 运势文本 -->
                  <div class="fortune-text-container">
                    <div class="text-icon">📜</div>
                    <div class="fortune-text">
                      <p class="typed-text">{{ typedText }}</p>
                      <div class="typing-cursor" v-show="isTyping"></div>
                    </div>
                  </div>

                  <!-- 运势详情 -->
                  <div class="fortune-details">
                    <div class="detail-grid">
                      <div class="detail-card">
                        <div class="detail-icon">💡</div>
                        <div class="detail-content">
                          <div class="detail-label">建议</div>
                          <div class="detail-value">{{ result.advice }}</div>
                        </div>
                      </div>

                      <div class="detail-card">
                        <div class="detail-icon">🎁</div>
                        <div class="detail-content">
                          <div class="detail-label">幸运物</div>
                          <div class="detail-value">{{ result.luckyItem }}</div>
                        </div>
                      </div>

                      <div class="detail-card">
                        <div class="detail-icon">🎨</div>
                        <div class="detail-content">
                          <div class="detail-label">幸运色</div>
                          <div
                            class="color-sample"
                            :style="{ backgroundColor: result.luckyColor }"
                          ></div>
                        </div>
                      </div>

                      <div class="detail-card">
                        <div class="detail-icon">🔢</div>
                        <div class="detail-content">
                          <div class="detail-label">幸运数</div>
                          <div class="detail-value number">
                            {{ result.luckyNumber }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 诗句 -->
                  <div class="fortune-poem" v-if="result.poem">
                    <div class="poem-icon">📖</div>
                    <div class="poem-content">
                      <p class="poem-text">"{{ result.poem }}"</p>
                      <p class="poem-title">— {{ result.poemTitle }}</p>
                    </div>
                  </div>

                  <!-- 音频信息 -->
                  <div class="audio-info" v-if="audioIndex">
                    <div class="audio-icon">🎵</div>
                    <div class="audio-content">
                      <div class="audio-title">已聆听语音祝福</div>
                      <div class="audio-id">ID: {{ audioIndex }}</div>
                      <div class="audio-error" v-if="audioError">
                        （语音播放失败）
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 运势底部 -->
                <div class="fortune-footer">
                  <button
                    class="pray-again-button"
                    @click="resetPrayer"
                    :disabled="!dailyAvailable"
                  >
                    <span class="button-icon">🔄</span>
                    <span class="button-text">明日再祈</span>
                  </button>
                  <div class="fortune-time">
                    <span class="time-icon">🕒</span>
                    <span class="time-text">祈福于 {{ prayerTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 祭坛装饰 -->
        <div class="altar-ornaments">
          <div class="ornament left">❖</div>
          <div class="ornament right">❖</div>
        </div>
      </main>

      <!-- 页脚 -->
      <footer class="sacred-footer">
        <div class="footer-content">
          <div class="footer-text">
            <span class="footer-icon">✨</span>
            <p>菲比轻声：愿你今日温柔以待自己</p>
          </div>
          <div class="footer-hint">点击祈福按钮，聆听菲比的温柔指引</div>
        </div>
      </footer>
    </div>

    <!-- 加载状态 -->
    <transition name="fade">
      <div class="sacred-loading" v-if="isAnimating">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-text">祈福中...</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const totalAudioCount = 23;

/* localStorage keys */
const STORAGE_KEY_DATE = "feibi-prayer-date-v2";
const STORAGE_KEY_RESULT = "feibi-prayer-result-v2";
const STORAGE_KEY_PLAYED_MAP = "feibi-played-audios-v2";

// 状态
const dailyAvailable = ref(true);
const isAnimating = ref(false);
const result = ref<any>(null);
const typedText = ref("");
let typer: number | null = null;

const audioIndex = ref<number | null>(null);
const audioError = ref(false);
const revealMode = ref<"front" | "back">("front");

// 时间状态
const currentTime = ref(new Date());
const currentHour = computed(() =>
  currentTime.value.getHours().toString().padStart(2, "0")
);
const currentMinute = computed(() =>
  currentTime.value.getMinutes().toString().padStart(2, "0")
);
const currentDate = computed(() => {
  const date = currentTime.value;
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${date.getMonth() + 1}月${date.getDate()}日 周${
    weekdays[date.getDay()]
  }`;
});
const prayerTime = ref("");
const resetTime = computed(() => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return "00:00";
});

// 祈祷数据
const prayers = [
  {
    name: "星光守护",
    rarity: "SSR",
    weight: 3,
    text: "今夜星辰替你照亮前路，心向光明，便能遇见机缘。",
    advice: "大胆迈出第一步。",
    luckyItem: "星形发夹",
    luckyColor: "#FFD166",
    luckyNumber: 7,
    poemTitle: "春日",
    poem: "一日春风满，人间皆是喜。",
  },
  {
    name: "云端许愿",
    rarity: "SR",
    weight: 10,
    text: "将愿望轻声放飞，云会替你保留一片晴。",
    advice: "写下愿望并付诸小行动。",
    luckyItem: "小云挂件",
    luckyColor: "#E6F7FF",
    luckyNumber: 4,
  },
  {
    name: "暖语相伴",
    rarity: "SR",
    weight: 10,
    text: "有人会为你送来一句暖心话，别忘了回以微笑。",
    advice: "尝试主动问候一位好友。",
    luckyItem: "温暖便签",
    luckyColor: "#FFF4E6",
    luckyNumber: 3,
  },
  {
    name: "日常安好",
    rarity: "R",
    weight: 30,
    text: "平常即是福，细小之中藏着安稳。",
    advice: "把待办拆成小步完成。",
    luckyItem: "小贴纸",
    luckyColor: "#F0FBFF",
    luckyNumber: 2,
  },
  {
    name: "灵感微光",
    rarity: "SR",
    weight: 10,
    text: "灵感如风，及时记录会带来意想不到的惊喜。",
    advice: "准备纸笔记录瞬间想法。",
    luckyItem: "彩色笔",
    luckyColor: "#FFF7F0",
    luckyNumber: 5,
  },
  {
    name: "菲比的巧思",
    rarity: "SR",
    weight: 10,
    text: "用心的装饰会带来好感，细节正是魔法。",
    advice: "今天整理一个小物件。",
    luckyItem: "丝带",
    luckyColor: "#FFEFD5",
    luckyNumber: 9,
  },
  {
    name: "暖阳午后",
    rarity: "R",
    weight: 30,
    text: "午后阳光适合小憩，补充能量再出发。",
    advice: "抽十分钟喝杯热饮放松。",
    luckyItem: "茶杯贴纸",
    luckyColor: "#FFF8E6",
    luckyNumber: 6,
  },
  {
    name: "花影轻摇",
    rarity: "R",
    weight: 30,
    text: "身边的小美好会给你意想不到的好心情。",
    advice: "拍张花的照片留作纪念。",
    luckyItem: "花朵徽章",
    luckyColor: "#FFDDE6",
    luckyNumber: 11,
  },
  {
    name: "秘密信笺",
    rarity: "R",
    weight: 30,
    text: "一封未寄的信或一段未说的话，或许值得一写。",
    advice: "写下一段心里话，不必发出。",
    luckyItem: "便签本",
    luckyColor: "#FFF0FB",
    luckyNumber: 8,
  },
  {
    name: "微笑馈赠",
    rarity: "SR",
    weight: 10,
    text: "一个微笑会点亮别人的一天，也会温暖自己。",
    advice: "遇见人时微笑三秒。",
    luckyItem: "贴纸包",
    luckyColor: "#FDEBD0",
    luckyNumber: 1,
  },
  {
    name: "静水流深",
    rarity: "R",
    weight: 30,
    text: "静下心来，很多答案会自己浮现。",
    advice: "今晚做一次短时冥想。",
    luckyItem: "香囊",
    luckyColor: "#EAF7FF",
    luckyNumber: 10,
  },
  {
    name: "新芽初长",
    rarity: "SR",
    weight: 10,
    text: "新的计划有萌芽之势，给它一些养分与时间。",
    advice: "列出三件可执行的小任务。",
    luckyItem: "小铅笔",
    luckyColor: "#FFF7E6",
    luckyNumber: 12,
  },
  {
    name: "意外之喜",
    rarity: "SR",
    weight: 10,
    text: "今日或有小惊喜，保持好奇与开放的态度。",
    advice: "去尝试一件你平常不会做的小事。",
    luckyItem: "礼物盒",
    luckyColor: "#FFF3E8",
    luckyNumber: 13,
  },
  {
    name: "温柔守候",
    rarity: "R",
    weight: 30,
    text: "有人在暗处为你守候，别忘了感激与回报。",
    advice: "给重要的人发个问候。",
    luckyItem: "暖心卡",
    luckyColor: "#FFF6F8",
    luckyNumber: 14,
  },
  {
    name: "小财入袋",
    rarity: "R",
    weight: 30,
    text: "小额的收获会到来，别忘了记录与规划。",
    advice: "把额外收入记下作为惊喜。",
    luckyItem: "零钱包",
    luckyColor: "#FFF9F0",
    luckyNumber: 15,
  },
  {
    name: "旧事释怀",
    rarity: "R",
    weight: 30,
    text: "过去的牵挂有机会放下，心会轻一些。",
    advice: "写封信给过去的自己（无需发送）。",
    luckyItem: "信封",
    luckyColor: "#F7FBFF",
    luckyNumber: 16,
  },
  {
    name: "梦里月光",
    rarity: "SR",
    weight: 10,
    text: "夜里梦境送来温柔提示，明日记得留心。",
    advice: "睡前放松，记录梦境片段。",
    luckyItem: "月亮贴纸",
    luckyColor: "#FFF8FF",
    luckyNumber: 17,
  },
  {
    name: "友谊之花",
    rarity: "R",
    weight: 30,
    text: "与朋友相处会有温暖瞬间，珍惜彼此。",
    advice: "安排一次短聚或通话。",
    luckyItem: "小花标签",
    luckyColor: "#FFF0E8",
    luckyNumber: 18,
  },
];

/* helpers */
function weightedPick(list: any[]) {
  const sum = list.reduce((s, i) => s + (i.weight || 1), 0);
  let r = Math.random() * sum;
  for (const it of list) {
    if (r < (it.weight || 1)) return it;
    r -= it.weight || 1;
  }
  return list[list.length - 1];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* 恢复当天状态 */
function loadTodayState() {
  try {
    const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
    const savedResultJson = localStorage.getItem(STORAGE_KEY_RESULT);
    const today = todayStr();

    if (savedDate === today && savedResultJson) {
      const saved = JSON.parse(savedResultJson);
      result.value = saved.prayer;
      audioIndex.value = saved.audioIndex ?? null;
      dailyAvailable.value = false;
      revealMode.value = "back";
      prayerTime.value = saved.prayerTime || getCurrentTime();
      typedText.value = result.value?.text ?? "";
    } else {
      dailyAvailable.value = true;
      result.value = null;
      audioIndex.value = null;
      revealMode.value = "front";
      typedText.value = "";
    }
  } catch (e) {
    console.warn("loadTodayState error", e);
    dailyAvailable.value = true;
  }
}

/* 记录已播放音频 */
function recordPlayedAudioId(id: number) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYED_MAP);
    let arr: number[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) arr = [];
    if (!arr.includes(id)) {
      arr.push(id);
      localStorage.setItem(STORAGE_KEY_PLAYED_MAP, JSON.stringify(arr));
    }
  } catch (e) {
    console.warn("recordPlayedAudioId failed", e);
  }
}

/* 获取当前时间字符串 */
function getCurrentTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

/* 抽签主流程 */
async function prayOnce() {
  if (!dailyAvailable.value || isAnimating.value) return;

  isAnimating.value = true;
  result.value = null;
  typedText.value = "";
  revealMode.value = "front";
  prayerTime.value = getCurrentTime();

  // 等待动画
  await new Promise((r) => setTimeout(r, 600));

  // 随机选择祈祷
  const pick = weightedPick(prayers);
  result.value = { ...pick };

  // 随机选择音频
  const chosenAudio = Math.floor(Math.random() * totalAudioCount) + 1;
  audioIndex.value = chosenAudio;

  // 保存到本地存储
  try {
    localStorage.setItem(STORAGE_KEY_DATE, todayStr());
    localStorage.setItem(
      STORAGE_KEY_RESULT,
      JSON.stringify({
        prayer: result.value,
        audioIndex: audioIndex.value,
        prayerTime: prayerTime.value,
      })
    );
  } catch (e) {
    console.warn("save today result failed", e);
  }

  // 打字机效果
  const full = result.value.text || "";
  let i = 0;
  if (typer) {
    clearInterval(typer);
    typer = null;
  }

  typer = window.setInterval(() => {
    i++;
    typedText.value = full.slice(0, i);
    if (i >= full.length) {
      if (typer) {
        clearInterval(typer);
        typer = null;
      }
    }
  }, 40);

  // 切换到背面
  revealMode.value = "back";

  // 播放音频
  try {
    playVoice(`audio (${chosenAudio}).mp3`);
  } catch (e) {
    console.warn("audio playback error", e);
    audioError.value = true;
  }

  // 记录播放的音频ID
  recordPlayedAudioId(chosenAudio);

  // 完成
  isAnimating.value = false;
  dailyAvailable.value = false;
}

function playVoice(name: string) {
  const audio = new Audio(`/audio/${name}`);
  audio.play().catch((e) => console.warn("音频播放失败：", e));
}

/* 重置祈祷 */
function resetPrayer() {
  result.value = null;
  typedText.value = "";
  revealMode.value = "front";
}

// 打字状态计算属性
const isTyping = computed(() => {
  if (!result.value) return false;
  return typedText.value.length < result.value.text.length;
});

// 蜡烛样式生成
function getCandleStyle(index: number) {
  const angle = (index / 5) * Math.PI * 2;
  const radius = 150;
  return {
    left: `calc(50% + ${Math.cos(angle) * radius}px)`,
    top: `calc(50% + ${Math.sin(angle) * radius}px)`,
    animationDelay: `${index * 0.3}s`,
  };
}

// 灰尘粒子样式生成
function getDustStyle(index: number) {
  const size = Math.random() * 4 + 1;
  const duration = Math.random() * 3 + 2;
  const delay = Math.random() * 5;

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
}

// 更新时间
let timeInterval: number;

onMounted(() => {
  loadTodayState();
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onBeforeUnmount(() => {
  if (typer) {
    clearInterval(typer);
    typer = null;
  }
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped lang="scss">
  @use "sass:math";
/* ==== 菲比风格配色变量 ==== */
$phoebe-gold: #f6de97;
$phoebe-gold-light: #fff9e6;
$phoebe-blue-dark: #0c1e3a;
$phoebe-blue-deep: #07122b;
$phoebe-blue-light: #3b7be0;
$phoebe-blue-bright: #6aa7ff;
$phoebe-white: #fafcfd;
$phoebe-white-trans: rgba(250, 252, 253, 0.95);

/* 过渡动画 */
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$transition-slow: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

/* 阴影 */
$shadow-sm: 0 4px 12px rgba($phoebe-blue-dark, 0.1);
$shadow-md: 0 8px 32px rgba($phoebe-blue-dark, 0.15);
$shadow-lg: 0 16px 64px rgba($phoebe-blue-dark, 0.2);
$shadow-xl: 0 24px 80px rgba($phoebe-blue-dark, 0.25);
$shadow-gold: 0 0 20px rgba($phoebe-gold, 0.3);
$shadow-blue: 0 0 20px rgba($phoebe-blue-bright, 0.3);

/* 基础样式 */
.sacred-prayer-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    $phoebe-blue-deep 0%,
    $phoebe-blue-dark 100%
  );
  color: $phoebe-white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC",
    "PingFang SC", sans-serif;
  position: relative;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
  padding-top: 80px;
}

/* 神圣背景 */
.sacred-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;

  .bg-glow-1 {
    position: absolute;
    top: 10%;
    left: 10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba($phoebe-gold, 0.1) 0%,
      transparent 70%
    );
    filter: blur(40px);
    animation: float 20s ease-in-out infinite;
  }

  .bg-glow-2 {
    position: absolute;
    bottom: 10%;
    right: 10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      rgba($phoebe-blue-bright, 0.08) 0%,
      transparent 70%
    );
    filter: blur(60px);
    animation: float 25s ease-in-out infinite reverse;
  }

  .bg-glow-3 {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      rgba($phoebe-blue-light, 0.05) 0%,
      transparent 70%
    );
    filter: blur(80px);
    transform: translate(-50%, -50%);
  }

  .floating-candles {
    position: absolute;
    inset: 0;

    .candle {
      position: absolute;
      width: 12px;
      height: 30px;
      background: linear-gradient(
        to bottom,
        $phoebe-gold,
        rgba($phoebe-gold, 15%)
      );
      border-radius: 4px;
      animation: candle-float 4s ease-in-out infinite;

      &::before {
        content: "";
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 8px;
        height: 12px;
        background: linear-gradient(to bottom, #ff6b6b, #ffd93d);
        border-radius: 50%;
        filter: blur(2px);
        animation: candle-flame 1.5s ease-in-out infinite;
      }
    }
  }

  .prayer-dust {
    position: absolute;
    inset: 0;

    .dust {
      position: absolute;
      background: rgba($phoebe-gold, 0.6);
      border-radius: 50%;
      filter: blur(1px);
      animation: dust-float linear infinite;
    }
  }
}

/* 容器 */
.prayer-container {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 神圣标题区 */
.sacred-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;

  .header-ornament {
    font-size: 2rem;
    color: rgba($phoebe-gold, 0.3);
    opacity: 0.5;
  }

  .header-content {
    text-align: center;
  }

  .sacred-title {
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(
      135deg,
      $phoebe-gold 0%,
      $phoebe-blue-bright 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-flex;
    align-items: center;
    gap: 20px;

    .title-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 4px 8px rgba($phoebe-gold, 0.3));
      animation: float 3s ease-in-out infinite;
    }
  }

  .sacred-subtitle {
    font-size: 1.2rem;
    color: rgba($phoebe-white, 0.8);
    margin: 20px 0 30px;
    font-weight: 300;
    letter-spacing: 2px;
  }

  .title-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;

    .decoration-line {
      width: 100px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba($phoebe-gold, 0.5) 50%,
        transparent 100%
      );
    }

    .decoration-star {
      font-size: 2rem;
      color: $phoebe-gold;
      animation: rotate 10s linear infinite;
    }
  }
}

/* 神圣时钟 */
.sacred-clock {
  background: rgba($phoebe-blue-dark, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 40px;
  border: 1px solid rgba($phoebe-gold, 0.1);
  box-shadow: $shadow-md;
  text-align: center;

  .clock-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;

    .clock-hour,
    .clock-minute {
      font-size: 3.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, $phoebe-gold, $phoebe-blue-bright);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 10px rgba($phoebe-gold, 0.2);
    }

    .clock-colon {
      font-size: 3rem;
      color: rgba($phoebe-white, 0.5);
      animation: blink 2s infinite;
    }
  }

  .clock-date {
    font-size: 1.1rem;
    color: rgba($phoebe-white, 0.7);
    letter-spacing: 1px;
  }
}

/* 神圣祭坛 */
.sacred-altar {
  position: relative;
  margin-bottom: 60px;

  .altar-glow {
    position: absolute;
    inset: -50px;
    background: radial-gradient(
      circle at center,
      rgba($phoebe-gold, 0.1) 0%,
      transparent 70%
    );
    filter: blur(40px);
    z-index: -1;
  }

  .altar-base {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 60px;
    background: linear-gradient(
      to bottom,
      rgba($phoebe-blue-dark, 0.8),
      rgba($phoebe-blue-deep, 0.9)
    );
    border-radius: 50%;
    filter: blur(20px);
    z-index: -1;
  }
}

/* 卡片容器 */
.prayer-card-container {
  perspective: 1200px;
  min-height: 800px;
}

/* 祈福卡片 */
.prayer-card {
  position: relative;
  width: 100%;
  min-height: 800px;
  background: linear-gradient(
    145deg,
    rgba($phoebe-blue-dark, 0.9) 0%,
    rgba($phoebe-blue-deep, 0.95) 100%
  );

  border-radius: 30px;
  border: 1px solid rgba($phoebe-gold, 0.2);
  box-shadow: $shadow-xl, $shadow-gold;
  padding: 40px;
  box-sizing: border-box;
  transform-style: preserve-3d;

  &.front {
    .card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 30px;
    }
  }

  &.back {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .card-sacred-border {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(
      135deg,
      rgba($phoebe-gold, 0.3),
      rgba($phoebe-blue-bright, 0.1),
      rgba($phoebe-gold, 0.3)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}

/* 卡片动画 */
.card-flip-enter-active,
.card-flip-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-flip-enter-from {
  opacity: 0;
  transform: rotateY(-180deg) scale(0.9);
}

.card-flip-leave-to {
  opacity: 0;
  transform: rotateY(180deg) scale(0.9);
}

.card-reveal-enter-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.2s;
}

.card-reveal-enter-from {
  opacity: 0;
  transform: scale(0.95) rotateY(-30deg);
}

.card-shake {
  animation: card-shake 0.5s ease;
}

/* 正面卡片内容 */
.sacred-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: gentle-float 3s ease-in-out infinite;
}

.prayer-title {
  font-size: 2.5rem;
  margin: 0;
  color: $phoebe-gold;
  font-weight: 800;
  text-align: center;
}

.prayer-desc {
  font-size: 1.2rem;
  color: rgba($phoebe-white, 0.8);
  text-align: center;
  margin: 10px 0 40px;
}

/* 神圣按钮 */
.sacred-button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin: 40px 0;
}

.sacred-pray-button {
  position: relative;
  padding: 24px 60px;
  background: linear-gradient(
    135deg,
    $phoebe-gold 0%,
    $phoebe-blue-bright 100%
  );
  border: none;
  border-radius: 50px;
  color: $phoebe-blue-deep;
  font-size: 1.5rem;
  font-weight: 800;
  cursor: pointer;
  transition: $transition;
  overflow: hidden;
  min-width: 240px;
  box-shadow: $shadow-lg, $shadow-gold;

  .button-text {
    position: relative;
    z-index: 2;
  }

  .button-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba($phoebe-white, 0.3) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: $transition;
  }

  .button-sparkles {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .sparkle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: $phoebe-white;
      border-radius: 50%;
      opacity: 0;
      animation: sparkle-twinkle 2s infinite;

      @for $i from 1 through 8 {
        &:nth-child(#{$i}) {
          left: math.random(100) * 1%;
          top: math.random(100) * 1%;
          animation-delay: $i * 0.25s;
        }
      }
    }
  }

  &:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.05);
    box-shadow: $shadow-xl, 0 0 40px rgba($phoebe-gold, 0.4);

    .button-glow {
      opacity: 1;
    }

    .sparkle {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-2px);
  }

  &.button-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: $shadow-md;
  }
}

.prayer-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba($phoebe-white, 0.7);
  font-size: 0.95rem;

  .hint-icon {
    font-size: 1.2rem;
  }
}

.prayer-stats {
  display: flex;
  gap: 40px;
  margin-top: 40px;

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    .stat-icon {
      font-size: 2rem;
      opacity: 0.8;
    }

    .stat-label {
      font-size: 0.9rem;
      color: rgba($phoebe-white, 0.6);
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: $phoebe-gold;
    }
  }
}

/* 背面卡片内容 */
.fortune-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;

  .fortune-rarity {
    position: relative;
    padding: 12px 24px;
    border-radius: 30px;
    font-weight: 800;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;

    &.SSR {
      background: linear-gradient(
        135deg,
        rgba(255, 209, 102, 0.3),
        rgba(255, 179, 71, 0.2)
      );
      color: $phoebe-gold;
      border: 2px solid rgba(255, 209, 102, 0.4);
    }

    &.SR {
      background: linear-gradient(
        135deg,
        rgba(106, 167, 255, 0.3),
        rgba(59, 123, 224, 0.2)
      );
      color: $phoebe-blue-bright;
      border: 2px solid rgba(106, 167, 255, 0.4);
    }

    &.R {
      background: linear-gradient(
        135deg,
        rgba($phoebe-white, 0.2),
        rgba($phoebe-white, 0.1)
      );
      color: $phoebe-white;
      border: 2px solid rgba($phoebe-white, 0.3);
    }

    .rarity-glow {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba($phoebe-white, 0.1) 50%,
        transparent 70%
      );
      animation: glow-move 3s linear infinite;
    }
  }

  .fortune-name {
    font-size: 2.2rem;
    margin: 0;
    color: $phoebe-white;
    font-weight: 800;
    flex: 1;
  }
}

.fortune-body {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.fortune-text-container {
  display: flex;
  gap: 20px;
  background: rgba($phoebe-blue-dark, 0.5);
  padding: 30px;
  border-radius: 20px;
  border-left: 4px solid $phoebe-gold;

  .text-icon {
    font-size: 2rem;
    color: $phoebe-gold;
  }

  .fortune-text {
    flex: 1;
    position: relative;

    .typed-text {
      font-size: 1.3rem;
      line-height: 1.8;
      color: rgba($phoebe-white, 0.9);
      margin: 0;
      min-height: 80px;
    }

    .typing-cursor {
      display: inline-block;
      width: 3px;
      height: 1.3rem;
      background: $phoebe-gold;
      margin-left: 2px;
      animation: blink 1s infinite;
      vertical-align: middle;
    }
  }
}

.fortune-details {
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .detail-card {
    background: rgba($phoebe-blue-dark, 0.5);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba($phoebe-gold, 0.1);
    display: flex;
    align-items: center;
    gap: 15px;
    transition: $transition;

    &:hover {
      transform: translateY(-4px);
      border-color: rgba($phoebe-gold, 0.3);
      box-shadow: $shadow-md;
    }

    .detail-icon {
      font-size: 2rem;
      color: $phoebe-gold;
    }

    .detail-content {
      flex: 1;

      .detail-label {
        font-size: 0.9rem;
        color: rgba($phoebe-white, 0.6);
        margin-bottom: 5px;
      }

      .detail-value {
        font-size: 1.2rem;
        font-weight: 600;
        color: $phoebe-white;

        &.number {
          color: $phoebe-gold;
          font-size: 1.5rem;
        }
      }
    }

    .color-sample {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 2px solid rgba($phoebe-white, 0.2);
      box-shadow: $shadow-sm;
    }
  }
}

.fortune-poem {
  background: rgba($phoebe-gold, 0.1);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba($phoebe-gold, 0.2);
  display: flex;
  gap: 20px;

  .poem-icon {
    font-size: 2rem;
    color: $phoebe-gold;
  }

  .poem-content {
    flex: 1;

    .poem-text {
      font-size: 1.2rem;
      font-style: italic;
      color: rgba($phoebe-white, 0.9);
      line-height: 1.6;
      margin: 0 0 10px 0;
    }

    .poem-title {
      font-size: 1rem;
      color: rgba($phoebe-white, 0.6);
      text-align: right;
      margin: 0;
    }
  }
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba($phoebe-blue-bright, 0.1);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba($phoebe-blue-bright, 0.2);

  .audio-icon {
    font-size: 2rem;
    color: $phoebe-blue-bright;
  }

  .audio-content {
    flex: 1;

    .audio-title {
      font-size: 1rem;
      color: rgba($phoebe-white, 0.8);
      margin-bottom: 5px;
    }

    .audio-id {
      font-size: 1.1rem;
      font-weight: 600;
      color: $phoebe-blue-bright;
    }

    .audio-error {
      font-size: 0.9rem;
      color: #ff6b6b;
      margin-top: 5px;
    }
  }
}

.fortune-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba($phoebe-gold, 0.1);

  .pray-again-button {
    padding: 12px 30px;
    background: rgba($phoebe-blue-bright, 0.2);
    border: 1px solid rgba($phoebe-blue-bright, 0.3);
    border-radius: 30px;
    color: $phoebe-blue-bright;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: $transition;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover:not(:disabled) {
      background: rgba($phoebe-blue-bright, 0.3);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .fortune-time {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba($phoebe-white, 0.7);

    .time-icon {
      font-size: 1.2rem;
    }
  }
}

/* 祭坛装饰 */
.altar-ornaments {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;

  .ornament {
    font-size: 3rem;
    color: rgba($phoebe-gold, 0.2);
  }
}

/* 页脚 */
.sacred-footer {
  background: rgba($phoebe-blue-dark, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba($phoebe-gold, 0.1);
  box-shadow: $shadow-md;
  text-align: center;

  .footer-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .footer-text {
    font-size: 1.2rem;
    color: $phoebe-gold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin: 0;

    .footer-icon {
      font-size: 1.5rem;
      animation: twinkle 2s ease-in-out infinite;
    }
  }

  .footer-hint {
    font-size: 0.95rem;
    color: rgba($phoebe-white, 0.6);
  }
}

/* 加载状态 */
.sacred-loading {
  position: fixed;
  inset: 0;
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .spinner-ring {
      width: 60px;
      height: 60px;
      border: 4px solid rgba($phoebe-gold, 0.2);
      border-top-color: $phoebe-gold;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-text {
      color: $phoebe-gold;
      font-size: 1.2rem;
      font-weight: 600;
    }
  }
}

/* 动画定义 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(2deg);
  }
  50% {
    transform: translateY(10px) rotate(-1deg);
  }
  75% {
    transform: translateY(-10px) rotate(1deg);
  }
}

@keyframes gentle-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes candle-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(1deg);
  }
  50% {
    transform: translateY(5px) rotate(-0.5deg);
  }
  75% {
    transform: translateY(-5px) rotate(0.5deg);
  }
}

@keyframes candle-flame {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateX(-50%) scale(1.2);
    opacity: 1;
  }
}

@keyframes dust-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes sparkle-twinkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes card-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes glow-move {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sacred-prayer-page {
    padding: 10px;
  }

  .sacred-header {
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;

    .sacred-title {
      font-size: 2.2rem;
      flex-direction: column;
      gap: 10px;

      .title-icon {
        font-size: 2rem;
      }
    }

    .sacred-subtitle {
      font-size: 1rem;
      margin: 15px 0 20px;
    }

    .title-decoration {
      gap: 15px;

      .decoration-line {
        width: 50px;
      }

      .decoration-star {
        font-size: 1.5rem;
      }
    }
  }

  .sacred-clock {
    padding: 15px;

    .clock-inner {
      .clock-hour,
      .clock-minute {
        font-size: 2.5rem;
      }

      .clock-colon {
        font-size: 2rem;
      }
    }
  }
  .prayer-card-container {
    
    min-height: 1100px;
  }
  .prayer-card {
    padding: 25px;
    min-height: 1100px;
  }

  .sacred-icon {
    font-size: 3rem;
  }

  .prayer-title {
    font-size: 2rem;
  }

  .sacred-pray-button {
    padding: 20px 40px;
    font-size: 1.3rem;
    min-width: 200px;
  }

  .fortune-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;

    .fortune-name {
      font-size: 1.8rem;
    }
  }

  .fortune-text-container {
    padding: 20px;

    .typed-text {
      font-size: 1.1rem;
    }
  }

  .fortune-footer {
    flex-direction: column;
    gap: 20px;
  }

  .altar-ornaments {
    display: none;
  }
}

@media (max-width: 480px) {
  .sacred-title {
    font-size: 1.8rem;
  }

  .prayer-stats {
    flex-direction: column;
    gap: 20px;
  }

  .fortune-details .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>