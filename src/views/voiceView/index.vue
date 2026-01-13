<template>
  <div class="sacred-voice-hall">
    <!-- 神圣背景 -->
    <div class="sacred-background">
      <div class="bg-glow-1"></div>
      <div class="bg-glow-2"></div>
      <div class="bg-glow-3"></div>
      <div class="music-notes">
        <div class="note" v-for="n in 12" :key="n" :style="getNoteStyle(n)">
          ♪
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="voice-container">
      <!-- 神圣标题区 -->
      <header class="sacred-header">
        <div class="header-decoration left">𝄞</div>
        <div class="header-content">
          <h1 class="sacred-title">
            <span class="title-text">菲比的语音馆</span>
            <span class="title-icon">🎵</span>
          </h1>
          <p class="sacred-subtitle">聆听菲比的温柔低语，感受圣光指引</p>
          <div class="title-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-star">♪</div>
            <div class="decoration-line"></div>
          </div>
        </div>
        <div class="header-decoration right">𝄞</div>
      </header>

      <!-- 解锁状态展示 -->
      <div class="unlock-status">
        <div class="status-card">
          <div class="status-icon">🔓</div>
          <div class="status-content">
            <div class="status-title">语音解锁进度</div>
            <div class="status-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: unlockPercentage + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                <span class="count">{{ unlockedCount }}</span>
                <span class="total">/ {{ totalAudios }} 已解锁</span>
              </div>
            </div>
            <div class="status-hint">前往祈福殿解锁更多菲比的温柔语音</div>
          </div>
        </div>
      </div>

      <!-- 语音卡片网格 -->
      <main class="voice-gallery">
        <!-- 空状态 -->
        <div v-if="unlockedCount === 0" class="sacred-empty-state">
          <div class="empty-icon">🎵</div>
          <h3 class="empty-title">尚未解锁任何语音</h3>
          <p class="empty-description">
            前往祈福殿抽取运势，即可解锁菲比的专属语音
          </p>
          <div class="empty-actions">
            <button class="sacred-button empty-button" @click="goToPrayer">
              前往祈福殿
            </button>
          </div>
        </div>

        <!-- 语音卡片 -->
        <div v-else class="voice-cards">
          <div
            v-for="id in audioIds"
            :key="id"
            class="voice-card"
            :class="{
              unlocked: isUnlocked(id),
              playing: playingId === id,
              locked: !isUnlocked(id),
            }"
          >
            <!-- 卡片装饰 -->
            <div class="card-glow"></div>
            <div class="card-ribbon" v-if="isUnlocked(id) && playingId === id">
              <span class="ribbon-text">播放中</span>
            </div>

            <!-- 卡片内容 -->
            <div class="card-content">
              <!-- 卡片头部 -->
              <div class="card-header">
                <div class="audio-number">
                  <span class="number-icon">#</span>
                  <span class="number-value">{{
                    id.toString().padStart(2, "0")
                  }}</span>
                </div>
                <div class="audio-status" :class="{ unlocked: isUnlocked(id) }">
                  <span class="status-icon" v-if="isUnlocked(id)">🔓</span>
                  <span class="status-icon" v-else>🔒</span>
                  <span class="status-text">{{
                    isUnlocked(id) ? "已解锁" : "未解锁"
                  }}</span>
                </div>
              </div>

              <!-- 音频信息 -->
              <div class="audio-info">
                <div class="audio-icon">🎙️</div>
                <div class="audio-details">
                  <h3 class="audio-title">菲比的语音</h3>
                  <p class="audio-desc">第 {{ id }} 段温柔低语</p>
                </div>
              </div>

              <!-- 播放控制 -->
              <div class="play-controls">
                <button
                  v-if="isUnlocked(id)"
                  class="play-button"
                  :class="{ playing: playingId === id }"
                  @click="togglePlay(id)"
                  :disabled="isLoadingAudio === id"
                >
                  <div class="button-inner">
                    <span
                      v-if="isLoadingAudio === id"
                      class="loading-spinner"
                    ></span>
                    <span v-else-if="playingId === id" class="play-icon pause"
                      >⏸</span
                    >
                    <span v-else class="play-icon play">▶</span>
                    <span class="button-text">
                      {{ playingId === id ? "暂停播放" : "播放语音" }}
                    </span>
                  </div>
                  <div class="button-wave" v-if="playingId === id">
                    <span
                      class="wave-bar"
                      v-for="n in 4"
                      :key="n"
                      :style="getWaveStyle(n)"
                    ></span>
                  </div>
                </button>

                <div v-else class="locked-state">
                  <div class="locked-icon">🔒</div>
                  <div class="locked-text">未解锁</div>
                  <div class="locked-hint">祈福后解锁</div>
                </div>
              </div>

              <!-- 错误提示 -->
              <div class="error-message" v-if="errors[id]">
                <span class="error-icon">⚠️</span>
                <span class="error-text">播放失败，请稍后重试</span>
              </div>

              <!-- 播放进度（仅播放时显示） -->
              <div
                class="play-progress"
                v-if="playingId === id && currentAudio"
              >
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: playProgress + '%' }"
                  ></div>
                </div>
                <div class="time-display">
                  <span class="current-time">{{
                    formatTime(currentTime)
                  }}</span>
                  <span class="duration">{{ formatTime(duration) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 播放器控制栏 -->
      <footer class="player-footer" v-if="playingId">
        <div class="player-container">
          <div class="player-info">
            <div class="player-icon">🎵</div>
            <div class="player-details">
              <div class="player-title">正在播放：菲比语音 {{ playingId }}</div>
              <div class="player-status">
                {{
                  unlockPercentage >= 50
                    ? "继续聆听菲比的温柔"
                    : "发现更多菲比的语音"
                }}
              </div>
            </div>
          </div>

          <div class="player-controls">
            <button
              class="player-button prev"
              @click="playPrev"
              :disabled="!hasPrev"
            >
              ⏮
            </button>
            <button
              class="player-button play-pause"
              @click="togglePlay(playingId)"
            >
              {{ playingId && !currentAudio?.paused ? "⏸" : "▶" }}
            </button>
            <button
              class="player-button next"
              @click="playNext"
              :disabled="!hasNext"
            >
              ⏭
            </button>
            <button class="player-button stop" @click="stopCurrent">⏹</button>
          </div>

          <div class="player-volume">
            <button class="volume-button" @click="toggleMute">
              {{ isMuted ? "🔇" : "🔊" }}
            </button>
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="100"
              v-model="volume"
              @input="updateVolume"
            />
          </div>
        </div>
      </footer>
    </div>

    <!-- 音频加载指示器 -->
    <transition name="fade">
      <div class="audio-loading" v-if="isLoadingAudio">
        <div class="loading-content">
          <div class="loading-spinner large"></div>
          <div class="loading-text">加载语音中...</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";

// 配置
const audioBase = "/audio";
const totalAudios = 23;
const STORAGE_KEY_PLAYED = "feibi-played-audios-v2";
const audioIds = Array.from({ length: totalAudios }, (_, i) => i + 1);

// 状态
const unlockedSet = ref<Set<number>>(new Set());
const playingId = ref<number | null>(null);
const currentAudio = ref<HTMLAudioElement | null>(null);
const errors = ref<Record<number, boolean>>({});
const isLoadingAudio = ref<number | null>(null);
const isMuted = ref(false);
const volume = ref(70);
const currentTime = ref(0);
const duration = ref(0);
const playProgress = ref(0);

// 计算属性
const unlockedCount = computed(() => unlockedSet.value.size);
const unlockPercentage = computed(() =>
  Math.round((unlockedCount.value / totalAudios) * 100)
);
const hasPrev = computed(() => {
  if (!playingId.value) return false;
  const prevId = playingId.value - 1;
  return prevId >= 1 && unlockedSet.value.has(prevId);
});
const hasNext = computed(() => {
  if (!playingId.value) return false;
  const nextId = playingId.value + 1;
  return nextId <= totalAudios && unlockedSet.value.has(nextId);
});

// 加载已解锁的音频ID
function loadUnlocked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYED);
    if (!raw) {
      unlockedSet.value = new Set();
      return;
    }
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      const ids = arr
        .map((v: any) => Number(v))
        .filter(
          (n: number) => Number.isInteger(n) && n >= 1 && n <= totalAudios
        );
      unlockedSet.value = new Set(ids);
    } else {
      unlockedSet.value = new Set();
    }
  } catch (e) {
    console.warn("loadUnlocked err", e);
    unlockedSet.value = new Set();
  }
}

