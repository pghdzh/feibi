<template>
  <div class="chat-page">
    <div class="carousel carousel1" aria-hidden="true">
      <img
        v-for="(src, idx) in randomFive"
        :key="idx"
        :src="src"
        class="carousel-image"
        :class="{ active: idx === currentIndex }"
      />
    </div>
    <div class="carousel carousel2" aria-hidden="true">
      <img
        v-for="(src, idx) in randomFive2"
        :key="idx"
        :src="src"
        class="carousel-image"
        :class="{ active: idx === currentIndex }"
      />
    </div>

    <div class="chat-container">
      <!-- 统计面板（放在聊天容器顶部） -->
      <div class="stats-panel">
        <div class="stat-item">
          总对话次数：<span>{{ stats.totalChats }}</span>
        </div>
        <div class="stat-item">
          首次使用：<span>{{
            new Date(stats.firstTimestamp).toISOString().slice(0, 10)
          }}</span>
        </div>
        <div class="stat-item">
          活跃天数：<span>{{ stats.activeDates.length }}</span> 天
        </div>
        <div class="stat-item">
          今日对话：<span>{{
            stats.dailyChats[new Date().toISOString().slice(0, 10)] || 0
          }}</span>
          次
        </div>
        <button class="detail-btn" @click="showModal = true">全部</button>
      </div>
      <div class="messages" ref="msgList">
        <transition-group name="msg" tag="div">
          <div
            v-for="msg in chatLog"
            :key="msg.id"
            :class="['message', msg.role, { error: msg.isError }]"
          >
            <div class="avatar" :class="msg.role"></div>
            <div class="bubble">
              <div class="content" v-html="msg.text"></div>
            </div>
          </div>
          <div v-if="loading" class="message bot" key="loading">
            <div class="avatar bot"></div>
            <div class="bubble loading">
              正在思考中
              <span class="dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
              </span>
            </div>
          </div>
        </transition-group>
      </div>
      <form class="input-area" @submit.prevent="sendMessage">
        <textarea
          v-model="input"
          placeholder="向菲比提问…"
          :disabled="loading"
          @keydown="handleKeydown"
          rows="1"
        ></textarea>

        <div class="btn-group">
          <button
            type="button"
            class="clear-btn"
            @click="clearChat"
            :disabled="loading"
            title="清空对话"
          >
            ✖
          </button>
        </div>
        <button
          type="button"
          class="copy-btn"
          :disabled="!chatLog.length || loading"
          @click="() => copyChat()"
        >
          {{ copyButtonText }}
        </button>
        <!-- 发送按钮 -->
        <button
          type="submit"
          class="send-btn"
          :disabled="!input.trim() || loading"
        >
          发送
        </button>

        <!-- 统计数据按钮 -->
        <button
          type="button"
          class="Alldetail-btn"
          @click="showModal = true"
          title="查看统计"
        >
          统计数据
        </button>
      </form>
    </div>

    <!-- 详细统计弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h3>详细统计</h3>
        <ul class="detail-list">
          <li>总对话次数：{{ stats.totalChats }}</li>
          <li>
            首次使用：{{
              new Date(stats.firstTimestamp).toISOString().slice(0, 10)
            }}
          </li>
          <li>活跃天数：{{ stats.activeDates.length }} 天</li>
          <li>
            今日对话：{{
              stats.dailyChats[new Date().toISOString().slice(0, 10)] || 0
            }}
            次
          </li>
          <li>总使用时长：{{ formatDuration(stats.totalTime) }}</li>
          <li>当前连续活跃：{{ stats.currentStreak }} 天</li>
          <li>最长连续活跃：{{ stats.longestStreak }} 天</li>
          <li>
            最活跃日：{{ mostActiveDayComputed }} （{{
              stats.dailyChats[mostActiveDayComputed] || 0
            }}
            次）
          </li>
        </ul>
        <button class="close-btn" @click="showModal = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";
import { sendMessageToHui } from "@/api/deepseekApi";

const STORAGE_KEY = "hui_chat_log";

// 本地存储键名
const STORAGE_STATS_KEY = "hui_chat_stats";
const showModal = ref(false);
// Stats 类型声明，确保所有字段都有默认值
interface Stats {
  firstTimestamp: number; // 首次使用时间戳
  totalChats: number; // 总对话次数
  activeDates: string[]; // 有发言的日期列表（yyyy‑mm‑dd）
  dailyChats: Record<string, number>; // 每日对话次数
  currentStreak: number; // 当前连续活跃天数
  longestStreak: number; // 历史最长连续活跃天数

  totalTime: number; // 累计使用时长（毫秒）
}

