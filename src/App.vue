<template>
  <div id="app">
    <transition name="sacred-fade" v-if="showIntro">
      <div class="phoebe-intro-container" @click="skipIntro">
        <!-- 神圣光影背景层 -->
        <div class="sacred-bg-effects">
          <div class="halo-orbital"></div>
          <div class="light-streams"></div>
          <div class="particle-field"></div>
          <div class="diffraction-grid"></div>
        </div>

        <!-- 动态背景视频 -->
        <video
          class="sacred-video-bg"
          :src="videoSrc"
          autoplay
          muted
          loop
          playsinline
          @loadeddata="onVideoLoaded"
        ></video>

        <!-- 镜之环装饰元素 -->
        <div class="mirror-ring-decor">
          <div class="ring ring-outer"></div>
          <div class="ring ring-middle"></div>
          <div class="ring ring-inner"></div>
          <div class="ring-center"></div>
        </div>

        <!-- 主内容区 -->
        <div class="intro-sacred-content">
          <!-- 欢迎标题 -->
          <div class="title-sequence">
            <h1 class="welcome-glow" :class="{ 'animate-in': textAnimate }">
              <span class="text-line line-1">光</span>
              <span class="text-line line-2">之</span>
              <span class="text-line line-3">引</span>
              <span class="text-line line-4">领</span>
            </h1>

            <h2 class="subtitle-shimmer" :class="{ 'animate-in': textAnimate }">
              <span class="subtitle-text">菲比圣域 · 辉光启程</span>
            </h2>
          </div>

          <!-- 法杖徽记 -->
          <div class="sacred-staff" :class="{ 'animate-in': staffAnimate }">
            <svg
              class="staff-svg"
              viewBox="0 0 120 120"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="staffGold"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stop-color="#F6DE97" />
                  <stop offset="50%" stop-color="#B97FE0" />
                  <stop offset="100%" stop-color="#3B7BE0" />
                </linearGradient>
                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
                  <stop offset="100%" stop-color="#F6DE97" stop-opacity="0" />
                </radialGradient>
                <filter
                  id="glowFilter"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <!-- 法杖顶部宝石 -->
              <circle cx="60" cy="40" r="12" fill="url(#coreGlow)" />
              <circle
                cx="60"
                cy="40"
                r="8"
                fill="#FFFFFF"
                filter="url(#glowFilter)"
              />

              <!-- 法杖主体 -->
              <path
                d="M60,20 L66,40 L82,46 L66,52 L60,72 L54,52 L38,46 L54,40 Z"
                fill="url(#staffGold)"
                stroke="rgba(255,255,255,0.2)"
                stroke-width="0.8"
              />

              <!-- 法杖杆 -->
              <rect
                x="58"
                y="52"
                width="4"
                height="30"
                rx="2"
                fill="url(#staffGold)"
              />

              <!-- 法杖底部 -->
              <circle
                cx="60"
                cy="86"
                r="10"
                fill="url(#staffGold)"
                opacity="0.8"
              />
            </svg>
            <div class="staff-glow"></div>
          </div>

          <!-- 加载进度与提示 -->
          <div class="intro-footer">
            <div class="loading-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: progress + '%' }"
                ></div>
                <div class="progress-glow"></div>
              </div>
              <div class="progress-text">{{ Math.floor(progress) }}%</div>
            </div>

            <div class="hint-text" :class="{ visible: hintVisible }">
              <span class="hint-icon">✦</span>
              <span class="hint-message"
                >点击屏幕或等待 {{ countdown }} 秒进入圣域</span
              >
            </div>

            <!-- 跳过按钮 -->
            <button
              class="skip-button"
              @click.stop="skipIntro"
              aria-label="跳过开场动画"
            >
              跳过 <span class="skip-arrow">›</span>
            </button>
          </div>
        </div>

        <!-- 动态光粒子 -->
        <div class="floating-particles">
          <div
            class="particle"
            v-for="i in particleCount"
            :key="i"
            :style="getParticleStyle(i)"
          ></div>
        </div>
      </div>
    </transition>

    <!-- 主应用内容 -->
    <transition name="main-fade" v-if="!showIntro">
      <div class="app-main">
        <navbar />
        <main class="main-content">
          <RouterView />
        </main>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { RouterView } from "vue-router";
