<template>
  <nav
    ref="navbarRef"
    class="phoebe-navbar-v2"
    :class="{ 'is-scrolled': isScrolled, 'menu-open': isMenuOpen }"
    role="navigation"
    aria-label="菲比设定集主导航"
  >
    <!-- 神圣光影背景特效 -->
    <div class="nav-bg-effects" aria-hidden="true">
      <div class="halo-orbital"></div>
      <div class="light-streams"></div>
      <div class="particle-field"></div>
      <div class="diffraction-glow"></div>
    </div>

    <div class="nav-container">
      <!-- Logo区域 - 神圣法杖徽记 -->
      <router-link to="/" class="nav-logo" aria-label="返回首页">
        <div class="logo-orb">
          <div class="orb-core"></div>
          <div class="orb-ring ring-1"></div>
          <div class="orb-ring ring-2"></div>
          <div class="orb-ring ring-3"></div>
          <div class="staff-symbol">
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 3L14 8L20 10L14 12L12 17L10 12L4 10L10 8Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="12"
                x2="12"
                y2="20"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
              />
              <circle cx="12" cy="10" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div class="orb-glow"></div>
        </div>
        <div class="logo-text">
          <span class="brand-main">菲比圣域</span>
          <span class="brand-sub">Phoebe's Sanctuary</span>
        </div>
        <span
          class="logo-sparkle"
          v-for="i in 3"
          :key="`sparkle-${i}`"
          :style="getSparkleStyle(i)"
        ></span>
      </router-link>
      <!-- BGM音乐播放按钮 -->
      <div
        class="music-player-wrapper"
        :class="{ 'music-playing': isMusicPlaying }"
      >
        <button
          class="music-toggle-btn"
          @click="toggleMusic"
          :aria-label="isMusicPlaying ? '暂停背景音乐' : '播放背景音乐'"
          aria-live="polite"
        >
          <!-- 音乐符号主体 -->
          <div class="music-icon">
            <div class="music-note note-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18V5L21 3V16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="6"
                  cy="18"
                  r="3"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle
                  cx="18"
                  cy="16"
                  r="3"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
            <div class="music-note note-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 6V18M9 15V9M15 15V9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>

          <!-- 播放/暂停状态指示器 -->
          <div class="play-pause-indicator">
            <div class="play-bar bar-1"></div>
            <div class="play-bar bar-2"></div>
            <div class="play-bar bar-3"></div>
          </div>

          <!-- 脉冲光环效果 -->
          <div class="music-pulse-ring"></div>
          <div class="music-pulse-ring ring-delay-1"></div>
          <div class="music-pulse-ring ring-delay-2"></div>

          <!-- 粒子效果 -->
          <div class="music-particles">
            <span
              v-for="i in 8"
              :key="`particle-${i}`"
              class="music-particle"
              :style="getParticleStyle(i)"
            ></span>
          </div>

          <!-- 音波纹波效果 -->
          <div class="sound-wave">
            <div
              class="wave-bar"
              v-for="i in 5"
              :key="`wave-${i}`"
              :style="getWaveBarStyle(i)"
            ></div>
          </div>
        </button>
      </div>
      <!-- 在线状态指示器 -->
      <div
        class="online-indicator"
        v-if="onlineCount !== null"
        aria-live="polite"
      >
        <div class="pulse-dot"></div>
        <div class="pulse-ring"></div>
        <div class="pulse-ring ring-delay"></div>
        <span class="count-text"
          >圣光伴行：<em>{{ onlineCount }}</em></span
        >
      </div>

      <!-- 主要导航区域 -->
      <div class="nav-main-area">
        <!-- 主要导航链接 -->
        <ul class="nav-primary-links">
          <li v-for="item in primaryLinks" :key="item.name">
            <router-link
              :to="item.path"
              class="nav-primary-link"
              active-class="is-active"
              @click="closeMobileMenu"
            >
              <span class="link-decor decor-left"></span>
              <span class="link-text">{{ item.name }}</span>
              <span class="link-decor decor-right"></span>
              <span class="link-aura"></span>
            </router-link>
          </li>

          <!-- 更多下拉菜单 (仅PC端显示) -->
          <li
            class="more-dropdown-wrapper"
            v-if="!isMobile"
            @mouseenter="showDropdown = true"
            @mouseleave="showDropdown = false"
          >
            <button
              class="more-dropdown-trigger"
              :class="{ 'dropdown-open': showDropdown }"
              @click="toggleDropdown"
              aria-haspopup="true"
            >
              <span class="trigger-text">更多</span>
              <span class="trigger-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M7 10l5 5 5-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              <span class="trigger-glow"></span>
            </button>

            <!-- 下拉菜单内容 -->
            <transition name="dropdown">
              <div class="more-dropdown-menu" v-show="showDropdown" @click.stop>
                <div class="dropdown-header">
                  <span class="header-icon">✦</span>
                  <span class="header-text">圣域功能</span>
                </div>
                <ul class="dropdown-links">
                  <li v-for="item in dropdownLinks" :key="item.name">
                    <router-link
                      :to="item.path"
                      class="dropdown-link"
                      active-class="is-active"
                      @click="closeDropdown"
                    >
                      <span class="dropdown-link-text">{{ item.name }}</span>

                      <span class="dropdown-link-glow"></span>
                    </router-link>
                  </li>
                  <!-- 总站链接 -->
                  <li class="dropdown-external">
                    <a
                      href="http://slty.site/#/redirector"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="dropdown-link external"
                      @click="closeDropdown"
                    >
                      <span class="dropdown-link-text">前往总站</span>
                      <span class="external-icon">↗</span>
                      <span class="dropdown-link-glow"></span>
                    </a>
                  </li>
                </ul>
                <div class="dropdown-footer">
                  <span class="footer-text"
                    >共 {{ dropdownLinks.length }} 项功能</span
                  >
                </div>
              </div>
            </transition>
          </li>

          <!-- 移动端总站链接 -->
          <li class="mobile-external" v-if="isMobile">
            <a
              href="http://slty.site/#/redirector"
              target="_blank"
              rel="noopener noreferrer"
              class="nav-primary-link external"
              @click="closeMobileMenu"
            >
              <span class="link-text">前往总站</span>
              <span class="external-marker">↗</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- 移动端菜单切换按钮 -->
      <button
        class="menu-toggle-v2"
        :class="{ active: isMenuOpen }"
        @click="toggleMobileMenu"
        :aria-expanded="isMenuOpen"
        aria-label="切换导航菜单"
      >
        <span class="toggle-line"></span>
        <span class="toggle-line"></span>
        <span class="toggle-line"></span>
        <div class="toggle-orb"></div>
        <div class="toggle-halo"></div>
      </button>

      <!-- 移动端菜单面板 -->
      <transition name="mobile-panel">
        <div
          class="mobile-menu-panel"
          v-show="isMenuOpen"
          @click.self="closeMobileMenu"
        >
          <div class="panel-content" :class="{ 'panel-open': isMenuOpen }">
            <div class="panel-header">
              <div class="panel-logo">
                <div class="panel-logo-orb">
                  <div class="orb-core-small"></div>
                </div>
                <span class="panel-title">菲比圣域</span>
              </div>
              <button
                class="panel-close"
                @click="closeMobileMenu"
                aria-label="关闭菜单"
              >
                <span class="close-icon">×</span>
              </button>
            </div>

            <div class="panel-online" v-if="onlineCount !== null">
              <div class="panel-pulse"></div>
              <span class="panel-count"
                >当前 {{ onlineCount }} 位访客正在圣域中</span
              >
            </div>

            <div class="panel-links">
              <div class="panel-section">
                <h3 class="section-title">主要功能</h3>
                <div class="section-links">
                  <router-link
                    v-for="item in primaryLinks"
                    :key="item.name"
                    :to="item.path"
                    class="panel-link"
                    active-class="is-active"
                    @click="closeMobileMenu"
                  >
                    <span class="panel-link-text">{{ item.name }}</span>
                    <span class="panel-link-arrow">›</span>
                  </router-link>
                </div>
              </div>

              <div class="panel-section">
                <h3 class="section-title">其他功能</h3>
                <div class="section-links">
                  <router-link
                    v-for="item in dropdownLinks"
                    :key="item.name"
                    :to="item.path"
                    class="panel-link"
                    active-class="is-active"
                    @click="closeMobileMenu"
                  >
                    <span class="panel-link-text">{{ item.name }}</span>
                  </router-link>
                  <a
                    href="http://slty.site/#/redirector"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="panel-link external"
                    @click="closeMobileMenu"
                  >
                    <span class="panel-link-text">前往总站</span>
                    <span class="external-badge">外部</span>
                  </a>
                </div>
              </div>
            </div>

            <div class="panel-footer">
              <div class="footer-glow"></div>
              <p class="footer-text">愿圣光指引你的道路</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { io, Socket } from "socket.io-client";