// 默认值，用于补齐本地存储中可能缺失的字段
const defaultStats: Stats = {
  firstTimestamp: Date.now(),
  totalChats: 0,
  activeDates: [],
  dailyChats: {},
  currentStreak: 0,
  longestStreak: 0,

  totalTime: 0,
};

// 从 localStorage 加载并合并默认值
function loadStats(): Stats {
  const saved = localStorage.getItem(STORAGE_STATS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...defaultStats, ...parsed };
    } catch {
      console.warn("加载统计数据失败，使用默认值");
    }
  }
  return { ...defaultStats };
}

// 保存到 localStorage
function saveStats() {
  localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
}

// 更新「活跃天数」及「连续活跃」逻辑
function updateActive(date: string) {
  if (!stats.activeDates.includes(date)) {
    stats.activeDates.push(date);
    updateStreak();
    saveStats(); // 持久化活跃天数变化
  }
}
function updateStreak() {
  const dates = [...stats.activeDates].sort();
  let curr = 0,
    max = stats.longestStreak,
    prevTs = 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  dates.forEach((d) => {
    const ts = new Date(d).getTime();
    if (prevTs && ts - prevTs === 86400000) curr++;
    else curr = 1;
    max = Math.max(max, curr);
    prevTs = ts;
  });
  stats.currentStreak = dates[dates.length - 1] === todayStr ? curr : 0;
  stats.longestStreak = max;
  saveStats();
}

// 更新「每日对话次数」
function updateDaily(date: string) {
  stats.dailyChats[date] = (stats.dailyChats[date] || 0) + 1;
  saveStats(); // 持久化活跃天数变化
}

// 计算最活跃日
const mostActiveDayComputed = computed(() => {
  let day = "",
    max = 0;
  for (const [d, c] of Object.entries(stats.dailyChats)) {
    if (c > max) {
      max = c;
      day = d;
    }
  }
  return day || new Date().toISOString().slice(0, 10);
});