import navbar from "./components/navbar.vue";

// ==================== 响应式状态 ====================
const showIntro = ref(true);
const videoSrc = ref("");
const videoLoaded = ref(false);
const textAnimate = ref(false);
const staffAnimate = ref(false);
const hintVisible = ref(false);
const progress = ref(0);
const countdown = ref(5);
const particleCount = 15;

// ==================== 初始化方法 ====================
onMounted(() => {
  // 随机选择背景视频
  initializeVideo();

  // 启动加载进度动画
  startProgressAnimation();

  // 启动倒计时
  startCountdown();

  // 启动文本动画
  setTimeout(() => {
    textAnimate.value = true;
  }, 300);

  setTimeout(() => {
    staffAnimate.value = true;
  }, 800);

  setTimeout(() => {
    hintVisible.value = true;
  }, 2000);
});

// ==================== 核心功能方法 ====================
const initializeVideo = () => {
  const isMobile = window.innerWidth <= 768;
  const folder = isMobile ? "/mp2" : "/mp1";
  const index = Math.floor(Math.random() * 4) + 1;
  videoSrc.value = `${folder}/1 (${index}).mp4`;

  // 建议：为达到最佳效果，可以准备专门的菲比主题视频
  // 例如：包含海洋光影、镜面反射、金色光芒等元素的视频
};

const onVideoLoaded = () => {
  videoLoaded.value = true;
};

const startProgressAnimation = () => {
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 1;
    } else {
      clearInterval(interval);
    }
  }, 50); // 5秒完成加载
};

const startCountdown = () => {
  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1;
    } else {
      clearInterval(timer);
      if (showIntro.value) {
        skipIntro();
      }
    }
  }, 1000);
};

const skipIntro = () => {
  showIntro.value = false;
  // 确保释放资源
  const video = document.querySelector(".sacred-video-bg") as HTMLVideoElement;
  if (video) {
    video.pause();
    video.src = "";
  }
};

// ==================== 粒子系统 ====================
const getParticleStyle = (index: number) => {
  const delay = index * 0.2;
  const duration = 3 + Math.random() * 2;
  const size = 2 + Math.random() * 4;
  const colorIndex = Math.floor(Math.random() * 3);
  const colors = ["#F6DE97", "#B97FE0", "#6AA7FF"];

  return {
    "--particle-delay": `${delay}s`,
    "--particle-duration": `${duration}s`,
    "--particle-size": `${size}px`,
    "--particle-color": colors[colorIndex],
    "--particle-x": `${Math.random() * 100}%`,
    "--particle-y": `${Math.random() * 100}%`,
  } as any;
};

// ==================== 清理资源 ====================
onBeforeUnmount(() => {
  // 清理视频资源
  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    video.pause();
    video.src = "";
  });
});
</script>

<style lang="scss" scoped>
/* ==================== 菲比主题变量 ==================== */
$phoebe-gold: #f6de97;
$phoebe-gold-light: #fff9e6;
$phoebe-blue-dark: #0c1e3a;
$phoebe-blue-deep: #07122b;
$phoebe-blue-light: #3b7be0;
$phoebe-blue-bright: #6aa7ff;
$phoebe-lilac: #b97fe0;
$phoebe-lilac-light: #e6d4f5;
$phoebe-white: #fafcfd;

/* ==================== 开屏容器 ==================== */
.phoebe-intro-container {
  position: fixed;
  inset: 0;
  background: linear-gradient(
    135deg,
    $phoebe-blue-dark 0%,
    $phoebe-blue-deep 100%
  );
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
}