function isUnlocked(id: number) {
  return unlockedSet.value.has(id);
}

// 音频文件名
function fileNameFor(id: number) {
  return `${audioBase}/${encodeURIComponent(`audio (${id}).mp3`)}`;
}

// 播放控制
async function togglePlay(id: number) {
  if (!isUnlocked(id)) return;

  // 如果正在播放同一个音频
  if (playingId.value === id) {
    if (currentAudio.value && !currentAudio.value.paused) {
      currentAudio.value.pause();
      playingId.value = null;
    } else if (currentAudio.value) {
      try {
        await currentAudio.value.play();
        playingId.value = id;
      } catch (e) {
        console.warn("播放失败", e);
        errors.value[id] = true;
      }
    }
    return;
  }

  // 停止当前播放
  stopCurrent();

  // 显示加载状态
  isLoadingAudio.value = id;

  // 创建新的音频对象
  const src = fileNameFor(id);
  const audio = new Audio(src);
  audio.volume = volume.value / 100;
  audio.muted = isMuted.value;
  audio.preload = "auto";

  // 设置事件监听器
  audio.onloadeddata = () => {
    duration.value = audio.duration;
    isLoadingAudio.value = null;
  };

  audio.ontimeupdate = () => {
    currentTime.value = audio.currentTime;
    if (duration.value > 0) {
      playProgress.value = (audio.currentTime / duration.value) * 100;
    }
  };

  audio.onended = () => {
    playingId.value = null;
    currentTime.value = 0;
    playProgress.value = 0;
  };

  audio.onerror = () => {
    errors.value[id] = true;
    playingId.value = null;
    isLoadingAudio.value = null;
  };

  currentAudio.value = audio;
  errors.value[id] = false;

  try {
    await audio.play();
    playingId.value = id;
  } catch (e) {
    console.warn("音频播放错误", e);
    errors.value[id] = true;
    playingId.value = null;
  } finally {
    isLoadingAudio.value = null;
  }
}