// ==================== 状态与数据 ====================
const onlineCount = ref<number | null>(null);
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const showDropdown = ref(false);
const isMobile = ref(false);
// ==================== BGM音乐播放相关 ====================
const isMusicPlaying = ref(false);

const audioElement = ref<HTMLAudioElement | null>(null);
const musicPath = "http://36.150.237.25:3000/music/Daisy Crown (日文版).mp3";

// 初始化音频
const initAudio = () => {
  if (typeof Audio === "undefined") return;

  audioElement.value = new Audio(musicPath);
  audioElement.value.loop = true;

  audioElement.value.preload = "auto";

  // 音频加载错误处理
  audioElement.value.addEventListener("error", (e) => {
    console.error("音频加载失败:", e);
    isMusicPlaying.value = false;
  });

  // 音频加载成功
  audioElement.value.addEventListener("canplay", () => {
    console.log("背景音乐加载成功");
  });
};

// 切换音乐播放状态
const toggleMusic = async () => {
  if (!audioElement.value) {
    initAudio();
  }

  if (!audioElement.value) return;

  try {
    if (isMusicPlaying.value) {
      await audioElement.value.pause();
      isMusicPlaying.value = false;
    } else {
      await audioElement.value.play();
      isMusicPlaying.value = true;
    }
  } catch (error) {
    console.error("播放/暂停音乐时出错:", error);
    isMusicPlaying.value = false;
  }
};

