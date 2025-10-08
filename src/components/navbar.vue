<template>
  <nav
    ref="navbarRef"
    class="navbar theme-red"
    :class="{ 'is-scrolled': isScrolled }"
    role="navigation"
    aria-label="主导航"
  >
    <div class="navbar__container">
      <div class="navbar__logo">
        <!-- 在你的模板里替换 logo 部分 -->
        <span class="logo-icon" aria-hidden="true">
          <!-- 这是一个简洁的“圣徽/法杖”风格徽章 SVG，风格优雅，适合菲比 -->
          <svg
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <g fill="none" stroke="none" stroke-width="0">
              <circle cx="32" cy="22" r="10" fill="#f6de97" opacity="0.12" />
              <path
                d="M32 6 L36 18 L48 22 L36 26 L32 38 L28 26 L16 22 L28 18 Z"
                fill="#f6de97"
              />
              <rect x="30" y="38" width="4" height="18" rx="2" fill="#f6de97" />
            </g>
          </svg>
        </span>

        <span class="brand-text">菲比设定集</span>
      </div>

      <div class="online-count" v-if="onlineCount !== null" aria-live="polite">
        在线：<span class="count">{{ onlineCount }} 人</span>
      </div>

      <button
        class="navbar__toggle"
        :class="{ active: open }"
        @click="toggleMenu"
      >
        <span class="line line--1"></span>
        <span class="line line--2"></span>
        <span class="line line--3"></span>
      </button>

      <ul
        class="navbar__links"
        :class="{ 'is-open': open }"
        id="primary-navigation"
      >
        <li v-for="item in links" :key="item.name" @click="onLinkClick">
          <router-link
            :to="item.path"
            class="link"
            active-class="router-link-active"
          >
            <span class="link-inner">
              <span class="link-text">{{ item.name }}</span>
              <span class="link-glow" aria-hidden="true"></span>
            </span>
          </router-link>
        </li>

        <li>
          <a
            href="http://slty.site/#/redirector"
            target="_blank"
            rel="noopener"
            class="link"
          >
            <span class="link-inner">
              <span class="link-text">总站</span>
              <span class="link-glow" aria-hidden="true"></span>
            </span>
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onUnmounted } from "vue";
import { io } from "socket.io-client";

const siteId = "feibi";
const onlineCount = ref<number | null>(null);
const socket = io("http://1.94.189.79:3000", { query: { siteId } });

const open = ref(false);
const isScrolled = ref(false);
const navbarRef = ref<HTMLElement | null>(null);

const links = [
  { name: "首页", path: "/" },
  { name: "圣徽之庭", path: "/timeLine" },
  { name: "寄予她", path: "/message" },
  { name: "流光画廊", path: "/gallery" },
  { name: "典藏秘库", path: "/resources" },
  { name: "小游戏", path: "/game" },
  // { name: "语音馆", path: "/voice" },
];

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};
const toggleMenu = () => {
  open.value = !open.value;
};
const onLinkClick = () => {
  open.value = false;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  socket.on("onlineCount", (count: number) => {
    onlineCount.value = count;
  });
});
onBeforeUnmount(() => {
  socket.disconnect();
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style lang="scss" scoped>
/* 完全写死颜色 — 红椿风格（不使用变量） */

// 主色调（参考菲比原画：蓝白服饰 + 金发 + 紫色眼眸）
$bg-start: rgba(250, 252, 255, 0.78); // 珍珠白的弱透明，用于背景叠层
$bg-end: rgba(12, 30, 58, 0.9); // 深海蓝（底色）
$accent-blue: #3b7be0; // 菲比蓝（披风 / 装饰）
$accent-blue-2: #6aa7ff; // 浅蓝高光
$gold: #e9c36a; // 金色装饰
$hair: #f6de97; // 金发暖色
$eye-lilac: #b97fe0; // 紫罗兰高光

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1200;
  height: 72px;
  padding: 12px 0;
  display: block;
  background: linear-gradient(
      180deg,
      $bg-start 0%,
      rgba(255, 255, 255, 0.06) 12%,
      transparent 22%
    ),
    linear-gradient(180deg, rgba(8, 16, 32, 0.72), $bg-end 90%);
  backdrop-filter: blur(10px) saturate(1.05);
  -webkit-backdrop-filter: blur(10px);
  transition: height 0.28s ease, box-shadow 0.28s ease, padding 0.28s ease;
}

.navbar.is-scrolled {
  height: 60px;
  box-shadow: 0 8px 30px rgba(2, 4, 8, 0.7);
}

/* 容器 */
.navbar__container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  height: 100%;
}

/* Logo */
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.navbar__logo .logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;

  svg {
    width: 100%;
    height: 100%;
    display: block;
    // svg 内的形状会继承这个 fill（方便主题化）
    fill: $hair;
    transition: transform 0.28s ease, filter 0.28s ease;
    filter: drop-shadow(0 6px 18px rgba(233, 195, 106, 0.12));
    animation: badgeGlow 3.6s ease-in-out infinite;
  }
}

@keyframes badgeGlow {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.95;
    filter: drop-shadow(0 6px 12px rgba(233, 195, 106, 0.06));
  }

  50% {
    transform: translateY(-3px);
    opacity: 1;
    filter: drop-shadow(0 10px 26px rgba(233, 195, 106, 0.12));
  }
}