// 停止当前播放
function stopCurrent() {
  try {
    if (currentAudio.value) {
      currentAudio.value.pause();
      currentAudio.value.currentTime = 0;
      currentAudio.value = null;
    }
  } catch (e) {
    console.warn("停止错误", e);
  } finally {
    playingId.value = null;
    currentTime.value = 0;
    playProgress.value = 0;
  }
}

// 播放上一首
function playPrev() {
  if (!playingId.value || !hasPrev.value) return;
  const prevId = playingId.value - 1;
  togglePlay(prevId);
}

// 播放下一首
function playNext() {
  if (!playingId.value || !hasNext.value) return;
  const nextId = playingId.value + 1;
  togglePlay(nextId);
}

// 静音切换
function toggleMute() {
  if (currentAudio.value) {
    currentAudio.value.muted = !currentAudio.value.muted;
    isMuted.value = currentAudio.value.muted;
  } else {
    isMuted.value = !isMuted.value;
  }
}

// 更新音量
function updateVolume() {
  if (currentAudio.value) {
    currentAudio.value.volume = volume.value / 100;
  }
}

// 格式化时间
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// 前往祈福殿
function goToPrayer() {
  // 这里可以添加路由跳转逻辑
  console.log("前往祈福殿");
}

// 生成音符样式
function getNoteStyle(index: number) {
  const angle = (index / 12) * Math.PI * 2;
  const radius = 200;
  const size = Math.random() * 24 + 16;
  const duration = Math.random() * 4 + 3;
  const delay = Math.random() * 5;

  return {
    left: `calc(50% + ${Math.cos(angle) * radius}px)`,
    top: `calc(50% + ${Math.sin(angle) * radius}px)`,
    fontSize: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
}

// 生成波形样式
function getWaveStyle(index: number) {
  const height = Math.random() * 12 + 8;
  const delay = index * 0.1;

  return {
    height: `${height}px`,
    animationDelay: `${delay}s`,
  };
}

// 监听storage变化
function onStorage(e: StorageEvent) {
  if (e.key === STORAGE_KEY_PLAYED) {
    loadUnlocked();
  }
}

// 生命周期
onMounted(() => {
  loadUnlocked();
  window.addEventListener("storage", onStorage);
});

onBeforeUnmount(() => {
  stopCurrent();
  window.removeEventListener("storage", onStorage);
});
</script>

<style scoped lang="scss">
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
.sacred-voice-hall {
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

  .music-notes {
    position: absolute;
    inset: 0;

    .note {
      position: absolute;
      color: rgba($phoebe-gold, 0.6);
      animation: note-float linear infinite;
      opacity: 0;
      filter: drop-shadow(0 2px 4px rgba($phoebe-gold, 0.3));
    }
  }
}

/* 容器 */
.voice-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

/* 神圣标题区 */
.sacred-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;

  .header-decoration {
    font-size: 3rem;
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
      animation: gentle-float 3s ease-in-out infinite;
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

/* 解锁状态 */
.unlock-status {
  margin-bottom: 40px;

  .status-card {
    background: linear-gradient(
      135deg,
      rgba($phoebe-blue-dark, 0.8) 0%,
      rgba($phoebe-blue-deep, 0.9) 100%
    );
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 30px;
    border: 1px solid rgba($phoebe-gold, 0.2);
    box-shadow: $shadow-md, $shadow-gold;
    display: flex;
    align-items: center;
    gap: 30px;

    .status-icon {
      font-size: 3.5rem;
      color: $phoebe-gold;
      filter: drop-shadow(0 4px 8px rgba($phoebe-gold, 0.3));
    }

    .status-content {
      flex: 1;

      .status-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: $phoebe-white;
        margin-bottom: 15px;
      }

      .status-progress {
        margin-bottom: 15px;

        .progress-bar {
          height: 10px;
          background: rgba($phoebe-blue-dark, 0.5);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 10px;

          .progress-fill {
            height: 100%;
            background: linear-gradient(
              90deg,
              $phoebe-gold,
              $phoebe-blue-bright
            );
            border-radius: 5px;
            transition: width 0.5s ease;
          }
        }

        .progress-text {
          display: flex;
          align-items: baseline;
          gap: 8px;

          .count {
            font-size: 2rem;
            font-weight: 800;
            color: $phoebe-gold;
          }

          .total {
            font-size: 1.1rem;
            color: rgba($phoebe-white, 0.7);
          }
        }
      }

      .status-hint {
        font-size: 1rem;
        color: rgba($phoebe-white, 0.6);
        font-style: italic;
      }
    }
  }
}

/* 语音画廊 */
.voice-gallery {
  margin-bottom: 60px;
}

/* 空状态 */
.sacred-empty-state {
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.7) 0%,
    rgba($phoebe-blue-deep, 0.8) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 60px 40px;
  border: 1px solid rgba($phoebe-gold, 0.1);
  box-shadow: $shadow-md;
  text-align: center;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    display: inline-block;
    animation: bounce 2s ease-in-out infinite;
    color: $phoebe-gold;
  }

  .empty-title {
    font-size: 2rem;
    margin: 0 0 15px;
    color: $phoebe-gold;
  }

  .empty-description {
    font-size: 1.1rem;
    color: rgba($phoebe-white, 0.7);
    max-width: 400px;
    margin: 0 auto 30px;
    line-height: 1.6;
  }

  .empty-actions {
    .sacred-button.empty-button {
      background: linear-gradient(135deg, $phoebe-gold, $phoebe-blue-bright);
      color: $phoebe-blue-deep;
      padding: 15px 30px;
      border-radius: 50px;
      border: none;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: $transition;
      box-shadow: $shadow-md, $shadow-gold;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-lg, $shadow-gold;
      }
    }
  }
}