// 生成粒子样式
const getParticleStyle = (index: number) => {
  const angle = (index / 8) * Math.PI * 2;
  const distance = 40 + Math.random() * 20;
  const delay = index * 0.1;
  const duration = 2 + Math.random() * 1;

  return {
    "--particle-angle": `${angle}rad`,
    "--particle-distance": `${distance}px`,
    "--particle-delay": `${delay}s`,
    "--particle-duration": `${duration}s`,
  } as any;
};

// 生成音波条样式
const getWaveBarStyle = (index: number) => {
  const delay = index * 0.1;
  const height = 10 + Math.random() * 20;

  return {
    "--wave-delay": `${delay}s`,
    "--wave-height": `${height}%`,
  } as any;
};

// Socket.IO 连接
const socket: Socket = io("http://36.150.237.25:3000", {
  query: { siteId: "feibi" },
});

const primaryLinks = [
  { name: "圣域初光", path: "/" },
  { name: "光影记事", path: "/timeLine" },
  { name: "镜影绘卷", path: "/gallery" },
  { name: "回音庭", path: "/talk" },
  { name: "祈愿之壁", path: "/message" },
  { name: "晨光祈愿", path: "/game" },
];

// 下拉菜单链接 (PC端隐藏的链接)
const dropdownLinks = [
  { name: "圣光馈赠", path: "/resources" },
  { name: "隐海文阁", path: "/wiki" },
  { name: "圣音回廊", path: "/voice" },
  { name: "光噪旋律", path: "/music" },
  { name: "圣域回音", path: "/thanks" },
];

// ==================== 方法 ====================
const toggleMobileMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  // 防止背景滚动
  if (isMenuOpen.value) {
    document.body.style.overflow = "hidden";
    // 关闭下拉菜单
    showDropdown.value = false;
  } else {
    document.body.style.overflow = "";
  }
};

const closeMobileMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = "";
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const closeDropdown = () => {
  showDropdown.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 30;
};

const handleResize = () => {
  isMobile.value = window.innerWidth <= 992;
  // 如果切换到移动端，关闭下拉菜单
  if (isMobile.value) {
    showDropdown.value = false;
  }
};

// 为动态元素生成样式
const getSparkleStyle = (index: number) => {
  const delay = index * 0.3;
  const duration = 2 + index * 0.5;
  return {
    "--sparkle-delay": `${delay}s`,
    "--sparkle-duration": `${duration}s`,
    "--sparkle-offset": `${index * 120}deg`,
  } as any;
};

// ==================== 计算属性 ====================
// 检查是否应该显示更多下拉菜单
const shouldShowMoreDropdown = computed(() => {
  return !isMobile.value && dropdownLinks.length > 0;
});

// ==================== 生命周期 ====================
onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize);
  handleResize(); // 初始化

  socket.on("onlineCount", (count: number) => {
    onlineCount.value = count;
  });

  // 点击外部关闭下拉菜单
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".more-dropdown-wrapper")) {
      showDropdown.value = false;
    }
  });
});

onBeforeUnmount(() => {
  socket.disconnect();
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
  document.body.style.overflow = "";

  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }
});

// 监听移动端状态变化
watch(isMobile, (newValue) => {
  if (newValue) {
    showDropdown.value = false;
  }
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
$phoebe-white-trans: rgba(250, 252, 253, 0.95);

/* ==================== 导航栏基础样式 ==================== */
.phoebe-navbar-v2 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  height: 80px;
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.94) 0%,
    rgba($phoebe-blue-deep, 0.96) 100%
  );
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba($phoebe-blue-bright, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba($phoebe-lilac, 0.03);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);

  &.is-scrolled {
    height: 70px;
    box-shadow: 0 8px 32px rgba(2, 4, 24, 0.4),
      0 0 0 1px rgba($phoebe-lilac, 0.05);
    border-bottom-color: rgba($phoebe-blue-bright, 0.18);
  }

  &.menu-open {
    background: rgba($phoebe-blue-deep, 0.98);
  }
}