/* ==================== 神圣背景特效 ==================== */
.sacred-bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;

  .halo-orbital {
    position: absolute;
    top: -200px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(
      ellipse at center,
      rgba($phoebe-lilac, 0.1) 0%,
      rgba($phoebe-blue-light, 0.05) 30%,
      transparent 70%
    );
    filter: blur(60px);
    animation: haloFloat 20s ease-in-out infinite;
  }

  .light-streams {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba($phoebe-gold, 0.03) 20%,
      rgba($phoebe-lilac, 0.02) 40%,
      rgba($phoebe-blue-bright, 0.02) 60%,
      transparent 100%
    );
    opacity: 0.4;
    animation: streamFlow 15s linear infinite;
  }

  .particle-field {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        circle at 20% 30%,
        rgba($phoebe-gold, 0.03) 0%,
        transparent 2%
      ),
      radial-gradient(
        circle at 80% 60%,
        rgba($phoebe-lilac, 0.02) 0%,
        transparent 2%
      ),
      radial-gradient(
        circle at 40% 80%,
        rgba($phoebe-blue-bright, 0.01) 0%,
        transparent 2%
      );
    background-size: 400px 400px;
    animation: particleShift 80s linear infinite;
  }

  .diffraction-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
        rgba($phoebe-blue-bright, 0.02) 1px,
        transparent 1px
      ),
      linear-gradient(90deg, rgba($phoebe-gold, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    opacity: 0.3;
  }
}

@keyframes haloFloat {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }
  33% {
    transform: translateX(-52%) translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateX(-48%) translateY(20px) rotate(240deg);
  }
}

@keyframes streamFlow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes particleShift {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 400px 400px;
  }
}

/* ==================== 背景视频 ==================== */
.sacred-video-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: soft-light;
}

/* ==================== 镜之环装饰 ==================== */
.mirror-ring-decor {
  position: absolute;
  width: 500px;
  height: 500px;
  z-index: 3;
  pointer-events: none;

  .ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid;

    &.ring-outer {
      inset: 0;
      border-color: rgba($phoebe-gold, 0.3);
      animation: ringSpin 25s linear infinite;
    }

    &.ring-middle {
      inset: 80px;
      border-color: rgba($phoebe-lilac, 0.2);
      animation: ringSpin 20s linear reverse infinite;
    }

    &.ring-inner {
      inset: 160px;
      border-color: rgba($phoebe-blue-light, 0.15);
      animation: ringSpin 30s linear infinite;
    }
  }

  .ring-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: radial-gradient(circle, $phoebe-white, transparent 70%);
    filter: blur(2px);
    animation: centerPulse 3s ease-in-out infinite;
  }
}

@keyframes ringSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes centerPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

/* ==================== 主内容区 ==================== */
.intro-sacred-content {
  position: relative;
  z-index: 10;
  text-align: center;
  width: 100%;
  max-width: 1200px;
  padding: 40px;
}

/* ==================== 标题动画 ==================== */
.title-sequence {
  margin-bottom: 60px;

  .welcome-glow {
    font-size: 5rem;
    font-weight: 300;
    letter-spacing: 10px;
    margin-bottom: 20px;

    .text-line {
      display: inline-block;
      color: transparent;
      background: linear-gradient(
        90deg,
        $phoebe-gold,
        $phoebe-lilac,
        $phoebe-blue-bright
      );
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      opacity: 0;
      transform: translateY(30px);

      &.line-1 {
        animation: textReveal 0.8s ease forwards 0.3s;
      }
      &.line-2 {
        animation: textReveal 0.8s ease forwards 0.5s;
      }
      &.line-3 {
        animation: textReveal 0.8s ease forwards 0.7s;
      }
      &.line-4 {
        animation: textReveal 0.8s ease forwards 0.9s;
      }
    }

    &.animate-in .text-line {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .subtitle-shimmer {
    font-size: 1.8rem;
    font-weight: 400;
    letter-spacing: 4px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1);

    .subtitle-text {
      color: rgba($phoebe-white, 0.9);
      position: relative;

      &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 100%;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          $phoebe-gold,
          transparent
        );
        transform: scaleX(0);
        transition: transform 1s ease 0.5s;
      }
    }

    &.animate-in {
      opacity: 1;
      transform: translateY(0);

      .subtitle-text::after {
        transform: scaleX(1);
      }
    }
  }
}