/* 语音卡片网格 */
.voice-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

/* 语音卡片 */
.voice-card {
  position: relative;
  background: linear-gradient(
    145deg,
    rgba($phoebe-blue-dark, 0.9) 0%,
    rgba($phoebe-blue-deep, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba($phoebe-gold, 0.2);
  box-shadow: $shadow-lg;
  padding: 30px;
  transition: $transition;
  overflow: hidden;

  &.unlocked {
    .card-glow {
      opacity: 0.3;
    }
  }

  &.playing {
    box-shadow: $shadow-xl, $shadow-gold;
    transform: translateY(-5px);

    .card-ribbon {
      opacity: 1;
      transform: translateX(-50%) rotate(-45deg) scale(1);
    }
  }

  &.locked {
    opacity: 0.7;
    filter: grayscale(0.3);
  }

  &:hover:not(.locked) {
    transform: translateY(-8px);
    box-shadow: $shadow-xl, $shadow-gold;
  }

  .card-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      rgba($phoebe-gold, 0.1) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: $transition;
  }

  .card-ribbon {
    position: absolute;
    top: 20px;
    left: -30px;
    background: linear-gradient(135deg, $phoebe-gold, $phoebe-blue-bright);
    color: $phoebe-blue-deep;
    padding: 8px 40px;
    font-size: 0.9rem;
    font-weight: 800;
    transform: translateX(-50%) rotate(-45deg) scale(0.8);
    opacity: 0;
    transition: $transition;
    z-index: 2;

    .ribbon-text {
      letter-spacing: 1px;
    }
  }

  .card-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .audio-number {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba($phoebe-blue-dark, 0.5);
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid rgba($phoebe-gold, 0.2);

    .number-icon {
      font-size: 1.2rem;
      color: $phoebe-gold;
      font-weight: 800;
    }

    .number-value {
      font-size: 1.4rem;
      font-weight: 800;
      color: $phoebe-white;
    }
  }

  .audio-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 700;

    &.unlocked {
      background: rgba($phoebe-gold, 0.2);
      color: $phoebe-gold;
      border: 1px solid rgba($phoebe-gold, 0.3);
    }

    &:not(.unlocked) {
      background: rgba($phoebe-white, 0.1);
      color: rgba($phoebe-white, 0.7);
      border: 1px solid rgba($phoebe-white, 0.2);
    }

    .status-icon {
      font-size: 1rem;
    }
  }
}