/* ==================== 背景特效 ==================== */
.nav-bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;

  border-radius: 0 0 24px 24px;
  z-index: 1;

  .halo-orbital {
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(
      ellipse at center,
      rgba($phoebe-lilac, 0.08) 0%,
      rgba($phoebe-blue-light, 0.04) 30%,
      transparent 70%
    );
    filter: blur(40px);
    animation: orbitalFloat 20s ease-in-out infinite;
  }

  .light-streams {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba($phoebe-gold, 0.02) 20%,
      rgba($phoebe-lilac, 0.03) 40%,
      rgba($phoebe-blue-bright, 0.02) 60%,
      transparent 100%
    );
    opacity: 0.3;
    animation: streamFlow 8s linear infinite;
  }

  .particle-field {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        circle at 20% 30%,
        rgba($phoebe-gold, 0.04) 0%,
        transparent 2%
      ),
      radial-gradient(
        circle at 80% 60%,
        rgba($phoebe-lilac, 0.03) 0%,
        transparent 2%
      ),
      radial-gradient(
        circle at 40% 80%,
        rgba($phoebe-blue-bright, 0.02) 0%,
        transparent 2%
      );
    background-size: 300px 300px;
    animation: particleShift 60s linear infinite;
  }

  .diffraction-glow {
    position: absolute;
    bottom: -50px;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(
      to top,
      rgba($phoebe-lilac, 0.1) 0%,
      rgba($phoebe-blue-light, 0.05) 30%,
      transparent 100%
    );
    filter: blur(20px);
    animation: glowPulse 4s ease-in-out infinite;
  }
}

@keyframes orbitalFloat {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) rotate(0deg);
  }
  33% {
    transform: translateX(-52%) translateY(-10px) rotate(120deg);
  }
  66% {
    transform: translateX(-48%) translateY(10px) rotate(240deg);
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
    background-position: 300px 300px;
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* ==================== 布局容器 ==================== */
.nav-container {
  position: relative;
  z-index: 2;
  width: 100vw;
  height: 100%;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* ==================== Logo样式 ==================== */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  flex-shrink: 0;
  position: relative;
  padding: 8px;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba($phoebe-white, 0.02);
  border: 1px solid transparent;

  &:hover {
    background: rgba($phoebe-white, 0.04);
    border-color: rgba($phoebe-gold, 0.1);
    transform: translateY(-2px);

    .logo-orb {
      transform: scale(1.05) rotate(15deg);

      .orb-ring {
        animation-play-state: running;
      }
    }

    .logo-sparkle {
      opacity: 1;
    }
  }

  .logo-orb {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);

    .orb-core {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: radial-gradient(circle, $phoebe-gold, $phoebe-lilac);
      filter: drop-shadow(0 0 20px rgba($phoebe-gold, 0.6));
      z-index: 2;
      animation: corePulse 2s ease-in-out infinite;
    }

    .orb-ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid;
      opacity: 0.3;

      &.ring-1 {
        width: 100%;
        height: 100%;
        border-color: $phoebe-gold;
        animation: ringSpin 8s linear infinite paused;
      }

      &.ring-2 {
        width: 70%;
        height: 70%;
        border-color: $phoebe-lilac;
        animation: ringSpin 6s linear reverse infinite paused;
      }

      &.ring-3 {
        width: 40%;
        height: 40%;
        border-color: $phoebe-blue-bright;
        animation: ringSpin 4s linear infinite paused;
      }
    }

    .staff-symbol {
      position: absolute;
      width: 24px;
      height: 24px;
      color: $phoebe-white;
      z-index: 3;

      svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 0 8px rgba($phoebe-white, 0.5));
      }
    }

    .orb-glow {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba($phoebe-gold, 0.3) 0%,
        transparent 70%
      );
      opacity: 0;
      transition: opacity 0.5s ease;
      z-index: 1;
    }
  }

  &:hover .orb-glow {
    opacity: 0.8;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    .brand-main {
      color: $phoebe-white;
      font-weight: 700;
      font-size: 1.5rem;
      letter-spacing: 0.5px;
      background: linear-gradient(90deg, $phoebe-gold, $phoebe-white);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4px 20px rgba($phoebe-gold, 0.2);
    }

    .brand-sub {
      color: rgba($phoebe-white, 0.6);
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: 1px;
      margin-top: 2px;
    }
  }

  .logo-sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: $phoebe-white;
    opacity: 0;
    pointer-events: none;

    &:nth-child(1) {
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &:nth-child(2) {
      top: 50%;
      right: 0;
      transform: translate(50%, -50%) rotate(var(--sparkle-offset));
    }

    &:nth-child(3) {
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 50%) rotate(calc(var(--sparkle-offset) * 2));
    }

    animation: sparkleTwinkle var(--sparkle-duration) ease-in-out
      var(--sparkle-delay) infinite;
  }
}

@keyframes corePulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
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

@keyframes sparkleTwinkle {
  0%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* ==================== 在线状态指示器 ==================== */
.online-indicator {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background: rgba($phoebe-blue-light, 0.08);
  border-radius: 16px;
  border: 1px solid rgba($phoebe-blue-light, 0.12);
  backdrop-filter: blur(4px);
  flex-shrink: 0;

  .pulse-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, $phoebe-gold, $phoebe-lilac);
    box-shadow: 0 0 20px rgba($phoebe-lilac, 0.5);
    animation: statusPulse 2s ease-in-out infinite;
  }

  .pulse-ring {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid $phoebe-gold;
    left: 4px;
    opacity: 0;
    animation: ringExpand 2s ease-out infinite;

    &.ring-delay {
      animation-delay: 1s;
    }
  }

  .count-text {
    color: rgba($phoebe-white, 0.9);
    font-size: 0.9rem;
    font-weight: 500;

    em {
      color: $phoebe-gold;
      font-style: normal;
      font-weight: 700;
      margin: 0 2px;
    }
  }
}