// 格式化总使用时长
function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h} 小时 ${m} 分钟` : `${m} 分钟`;
}

// —— Vue 响应式状态 ——
const stats = reactive<Stats>(loadStats());
// 会话开始时间，用于计算本次时长
const sessionStart = Date.now();

interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
  isError?: boolean;
}

const chatLog = ref<ChatMsg[]>(loadChatLog());
const input = ref("");
const loading = ref(false);
const msgList = ref<HTMLElement>();

async function sendMessage() {
  if (!input.value.trim()) return;
  if (stats.totalChats === 0 && !localStorage.getItem(STORAGE_STATS_KEY)) {
    stats.firstTimestamp = Date.now();
    saveStats();
  }
  const date = new Date().toISOString().slice(0, 10); // 每次都取最新“今天”
  stats.totalChats++;
  updateActive(date);
  updateDaily(date);
  saveStats();

  const userText = input.value;
  chatLog.value.push({
    id: Date.now(),
    role: "user",
    text: userText,
  });
  input.value = "";
  loading.value = true;

  try {
    //  throw new Error("测试错误");
    const history = chatLog.value.filter((msg) => !msg.isError);
    const botReply = await sendMessageToHui(userText, history);
    chatLog.value.push({
      id: Date.now() + 1,
      role: "bot",
      text: botReply,
    });
  } catch (e) {
    console.error(e);
    chatLog.value.push({
      id: Date.now() + 2,
      role: "bot",
      text: "API余额耗尽了，去b站提醒我充钱吧",
      isError: true,
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") sendMessage();
}

function clearChat() {
  if (confirm("确定要清空全部对话吗？")) {
    chatLog.value = [
      {
        id: Date.now(),
        role: "bot",
        text: "岁主的恩泽就像海上的灯塔之光，即使风浪再大，也会指引迷途者归港。",
      },
    ];
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadChatLog(): ChatMsg[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("chatLog 解析失败：", e);
    }
  }
  return [
    {
      id: Date.now(),
      role: "bot",
      text: "岁主的恩泽就像海上的灯塔之光，即使风浪再大，也会指引迷途者归港。",
    },
  ];
}

async function scrollToBottom() {
  await nextTick();
  if (msgList.value) {
    msgList.value.scrollTop = msgList.value.scrollHeight;
  }
}

//复制文本相关
// 复制按钮文字与定时器（加入到 script setup）
const copyButtonText = ref("复制");
let _copyTimer: number | null = null;

// 把 HTML 文本转为纯文本（保留 <br> 换行）
function stripHtml(html = ""): string {
  if (typeof document === "undefined") {
    // SSR 安全返回
    return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
  }
  const div = document.createElement("div");
  const withBreaks = String(html).replace(/<br\s*\/?>/gi, "\n");
  div.innerHTML = withBreaks;
  return div.textContent || div.innerText || "";
}

// 根据 chatLog.build 出可读的纯文本（含时间戳）
function buildChatPlainText(): string {
  // chatLog 是你已有的 ref<ChatMsg[]>
  return chatLog.value
    .map((msg) => {
      // 尝试把 msg.id 当作时间戳（你的代码里确实用 Date.now() 作为 id）
      const time = new Date(msg.id).toLocaleString();
      const who = msg.role === "user" ? "你" : "菲比";
      const text = stripHtml(msg.text);
      return `[${time}] ${who}: ${text}`;
    })
    .join("\n\n");
}

// 回退复制：execCommand
function fallbackCopyText(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // 防止滚动到页面底部
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("execCommand copy failed");
}

// 主复制函数（在模板里绑定 @click="copyChat"）
async function copyChat() {
  const text = buildChatPlainText();
  if (!text) {
    copyButtonText.value = "无内容可复制";
    clearTimeout(_copyTimer as number);
    _copyTimer = window.setTimeout(() => (copyButtonText.value = "复制"), 1600);
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopyText(text);
    }
    copyButtonText.value = "已复制";
  } catch (err) {
    try {
      // 再试一次回退方案
      fallbackCopyText(text);
      copyButtonText.value = "已复制";
    } catch (e) {
      console.error("复制失败：", e);
      copyButtonText.value = "复制失败";
    }
  } finally {
    clearTimeout(_copyTimer as number);
    _copyTimer = window.setTimeout(() => (copyButtonText.value = "复制"), 1600);
  }
}

watch(
  chatLog,
  async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatLog.value));
    await scrollToBottom();
  },
  { deep: true }
);

function handleBeforeUnload() {
  stats.totalTime += Date.now() - sessionStart;
  saveStats();
}

// ========== 背景图片导入与轮播 ==========
const modules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", {
  eager: true,
});
const allSrcs: string[] = Object.values(modules).map((mod: any) => mod.default);

const modules2 = import.meta.glob("@/assets/images2/*.{jpg,png,jpeg,webp}", {
  eager: true,
});
const allSrcs2: string[] = Object.values(modules2).map(
  (mod: any) => mod.default
);

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const randomFive = ref<string[]>(shuffle(allSrcs).slice(0, 5));
const randomFive2 = ref<string[]>(shuffle(allSrcs2).slice(0, 5));

const currentIndex = ref(0);
let Imgtimer: number | undefined;

onMounted(() => {
  scrollToBottom();
  window.addEventListener("beforeunload", handleBeforeUnload);
  Imgtimer = window.setInterval(() => {
    currentIndex.value =
      (currentIndex.value + 1) % Math.max(1, randomFive.value.length);
  }, 5200);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  if (Imgtimer) clearInterval(Imgtimer);
  if (_copyTimer) clearTimeout(_copyTimer);
});
</script>

<style scoped lang="scss">
/* 菲比风格配色变量 */
$phoebe-gold: #f6de97;
$phoebe-gold-light: #fff9e6;
$phoebe-blue-dark: #0c1e3a;
$phoebe-blue-deep: #07122b;
$phoebe-blue-light: #3b7be0;
$phoebe-blue-bright: #6aa7ff;
$phoebe-white: #fafcfd;
$phoebe-white-trans: rgba(250, 252, 253, 0.95);

/* 扩展配色 - 不使用darken/rgba，手动定义 */
$phoebe-gold-trans-10: rgba(246, 222, 151, 0.1);
$phoebe-gold-trans-20: rgba(246, 222, 151, 0.2);
$phoebe-gold-trans-30: rgba(246, 222, 151, 0.3);
$phoebe-blue-trans-10: rgba(59, 123, 224, 0.1);
$phoebe-blue-trans-20: rgba(59, 123, 224, 0.2);
$phoebe-blue-trans-30: rgba(59, 123, 224, 0.3);
$phoebe-dark-trans-50: rgba(7, 18, 43, 0.5);
$phoebe-dark-trans-70: rgba(7, 18, 43, 0.7);
$phoebe-dark-trans-80: rgba(7, 18, 43, 0.8);
$phoebe-white-trans-10: rgba(250, 252, 253, 0.1);
$phoebe-white-trans-30: rgba(250, 252, 253, 0.3);

/* 聊天页面容器 */
.chat-page {
  min-height: 100vh;
  background: linear-gradient(
      160deg,
      $phoebe-blue-deep 0%,
      $phoebe-blue-dark 100%
    ),
    radial-gradient(
      circle at 20% 20%,
      $phoebe-gold-trans-10 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 80%,
      $phoebe-blue-trans-10 0%,
      transparent 40%
    );
  color: $phoebe-white;
  font-family: "Noto Sans SC", "Segoe UI", system-ui, sans-serif;
  position: relative;
  overflow: hidden;
  padding: 1rem;
  padding-top: 80px;
}

/* 背景轮播 */
.carousel {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(12, 30, 58, 0.7) 0%,
      rgba(12, 30, 58, 0.3) 50%,
      rgba(12, 30, 58, 0.8) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  .carousel-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    filter: blur(2px) brightness(0.6);
    transform: scale(1.05);

    &.active {
      opacity: 1;
      filter: blur(0) brightness(0.7);
      transform: scale(1);
    }
  }
}

.carousel1 {
  display: block;
}

.carousel2 {
  display: none;
}

/* 聊天容器 */
.chat-container {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  background: $phoebe-dark-trans-50;
  backdrop-filter: blur(3px);
  border-radius: 24px;
  border: 1px solid $phoebe-gold-trans-30;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px $phoebe-gold-trans-10;
  overflow: hidden;
}

/* 统计面板 */
.stats-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.2rem;
  background: $phoebe-dark-trans-80;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $phoebe-gold-trans-20;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.stat-item {
  font-size: 0.85rem;
  color: $phoebe-white-trans-30;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  span {
    color: $phoebe-gold;
    font-weight: 600;
    font-size: 0.9rem;
  }
}

.detail-btn {
  background: $phoebe-gold-trans-10;
  color: $phoebe-gold;
  border: 1px solid $phoebe-gold-trans-30;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: $phoebe-gold-trans-20;
    transform: translateY(-1px);
  }
}

/* 消息区域 */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $phoebe-white-trans-10;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: $phoebe-gold-trans-30;
    border-radius: 3px;

    &:hover {
      background: rgba(246, 222, 151, 0.5);
    }
  }
}

/* 消息项 */
.message {
  display: flex;
  gap: 1rem;
  max-width: 98%;
  opacity: 0;
  animation: messageAppear 0.3s ease forwards;
  margin-top: 10px;
  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .bubble {
      background: linear-gradient(
        135deg,
        $phoebe-blue-trans-20,
        $phoebe-blue-trans-10
      );
      border-color: $phoebe-blue-trans-30;
      border-radius: 18px 4px 18px 18px;

      &::after {
        right: -8px;
        left: auto;
        border-left-color: $phoebe-blue-trans-20;
        border-right-color: transparent;
      }
    }

    .avatar {
      background: linear-gradient(
        135deg,
        $phoebe-blue-light,
        $phoebe-blue-bright
      );
    }
  }

  &.bot {
    .bubble {
      background: linear-gradient(
        135deg,
        $phoebe-gold-trans-20,
        $phoebe-gold-trans-10
      );
      border-color: $phoebe-gold-trans-30;
      border-radius: 4px 18px 18px 18px;

      &::after {
        left: -8px;
        border-right-color: $phoebe-gold-trans-20;
        border-left-color: transparent;
      }
    }
  }

  &.error {
    .bubble {
      background: linear-gradient(
        135deg,
        rgba(231, 76, 60, 0.15),
        rgba(192, 57, 43, 0.1)
      );
      border-color: rgba(231, 76, 60, 0.3);

      &::after {
        border-right-color: rgba(231, 76, 60, 0.2);
      }
    }
  }
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: $phoebe-blue-dark;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &.bot {
    background-image: url("@/assets/avatar/feibi.png");
    background-size: cover;
    background-position: center;
    transform: scaleX(-1);
  }
}

.bubble {
  position: relative;
  padding: 0.9rem 1.2rem;
  border: 1px solid;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  &::after {
    content: "";
    position: absolute;
    top: 15px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
  }

  .content {
    color: $phoebe-white;
    line-height: 1.6;
    font-size: 0.95rem;

    :deep(*) {
      margin: 0;
    }

    :deep(br) {
      margin-bottom: 0.5rem;
      display: block;
      content: "";
    }
  }

  &.loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $phoebe-gold;

    .dots {
      display: flex;
      gap: 2px;

      .dot {
        animation: dotPulse 1.4s infinite ease-in-out;

        &:nth-child(1) {
          animation-delay: 0s;
        }
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }
}

@keyframes dotPulse {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

/* 输入区域 */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.8rem;
  padding: 1.2rem;
  background: $phoebe-dark-trans-80;
  backdrop-filter: blur(10px);
  border-top: 1px solid $phoebe-gold-trans-20;

  textarea {
    flex: 1;
    min-height: 44px;
    max-height: 120px;
    padding: 0.8rem 1rem;
    background: $phoebe-white-trans-10;
    border: 1px solid $phoebe-gold-trans-30;
    border-radius: 12px;
    color: $phoebe-white;
    font-size: 0.95rem;
    line-height: 1.5;
    resize: none;
    outline: none;
    transition: all 0.3s ease;

    &::placeholder {
      color: $phoebe-white-trans-30;
    }

    &:focus {
      background: rgba(250, 252, 253, 0.12);
      border-color: $phoebe-gold;
      box-shadow: 0 0 0 2px $phoebe-gold-trans-10;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-group {
    display: flex;
    gap: 0.5rem;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      transform: translateY(-2px);
    }
  }
  .Alldetail-btn {
    display: none;
  }
  .clear-btn {
    width: 36px;
    height: 36px;
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
    border-radius: 50%;
    font-size: 1rem;

    &:hover:not(:disabled) {
      background: rgba(231, 76, 60, 0.2);
    }
  }

  .copy-btn {
    background: $phoebe-gold-trans-10;
    color: $phoebe-gold;
    border: 1px solid $phoebe-gold-trans-30;

    &:hover:not(:disabled) {
      background: $phoebe-gold-trans-20;
    }
  }

  .send-btn {
    background: linear-gradient(135deg, $phoebe-gold 0%, #e9c36a 100%);
    color: $phoebe-blue-dark;
    font-weight: 600;

    &:hover:not(:disabled) {
      box-shadow: 0 4px 16px $phoebe-gold-trans-30;
    }
  }
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 18, 43, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.modal-content {
  background: $phoebe-dark-trans-70;
  backdrop-filter: blur(30px);
  border: 1px solid $phoebe-gold-trans-30;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  color: $phoebe-white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px $phoebe-gold-trans-10;

  h3 {
    color: $phoebe-gold;
    margin: 0 0 1.5rem 0;
    font-size: 1.4rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &::before {
      content: "📊";
    }
  }
}

.detail-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;

  li {
    padding: 0.8rem 0;
    border-bottom: 1px solid $phoebe-white-trans-10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
    color: $phoebe-white-trans-30;

    &:last-child {
      border-bottom: none;
    }

    &:nth-child(odd) {
      background: rgba(250, 252, 253, 0.02);
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      border-radius: 4px;
    }
  }
}

.close-btn {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, $phoebe-gold 0%, #e9c36a 100%);
  color: $phoebe-blue-dark;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px $phoebe-gold-trans-30;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chat-page {
    padding: 0.5rem;
    padding-top: 70px;
  }

  .carousel1 {
    display: none;
  }

  .carousel2 {
    display: block;
  }

  .chat-container {
    height: calc(100vh - 100px);
    border-radius: 16px;
    padding-top: 20px;
  }

  .stats-panel {
    display: none;
  }
  .input-area {
    .Alldetail-btn {
      display: block;
      background: $phoebe-gold-trans-10;
      color: $phoebe-gold;
      border: 1px solid $phoebe-gold-trans-30;
      border-radius: 8px;
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }
  }

  .messages {
    padding: 1rem;
    gap: 1rem;
  }

  .message {
    max-width: 90%;
    gap: 0.8rem;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .bubble {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }

  .input-area {
    padding: 0.8rem;
    flex-wrap: wrap;

    textarea {
      order: 1;
      flex: 1 1 100%;
      margin-bottom: 0.5rem;
    }

    .btn-group {
      order: 2;
    }

    .copy-btn {
      order: 3;
      flex: 1;
    }

    .send-btn {
      order: 4;
      flex: 1;
    }

    .Alldetail-btn {
      order: 5;
      flex: 1;
      text-align: center;
    }
  }

  .modal-content {
    padding: 1.5rem;
    width: 95%;

    h3 {
      font-size: 1.2rem;
    }
  }
}

@media (max-width: 480px) {
  .chat-page {
    padding-top: 60px;
  }

  .chat-container {
    height: calc(100vh - 90px);
  }

  .message {
    max-width: 95%;
  }

  .input-area {
    gap: 0.5rem;

    button {
      padding: 0.5rem 0.8rem;
      font-size: 0.85rem;
    }
  }
}

/* 过渡动画 */
.msg-enter-active,
.msg-leave-active {
  transition: all 0.3s ease;
}

.msg-enter-from,
.msg-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 滚动条美化 */
* {
  scrollbar-width: thin;
  scrollbar-color: $phoebe-gold-trans-30 $phoebe-white-trans-10;
}
</style>