/* 音频信息 */
.audio-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba($phoebe-gold, 0.1);

  .audio-icon {
    font-size: 2.5rem;
    color: $phoebe-gold;
    filter: drop-shadow(0 2px 4px rgba($phoebe-gold, 0.3));
  }

  .audio-details {
    flex: 1;

    .audio-title {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0 0 8px 0;
      color: $phoebe-white;
    }

    .audio-desc {
      font-size: 1rem;
      color: rgba($phoebe-white, 0.7);
      margin: 0;
    }
  }
}

/* 播放控制 */
.play-controls {
  .play-button {
    position: relative;
    width: 100%;
    padding: 20px;
    background: linear-gradient(135deg, $phoebe-gold, $phoebe-blue-bright);
    border: none;
    border-radius: 16px;
    color: $phoebe-blue-deep;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    transition: $transition;
    overflow: hidden;
    box-shadow: $shadow-md;

    .button-inner {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba($phoebe-blue-deep, 0.3);
      border-top-color: $phoebe-blue-deep;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .play-icon {
      font-size: 1.5rem;
      font-weight: 900;

      &.pause {
        font-size: 1.3rem;
      }
    }

    .button-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
      padding: 0 20px;

      .wave-bar {
        width: 6px;
        background: rgba($phoebe-blue-deep, 0.3);
        border-radius: 3px;
        animation: wave 1.5s ease-in-out infinite;
      }
    }

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: $shadow-lg, $shadow-gold;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &.playing {
      background: linear-gradient(
        135deg,
        rgba($phoebe-gold, 10%),
        rgba($phoebe-blue-bright, 10%)
      );
    }
  }

  .locked-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 30px 20px;
    background: rgba($phoebe-blue-dark, 0.5);
    border-radius: 16px;
    border: 2px dashed rgba($phoebe-gold, 0.2);

    .locked-icon {
      font-size: 2.5rem;
      color: rgba($phoebe-white, 0.5);
    }

    .locked-text {
      font-size: 1.2rem;
      font-weight: 700;
      color: rgba($phoebe-white, 0.7);
    }

    .locked-hint {
      font-size: 0.9rem;
      color: rgba($phoebe-white, 0.5);
      font-style: italic;
    }
  }
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 71, 87, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(255, 71, 87, 0.2);

  .error-icon {
    font-size: 1.2rem;
    color: #ff4757;
  }

  .error-text {
    font-size: 0.9rem;
    color: rgba(255, 71, 87, 0.9);
    font-weight: 600;
  }
}