@keyframes statusPulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes ringExpand {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* ==================== 主要导航链接 ==================== */
.nav-main-area {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-primary-links {
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    position: relative;
  }

  .nav-primary-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 22px;
    color: rgba($phoebe-white, 0.85);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    overflow: hidden;
    background: rgba($phoebe-white, 0.02);
    border: 1px solid transparent;

    .link-decor {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: $phoebe-gold;
      opacity: 0;
      transform: scale(0);
      transition: all 0.3s ease;
    }

    .link-text {
      position: relative;
      z-index: 2;
      letter-spacing: 0.3px;
    }

    .link-aura {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        135deg,
        rgba($phoebe-blue-light, 0.1) 0%,
        rgba($phoebe-lilac, 0.05) 100%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1;
    }

    &:hover {
      color: $phoebe-white;
      background: rgba($phoebe-white, 0.04);
      border-color: rgba($phoebe-gold, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba($phoebe-gold, 0.05);

      .link-decor {
        opacity: 1;
        transform: scale(1);
      }

      .link-aura {
        opacity: 1;
      }

      &::before {
        transform: translateX(0);
      }
    }

    &.is-active {
      color: $phoebe-white;
      background: linear-gradient(
        135deg,
        rgba($phoebe-blue-light, 0.15) 0%,
        rgba($phoebe-lilac, 0.1) 100%
      );
      border-color: rgba($phoebe-gold, 0.2);
      box-shadow: 0 8px 24px rgba($phoebe-blue-light, 0.15),
        inset 0 1px 0 rgba($phoebe-white, 0.1);

      &::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
        width: 40%;
        height: 2px;
        background: linear-gradient(90deg, $phoebe-gold, $phoebe-lilac);
        border-radius: 2px;
        box-shadow: 0 0 12px rgba($phoebe-lilac, 0.5);
      }

      .link-decor {
        opacity: 1;
        transform: scale(1);
        background: $phoebe-white;
      }
    }

    &.external {
      background: linear-gradient(
        135deg,
        rgba($phoebe-blue-light, 0.1) 0%,
        rgba($phoebe-lilac, 0.05) 100%
      );

      .external-marker {
        color: $phoebe-gold;
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
  }
}

/* ==================== 更多下拉菜单 ==================== */
.more-dropdown-wrapper {
  position: relative;

  .more-dropdown-trigger {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 22px;
    color: rgba($phoebe-white, 0.85);
    background: rgba($phoebe-white, 0.02);
    border: 1px solid rgba($phoebe-gold, 0.1);
    border-radius: 14px;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);

    .trigger-text {
      letter-spacing: 0.3px;
    }

    .trigger-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .trigger-glow {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        135deg,
        rgba($phoebe-gold, 0.1) 0%,
        rgba($phoebe-lilac, 0.05) 100%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      color: $phoebe-white;
      background: rgba($phoebe-white, 0.04);
      border-color: rgba($phoebe-gold, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba($phoebe-gold, 0.05);

      .trigger-glow {
        opacity: 1;
      }
    }

    &.dropdown-open {
      color: $phoebe-white;
      background: linear-gradient(
        135deg,
        rgba($phoebe-blue-light, 0.15) 0%,
        rgba($phoebe-lilac, 0.1) 100%
      );
      border-color: rgba($phoebe-gold, 0.25);

      .trigger-icon {
        transform: rotate(180deg);
      }

      .trigger-glow {
        opacity: 1;
      }
    }
  }
}

/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 下拉菜单内容 */
.more-dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 240px;
  background: rgba($phoebe-blue-deep, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 18px;
  border: 1px solid rgba($phoebe-gold, 0.15);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba($phoebe-white, 0.05), inset 0 1px 0 rgba($phoebe-white, 0.1);
  overflow: hidden;
  z-index: 1000;

  .dropdown-header {
    padding: 18px 20px 16px;
    border-bottom: 1px solid rgba($phoebe-white, 0.08);
    background: linear-gradient(
      90deg,
      rgba($phoebe-blue-light, 0.1) 0%,
      rgba($phoebe-lilac, 0.05) 100%
    );

    .header-icon {
      color: $phoebe-gold;
      font-size: 1.2rem;
      margin-right: 10px;
    }

    .header-text {
      color: $phoebe-white;
      font-weight: 600;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
    }
  }

  .dropdown-links {
    list-style: none;
    margin: 0;
    padding: 8px 0;

    li {
      position: relative;

      .dropdown-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        color: rgba($phoebe-white, 0.8);
        text-decoration: none;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;

        .dropdown-link-text {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .dropdown-link-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba($phoebe-blue-light, 0.1) 0%,
            rgba($phoebe-lilac, 0.05) 100%
          );
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: -1;
        }

        &:hover {
          color: $phoebe-white;
          padding-left: 24px;

          .dropdown-link-glow {
            opacity: 1;
          }
        }

        &.is-active {
          color: $phoebe-white;
          background: linear-gradient(
            90deg,
            rgba($phoebe-blue-light, 0.15) 0%,
            rgba($phoebe-lilac, 0.1) 100%
          );

          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 60%;
            background: linear-gradient(to bottom, $phoebe-gold, $phoebe-lilac);
            border-radius: 0 2px 2px 0;
          }
        }

        &.external {
          .external-icon {
            color: $phoebe-gold;
            font-size: 0.9rem;
            margin-left: 8px;
          }
        }
      }

      &.dropdown-external {
        margin-top: 8px;
        border-top: 1px solid rgba($phoebe-white, 0.08);

        .dropdown-link {
          background: linear-gradient(
            90deg,
            rgba($phoebe-blue-light, 0.08) 0%,
            rgba($phoebe-lilac, 0.04) 100%
          );

          &:hover {
            background: linear-gradient(
              90deg,
              rgba($phoebe-blue-light, 0.12) 0%,
              rgba($phoebe-lilac, 0.08) 100%
            );
          }
        }
      }
    }
  }

  .dropdown-footer {
    padding: 12px 20px;
    border-top: 1px solid rgba($phoebe-white, 0.08);
    text-align: center;

    .footer-text {
      color: rgba($phoebe-white, 0.5);
      font-size: 0.8rem;
    }
  }
}