.navbar__logo .brand-text {
  color: transparent;
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: 0.6px;
  background: linear-gradient(90deg, $gold 0%, $hair 30%, $accent-blue 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 6px 18px rgba(59, 123, 224, 0.06);
}

.navbar__logo:hover .logo-icon {
  transform: translateY(-3px) rotate(-6deg);
}

/* 在线数 */
.online-count {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.online-count .count {
  color: $accent-blue;
  font-weight: 800;
  margin-left: 8px;
  text-shadow: 0 4px 18px rgba($eye-lilac, 0.08);
  position: relative;
}

/* 汉堡（小屏） */
.navbar__toggle {
  display: none;
  position: relative;
  width: 44px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.02);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s;
}

.navbar__toggle .line {
  display: block;
  height: 2px;
  width: 22px;
  margin: 4px 0;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    rgba($accent-blue, 0.95) 0%,
    $gold 60%,
    rgba($eye-lilac, 0.95) 100%
  );
  box-shadow: 0 6px 18px rgba(217, 58, 58, 0.12),
    0 0 10px rgba(217, 58, 58, 0.06);
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s;
  transform-origin: center;
}

.navbar__toggle.active {
  background: linear-gradient(
    180deg,
    rgba(122, 57, 255, 0.06),
    rgba(255, 102, 196, 0.04)
  );
}

.navbar__toggle.active .line--1 {
  transform: translateY(6px) rotate(45deg);
}

.navbar__toggle.active .line--2 {
  opacity: 0;
  transform: scaleX(0.6);
}

.navbar__toggle.active .line--3 {
  transform: translateY(-6px) rotate(-45deg);
}

/* 链接列表 */
.navbar__links {
  display: flex;
  align-items: center;
  gap: 18px;
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  z-index: 3;
}

.navbar__links li .link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  display: inline-block;
  padding: 8px 6px;
  border-radius: 8px;
  transition: transform 0.18s, color 0.18s;
  position: relative;
  overflow: visible;
}

.link-inner {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.link-text {
  font-weight: 600;
  letter-spacing: 0.3px;
}

.link-glow {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -8px;
  height: 3px;
  border-radius: 6px;
  background: linear-gradient(90deg, #faf6f2 0%, #d93a3a 40%, #b82b2b 100%);
  opacity: 0;
  transform: translateY(6px) scaleX(0.98);
  filter: blur(8px);
  pointer-events: none;
  transition: opacity 0.28s, transform 0.28s;
}

.navbar__links li .link:hover {
  transform: translateY(-3px);
  color: $accent-blue;
}

.navbar__links li .link:hover .link-glow {
  opacity: 0.95;
  transform: translateY(0) scaleX(1);
}

.navbar__links li .link.router-link-active,
.navbar__links li .link.active {
  color: $accent-blue;
  text-shadow: 0 6px 28px rgba(59, 123, 224, 0.1);
}

.navbar__links li .link.router-link-active .link-glow,
.navbar__links li .link.active .link-glow {
  opacity: 1;
  transform: translateY(0) scaleX(1);
  box-shadow: 0 8px 28px rgba(184, 43, 43, 0.08);
}

/* 小屏样式 */
@media (max-width: 768px) {
  .navbar__toggle {
    display: flex;
    flex-direction: column;
  }

  .navbar__logo {
    display: none;
  }

  .navbar__links {
    position: absolute;
    top: calc(100% + 8px);
    left: 10px;
    right: 10px;
    margin: 0 auto;
    background: linear-gradient(
      180deg,
      rgba(12, 6, 8, 0.78),
      rgba(8, 4, 6, 0.9)
    );
    border-radius: 14px;
    padding: 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    max-height: 0;
    overflow: hidden;
    transform-origin: top center;
    transition: max-height 0.36s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.28s;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 12px 40px rgba(7, 4, 20, 0.6);
  }

  .navbar__links.is-open {
    max-height: 520px;
    opacity: 1;
    pointer-events: auto;
  }

  .navbar__links li .link {
    display: flex;
    justify-content: center;
    padding: 12px;
    background: linear-gradient(
      180deg,
      rgba(74, 16, 16, 0.04),
      rgba(217, 58, 58, 0.02)
    );
    border-radius: 10px;
  }
}

/* 动画 keyframes */
@keyframes floatUp {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.2;
  }

  30% {
    opacity: 0.9;
  }

  60% {
    transform: translateY(-26px) scale(1.05);
    opacity: 0.6;
  }

  100% {
    transform: translateY(-60px) scale(0.95);
    opacity: 0;
  }
}

@keyframes flowMove {
  0% {
    transform: translateX(-30%) rotate(-6deg) scaleX(1);
    opacity: 0.8;
  }

  50% {
    transform: translateX(-10%) rotate(-6deg) scaleX(1.02);
    opacity: 1;
  }

  100% {
    transform: translateX(-30%) rotate(-6deg) scaleX(1);
    opacity: 0.8;
  }
}

@keyframes petalFall {
  0% {
    transform: translate3d(0, -10vh, 0) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  60% {
    transform: translate3d(-8vw, 45vh, 0) rotate(45deg);
    opacity: 0.9;
  }

  100% {
    transform: translate3d(-12vw, 90vh, 0) rotate(80deg);
    opacity: 0;
  }
}
</style>