/* 播放进度 */
.play-progress {
  .progress-bar {
    height: 6px;
    background: rgba($phoebe-blue-dark, 0.5);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, $phoebe-gold, $phoebe-blue-bright);
      border-radius: 3px;
      transition: width 0.1s linear;
    }
  }

  .time-display {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: rgba($phoebe-white, 0.6);
  }
}

/* 播放器底部控制栏 */
.player-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.95) 0%,
    rgba($phoebe-blue-deep, 0.98) 100%
  );
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba($phoebe-gold, 0.2);
  box-shadow: 0 -4px 30px rgba($phoebe-blue-dark, 0.3);
  z-index: 100;

  .player-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 15px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 20px;
      padding: 15px 20px;
    }
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;

    .player-icon {
      font-size: 2rem;
      color: $phoebe-gold;
    }

    .player-details {
      .player-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: $phoebe-white;
        margin-bottom: 4px;
      }

      .player-status {
        font-size: 0.9rem;
        color: rgba($phoebe-white, 0.7);
      }
    }
  }

  .player-controls {
    display: flex;
    align-items: center;
    gap: 15px;

    .player-button {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      background: rgba($phoebe-blue-dark, 0.5);
      color: $phoebe-white;
      font-size: 1.5rem;
      cursor: pointer;
      transition: $transition;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        background: rgba($phoebe-gold, 0.2);
        transform: scale(1.1);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      &.play-pause {
        background: linear-gradient(135deg, $phoebe-gold, $phoebe-blue-bright);
        color: $phoebe-blue-deep;
        font-size: 1.8rem;
        width: 60px;
        height: 60px;
      }
    }
  }

  .player-volume {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
    justify-content: flex-end;

    @media (max-width: 768px) {
      width: 100%;
      justify-content: center;
    }

    .volume-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba($phoebe-blue-dark, 0.5);
      color: $phoebe-white;
      font-size: 1.3rem;
      cursor: pointer;
      transition: $transition;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba($phoebe-gold, 0.2);
      }
    }

    .volume-slider {
      width: 120px;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba($phoebe-blue-dark, 0.5);
      border-radius: 3px;
      outline: none;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: $phoebe-gold;
        cursor: pointer;
        border: 2px solid $phoebe-white;
        box-shadow: $shadow-sm;
      }

      &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: $phoebe-gold;
        cursor: pointer;
        border: 2px solid $phoebe-white;
        box-shadow: $shadow-sm;
      }
    }
  }
}

/* 音频加载指示器 */
.audio-loading {
  position: fixed;
  inset: 0;
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .loading-spinner.large {
      width: 60px;
      height: 60px;
      border: 4px solid rgba($phoebe-gold, 0.2);
      border-top-color: $phoebe-gold;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
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

@keyframes note-float {
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.5);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1.5);
    opacity: 1;
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
  .sacred-voice-hall {
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

  .unlock-status .status-card {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 25px;

    .status-icon {
      font-size: 3rem;
    }
  }

  .voice-cards {
    grid-template-columns: 1fr;
  }

  .voice-card {
    padding: 25px;
  }

  .player-footer .player-container {
    flex-direction: column;
    gap: 20px;

    .player-info,
    .player-volume {
      width: 100%;
      justify-content: center;
    }

    .player-volume .volume-slider {
      width: 150px;
    }
  }
}

@media (max-width: 480px) {
  .sacred-title {
    font-size: 1.8rem;
  }

  .unlock-status .status-card {
    padding: 20px;
  }

  .voice-card {
    padding: 20px;
  }
}
</style>