/* ==================== 移动端菜单切换按钮 ==================== */
.menu-toggle-v2 {
  display: none;
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba($phoebe-blue-light, 0.08);
  border: 1px solid rgba($phoebe-blue-bright, 0.15);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  .toggle-line {
    width: 22px;
    height: 2px;
    background: linear-gradient(90deg, $phoebe-gold, $phoebe-blue-bright);
    border-radius: 1px;
    margin: 3px 0;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    transform-origin: center;
  }

  .toggle-orb {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: radial-gradient(circle, $phoebe-gold, $phoebe-lilac);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .toggle-halo {
    position: absolute;
    inset: -5px;
    border-radius: 21px;
    border: 2px solid rgba($phoebe-gold, 0.3);
    opacity: 0;
    transition: all 0.3s ease;
  }

  &:hover {
    background: rgba($phoebe-blue-light, 0.12);
    border-color: rgba($phoebe-blue-bright, 0.25);

    .toggle-orb {
      opacity: 1;
    }

    .toggle-halo {
      opacity: 1;
      inset: -8px;
    }
  }

  &.active {
    background: rgba($phoebe-blue-light, 0.15);
    border-color: rgba($phoebe-blue-bright, 0.3);

    .toggle-line {
      &:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      &:nth-child(2) {
        opacity: 0;
        transform: scaleX(0);
      }
      &:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }
    }

    .toggle-orb {
      opacity: 1;
      animation: orbPulse 1s ease-in-out infinite;
    }
  }
}

@keyframes orbPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