@keyframes textReveal {
  0% {
    opacity: 0;
    transform: translateY(30px);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* ==================== 神圣法杖 ==================== */
.sacred-staff {
  margin: 40px auto;
  width: 120px;
  height: 120px;
  position: relative;
  opacity: 0;
  transform: scale(0.5) rotate(-30deg);
  transition: all 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);

  &.animate-in {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    animation: staffFloat 6s ease-in-out infinite;
  }

  .staff-svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 30px rgba($phoebe-gold, 0.5));
  }

  .staff-glow {
    position: absolute;
    inset: -20px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba($phoebe-gold, 0.3) 0%,
      transparent 70%
    );
    opacity: 0;
    animation: staffGlow 3s ease-in-out infinite;
  }
}

@keyframes staffFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(5deg);
  }
  66% {
    transform: translateY(5px) rotate(-3deg);
  }
}

@keyframes staffGlow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

/* ==================== 底部控件 ==================== */
.intro-footer {
  margin-top: 60px;

  .loading-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 30px;

    .progress-bar {
      width: 300px;
      height: 4px;
      background: rgba($phoebe-white, 0.1);
      border-radius: 2px;
      overflow: hidden;
      position: relative;

      .progress-fill {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background: linear-gradient(90deg, $phoebe-gold, $phoebe-lilac);
        border-radius: 2px;
        transition: width 0.05s linear;
      }

      .progress-glow {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba($phoebe-white, 0.3),
          transparent
        );
        animation: progressGlow 2s linear infinite;
      }
    }

    .progress-text {
      color: $phoebe-gold;
      font-size: 1.2rem;
      font-weight: 600;
      min-width: 40px;
    }
  }

  .hint-text {
    color: rgba($phoebe-white, 0.7);
    font-size: 1rem;
    letter-spacing: 1px;
    margin-bottom: 20px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.8s ease 1s;

    &.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .hint-icon {
      color: $phoebe-gold;
      margin-right: 8px;
    }
  }

  .skip-button {
    background: rgba($phoebe-white, 0.05);
    border: 1px solid rgba($phoebe-gold, 0.2);
    color: rgba($phoebe-white, 0.8);
    padding: 10px 24px;
    border-radius: 20px;
    font-size: 0.9rem;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba($phoebe-gold, 0.1);
      border-color: rgba($phoebe-gold, 0.4);
      color: $phoebe-white;
      transform: translateY(-2px);

      .skip-arrow {
        transform: translateX(3px);
      }
    }

    .skip-arrow {
      margin-left: 5px;
      transition: transform 0.3s ease;
    }
  }
}

@keyframes progressGlow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* ==================== 浮动粒子 ==================== */
.floating-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;

  .particle {
    position: absolute;
    width: var(--particle-size);
    height: var(--particle-size);
    background: var(--particle-color);
    border-radius: 50%;
    left: var(--particle-x);
    top: var(--particle-y);
    opacity: 0;
    filter: blur(1px);
    animation: particleFloat var(--particle-duration) ease-in-out
      var(--particle-delay) infinite;
  }
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  50% {
    transform: translate(20px, -50px) scale(1.2);
    opacity: 0.4;
  }
  90% {
    opacity: 0.2;
  }
}

/* ==================== 过渡动画 ==================== */
.sacred-fade-enter-active,
.sacred-fade-leave-active {
  transition: opacity 1.5s ease;
}

.sacred-fade-enter-from,
.sacred-fade-leave-to {
  opacity: 0;
}

.main-fade-enter-active,
.main-fade-leave-active {
  transition: opacity 0.8s ease;
}

.main-fade-enter-from,
.main-fade-leave-to {
  opacity: 0;
}

/* ==================== 主应用样式 ==================== */
.app-main {
  width: 100%;
  min-height: 100vh;
}


/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .title-sequence .welcome-glow {
    font-size: 3rem;
    letter-spacing: 5px;
  }

  .title-sequence .subtitle-shimmer {
    font-size: 1.2rem;
    letter-spacing: 2px;
  }

  .sacred-staff {
    width: 80px;
    height: 80px;
  }

  .mirror-ring-decor {
    width: 300px;
    height: 300px;
  }

  .intro-footer .loading-progress .progress-bar {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .title-sequence .welcome-glow {
    font-size: 2.2rem;
    letter-spacing: 3px;
  }

  .title-sequence .subtitle-shimmer {
    font-size: 1rem;
  }

  .intro-sacred-content {
    padding: 20px;
  }
}
</style>