/* ==================== 移动端菜单面板 ==================== */
.mobile-menu-panel {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba($phoebe-blue-deep, 0.7);
  z-index: 1999;

  .panel-content {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 320px;
    min-height: 100vh;
    overflow-y: auto;
    background: linear-gradient(
      180deg,
      rgba($phoebe-blue-dark, 0.98) 0%,
      rgba($phoebe-blue-deep, 0.97) 100%
    );
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border-left: 1px solid rgba($phoebe-gold, 0.1);
    box-shadow: -10px 0 60px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    &.panel-open {
      transform: translateX(0);
    }
  }

  .panel-header {
    padding: 24px;
    border-bottom: 1px solid rgba($phoebe-white, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .panel-logo {
      display: flex;
      align-items: center;
      gap: 12px;

      .panel-logo-orb {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba($phoebe-gold, 0.8),
          rgba($phoebe-lilac, 0.6)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .orb-core-small {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: $phoebe-white;
          box-shadow: 0 0 12px rgba($phoebe-white, 0.8);
          animation: corePulse 2s ease-in-out infinite;
        }
      }

      .panel-title {
        color: $phoebe-white;
        font-weight: 700;
        font-size: 1.3rem;
        background: linear-gradient(90deg, $phoebe-gold, $phoebe-white);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .panel-close {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba($phoebe-white, 0.05);
      border: 1px solid rgba($phoebe-white, 0.1);
      color: $phoebe-white;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba($phoebe-white, 0.1);
        transform: rotate(90deg);
      }
    }
  }

  .panel-online {
    padding: 16px 24px;
    border-bottom: 1px solid rgba($phoebe-white, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;

    .panel-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, $phoebe-gold, $phoebe-lilac);
      box-shadow: 0 0 12px rgba($phoebe-lilac, 0.6);
      animation: statusPulse 2s ease-in-out infinite;
    }

    .panel-count {
      color: rgba($phoebe-white, 0.9);
      font-size: 0.9rem;
      font-weight: 500;
    }
  }

  .panel-links {
    flex: 1;
    padding: 20px 0;
    .panel-section {
      margin-bottom: 24px;

      .section-title {
        color: rgba($phoebe-white, 0.6);
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 0 24px 12px;
        margin: 0;
      }

      .section-links {
        display: flex;
        flex-direction: column;

        .panel-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          color: rgba($phoebe-white, 0.85);
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          border-left: 3px solid transparent;

          .panel-link-text {
            flex: 1;
            font-size: 0.95rem;
            font-weight: 500;
          }

          .panel-link-arrow {
            color: rgba($phoebe-white, 0.5);
            font-size: 1.2rem;
            transition: transform 0.2s ease;
          }

          .external-badge {
            background: rgba($phoebe-blue-light, 0.2);
            color: $phoebe-blue-bright;
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
          }

          &:hover {
            color: $phoebe-white;
            background: rgba($phoebe-white, 0.03);
            border-left-color: $phoebe-gold;
            padding-left: 28px;

            .panel-link-arrow {
              transform: translateX(3px);
              color: $phoebe-gold;
            }
          }

          &.is-active {
            color: $phoebe-white;
            background: linear-gradient(
              90deg,
              rgba($phoebe-blue-light, 0.1) 0%,
              transparent 100%
            );
            border-left-color: $phoebe-blue-light;

            &::before {
              content: "";
              position: absolute;
              right: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 40%;
              background: linear-gradient(
                to bottom,
                $phoebe-gold,
                $phoebe-lilac
              );
              border-radius: 2px 0 0 2px;
            }
          }

          &.external {
            background: rgba($phoebe-blue-light, 0.05);

            &:hover {
              background: rgba($phoebe-blue-light, 0.1);
            }
          }
        }
      }
    }
  }

  .panel-footer {
    padding: 20px 24px;
    border-top: 1px solid rgba($phoebe-white, 0.08);
    text-align: center;
    position: relative;

    .footer-glow {
      position: absolute;
      top: -50px;
      left: 0;
      right: 0;
      height: 50px;
      background: linear-gradient(
        to top,
        rgba($phoebe-lilac, 0.1),
        transparent
      );
      filter: blur(10px);
    }

    .footer-text {
      color: rgba($phoebe-white, 0.6);
      font-size: 0.85rem;
      font-style: italic;
      position: relative;
      z-index: 2;
    }
  }
}

/* 移动端面板动画 */
.mobile-panel-enter-active,
.mobile-panel-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-panel-enter-from,
.mobile-panel-leave-to {
  opacity: 0;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1200px) {
  .nav-container {
    padding: 0 20px;
  }

  .nav-primary-links .nav-primary-link {
    padding: 12px 18px;
    font-size: 0.9rem;
  }

  .more-dropdown-trigger {
    padding: 12px 18px;
  }
}

@media (max-width: 992px) {
  .nav-main-area,
  .online-indicator,
  .more-dropdown-wrapper {
    display: none;
  }

  .menu-toggle-v2 {
    display: flex;
  }

  .mobile-menu-panel {
    display: block;
  }

  .mobile-external {
    display: block;
  }

  .nav-logo {
    .logo-text {
      .brand-main {
        font-size: 1.3rem;
      }

      .brand-sub {
        font-size: 0.7rem;
      }
    }
  }
}

@media (max-width: 576px) {
  .nav-container {
    padding: 0 16px;
  }

  .nav-logo {
    gap: 12px;

    .logo-orb {
      width: 40px;
      height: 40px;
    }

    .logo-text {
      .brand-main {
        font-size: 1.2rem;
      }
    }
  }

  .menu-toggle-v2 {
    width: 48px;
    height: 48px;
  }

  .mobile-menu-panel .panel-content {
    width: 280px;
  }
} /* ==================== BGM音乐播放器样式 ==================== */
.music-player-wrapper {
  position: relative;
  margin-left: 12px;
  z-index: 10;

  &:hover {
    .music-toggle-btn {
      .music-icon {
        transform: scale(1.1) rotate(5deg);
      }
    }
  }

  &.music-playing {
    .music-pulse-ring {
      opacity: 1;
      animation-play-state: running;
    }

    .sound-wave {
      opacity: 1;
      transform: scale(1);
    }

    .music-particles {
      opacity: 1;

      .music-particle {
        animation-play-state: running;
      }
    }
  }
}

.music-toggle-btn {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba($phoebe-lilac, 0.15) 0%,
    rgba($phoebe-blue-light, 0.1) 100%
  );
  border: 1px solid rgba($phoebe-gold, 0.2);
  color: $phoebe-white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  backdrop-filter: blur(4px);
  overflow: hidden;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba($phoebe-lilac, 0.25) 0%,
      rgba($phoebe-blue-light, 0.2) 100%
    );
    border-color: rgba($phoebe-gold, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba($phoebe-lilac, 0.2),
      0 0 0 1px rgba($phoebe-gold, 0.1), inset 0 1px 0 rgba($phoebe-white, 0.1);

    .music-icon {
      color: $phoebe-gold;
    }
  }

  &:active {
    transform: translateY(0);
  }
}

.music-icon {
  position: relative;
  z-index: 3;
  width: 24px;
  height: 24px;
  color: $phoebe-white;
  transition: all 0.3s ease;

  .music-note {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.9;

    svg {
      width: 100%;
      height: 100%;
    }

    &.note-1 {
      animation: noteFloat 3s ease-in-out infinite;
    }

    &.note-2 {
      opacity: 0.6;
      transform: scale(0.8) rotate(20deg);
      animation: noteFloat 3s ease-in-out infinite reverse;
    }
  }
}

.play-pause-indicator {
  position: absolute;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 2px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;

  .play-bar {
    width: 3px;
    background: $phoebe-gold;
    border-radius: 2px;
    transform-origin: bottom;

    &.bar-1 {
      height: 40%;
      animation: barPulse 1.2s ease-in-out infinite;
    }

    &.bar-2 {
      height: 70%;
      animation: barPulse 1.2s ease-in-out infinite 0.3s;
    }

    &.bar-3 {
      height: 100%;
      animation: barPulse 1.2s ease-in-out infinite 0.6s;
    }
  }
}

.music-playing .play-pause-indicator {
  opacity: 1;
  transform: scale(1);
}

.music-pulse-ring {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 2px solid rgba($phoebe-lilac, 0.3);
  opacity: 0;
  animation: musicRingPulse 2s ease-out infinite;
  pointer-events: none;

  &.ring-delay-1 {
    animation-delay: 0.3s;
  }

  &.ring-delay-2 {
    animation-delay: 0.6s;
  }
}

.music-particles {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;

  .music-particle {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: linear-gradient(135deg, $phoebe-gold, $phoebe-lilac);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    animation: particleEmit var(--particle-duration) ease-in-out
      var(--particle-delay) infinite paused;

    &::before {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      background: inherit;
      filter: blur(3px);
      opacity: 0.5;
    }
  }
}

.sound-wave {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s ease;
  pointer-events: none;

  .wave-bar {
    position: absolute;
    width: 2px;
    background: linear-gradient(to top, transparent, rgba($phoebe-gold, 0.6));
    bottom: 50%;
    left: 50%;
    transform-origin: bottom center;
    border-radius: 1px;
    opacity: 0;
    animation: waveRipple 1.5s ease-in-out infinite;

    &:nth-child(1) {
      transform: translateX(-50%) rotate(0deg);
      animation-delay: var(--wave-delay);
      height: var(--wave-height);
    }

    &:nth-child(2) {
      transform: translateX(-50%) rotate(72deg);
      animation-delay: calc(var(--wave-delay) + 0.1s);
      height: var(--wave-height);
    }

    &:nth-child(3) {
      transform: translateX(-50%) rotate(144deg);
      animation-delay: calc(var(--wave-delay) + 0.2s);
      height: var(--wave-height);
    }

    &:nth-child(4) {
      transform: translateX(-50%) rotate(216deg);
      animation-delay: calc(var(--wave-delay) + 0.3s);
      height: var(--wave-height);
    }

    &:nth-child(5) {
      transform: translateX(-50%) rotate(288deg);
      animation-delay: calc(var(--wave-delay) + 0.4s);
      height: var(--wave-height);
    }
  }
}

/* ==================== 音乐动画关键帧 ==================== */
@keyframes noteFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-4px) rotate(5deg);
  }
}

@keyframes barPulse {
  0%,
  100% {
    height: 40%;
    opacity: 0.7;
  }
  50% {
    height: 100%;
    opacity: 1;
  }
}

@keyframes musicRingPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes particleEmit {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) translateX(0) translateY(0);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%)
      translateX(calc(cos(var(--particle-angle)) * var(--particle-distance)))
      translateY(calc(sin(var(--particle-angle)) * var(--particle-distance)));
  }
}

@keyframes waveRipple {
  0%,
  100% {
    opacity: 0;
    transform: translateX(-50%) rotate(var(--rotate)) scaleY(0.2);
  }
  50% {
    opacity: 0.8;
    transform: translateX(-50%) rotate(var(--rotate)) scaleY(1);
  }
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 992px) {
  .music-player-wrapper {
    margin-left: 8px;
   
  }

  .music-toggle-btn {
    width: 44px;
    height: 44px;
  }

  .volume-slider-container {
    right: auto;
    left: 50%;
    transform: translateX(-50%) translateY(10px);

    &::before {
      left: 50%;
      right: auto;
      transform: translateX(-50%) rotate(45deg);
    }
  }
}

@media (max-width: 576px) {
  .music-player-wrapper {
    margin-left: 4px;
  }

  .music-toggle-btn {
    width: 40px;
    height: 40px;
  }

  .music-icon {
    width: 20px;
    height: 20px;
  }

  .volume-slider-container {
    width: 140px;
    padding: 12px;
  }
}
</style>