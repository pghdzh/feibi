<template>
  <div class="ack-page">
    <!-- 背景特效 -->
    <div class="bg-effects" aria-hidden="true">
      <div class="halo-orbital"></div>
      <div class="light-streams"></div>
      <div class="particle-field"></div>
      <div class="diffraction-glow"></div>
    </div>

    <div class="ack-container">
      <!-- 标题区域 -->
      <div class="page-header">
        <div class="title-orb">
          <div class="orb-core"></div>
          <div class="orb-ring ring-1"></div>
          <div class="orb-ring ring-2"></div>
          <div class="orb-ring ring-3"></div>
        </div>
        <h1 class="page-title">圣域回音 · 鸣谢录</h1>
        <p class="page-subtitle">Phoebe's Echo · Hall of Acknowledgment</p>
        <div
          class="title-sparkle"
          v-for="i in 5"
          :key="i"
          :style="getSparkleStyle(i)"
        ></div>
      </div>

      <!-- 鸣谢列表 -->
      <div class="ack-list-wrapper">
        <div class="list-header">
          <span class="header-icon">✦</span>
          <span class="header-text">圣光伴行，铭记于心</span>
          <span class="header-count">{{ acknowledgements.length }} 份回音</span>
        </div>

        <div class="ack-scroll-container">
          <ul class="ack-list">
            <li
              v-for="(item, index) in acknowledgements"
              :key="index"
              class="ack-item"
              :style="{ animationDelay: index * 0.1 + 's' }"
              @mouseenter="hoverItem(index)"
            >
              <!-- 序号徽章 -->
              <div class="item-badge">
                <span class="badge-number">{{ index + 1 }}</span>
                <div class="badge-glow"></div>
              </div>

              <!-- 内容区域 -->
              <div class="item-content">
                <div class="item-header">
                  <span class="nickname">{{ item.nickname }}</span>
                  <span class="contrib-role">圣域贡献者</span>
                </div>

                <div class="suggestion-wrapper">
                  <span class="quote-icon">「</span>
                  <span class="suggestion">{{ item.suggestion }}</span>
                  <span class="quote-icon">」</span>
                </div>

             
              </div>

              <!-- 装饰元素 -->
              <div class="item-decor">
                <div class="decor-line"></div>
                <div class="decor-orb"></div>
              </div>

              <!-- 悬停效果 -->
              <div class="item-hover-glow"></div>
            </li>
          </ul>
        </div>

       
      </div>

      <!-- 空状态 -->
      <div v-if="acknowledgements.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>
        <h3>暂无鸣谢内容</h3>
        <p>圣光正在汇聚回音...</p>
      </div>

   
    </div>

    <!-- 页脚 -->
    <footer class="ack-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <div class="footer-orb"></div>
          <span class="footer-text">菲比圣域 · 永恒回音</span>
        </div>
        <div class="footer-info">
          <span class="copyright"
            >© 2026 菲比电子设定集 · 感谢所有圣光使者</span
          >
          <span class="blessing">愿圣光指引你的道路</span>
        </div>
      </div>
      <div class="footer-glow"></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const acknowledgements = reactive([
  {
    nickname: "六餐",
    suggestion: "增加导航中的bgm播放器",
  },
  {
    nickname: "六餐",
    suggestion: "图集页面单图查看界面加个放大和还原还有点赞下载",
  },
  {
    nickname: "六餐",
    suggestion: "图片去重（这个是我后台清的如果有遗漏请谅解）",
  },
    {
    nickname: "六餐",
    suggestion: "增加新图查看，表情包单独分类（有按上传时间排序按钮，表情包单独分类emmm要改数据表和重新整理图片,确实有点麻烦不想弄）",
  },
  {
    nickname: "六餐",
    suggestion: "图集页面快速查看点赞过的",
  },
    {
    nickname: "六餐",
    suggestion: "后面的图片点赞和回音庭报错了（图片点赞报错没复现，AI对话报错是我API没钱了已经充了，如果还在报错请清空对话记录，原因是报错次数多了然后把报错记录一并发过去了，AI就变成复读机了）",
  },
  {
    nickname: "六餐",
    suggestion: "修复移动端侧边导航栏无法滑动的bug",
  },
 
]);

// 生成星光样式
const getSparkleStyle = (index: number) => {
  const delay = index * 0.3;
  const duration = 2 + index * 0.5;
  return {
    "--sparkle-delay": `${delay}s`,
    "--sparkle-duration": `${duration}s`,
    "--sparkle-offset": `${index * 72}deg`,
  } as any;
};





// 悬停效果
const hoverItem = (index: number) => {
  // 可以添加额外的悬停交互效果
};
</script>

<style lang="scss" scoped>
/* 菲比风格配色变量 */
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

/* ==================== 页面容器 ==================== */
.ack-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    $phoebe-blue-deep 0%,
    $phoebe-blue-dark 100%
  );
  color: $phoebe-white;
  font-family: "Noto Sans SC", "Segoe UI", system-ui, sans-serif;
  padding-top: 80px;
  overflow-x: hidden;
}

/* ==================== 背景特效 ==================== */
.bg-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;

  .halo-orbital {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(100vw, 600px);
    height: min(100vw, 600px);
    border-radius: 50%;
    background: radial-gradient(
      ellipse at center,
      rgba($phoebe-lilac, 0.08) 0%,
      rgba($phoebe-blue-light, 0.04) 30%,
      transparent 70%
    );
    filter: blur(60px);
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
    opacity: 0.4;
    animation: streamFlow 15s linear infinite;
  }

  .particle-field {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
        circle at 10% 20%,
        rgba($phoebe-gold, 0.04) 0%,
        transparent 2%
      ),
      radial-gradient(
        circle at 90% 30%,
        rgba($phoebe-lilac, 0.03) 0%,
        transparent 2%
      ),
      radial-gradient(
        circle at 20% 80%,
        rgba($phoebe-blue-bright, 0.02) 0%,
        transparent 2%
      );
    background-size: 400px 400px;
    animation: particleShift 40s linear infinite;
  }

  .diffraction-glow {
    position: absolute;
    bottom: -100px;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(
      to top,
      rgba($phoebe-lilac, 0.15) 0%,
      rgba($phoebe-blue-light, 0.08) 30%,
      transparent 100%
    );
    filter: blur(40px);
    animation: glowPulse 6s ease-in-out infinite;
  }
}

@keyframes orbitalFloat {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
  33% {
    transform: translate(-50%, -50%) rotate(120deg) scale(1.05);
  }
  66% {
    transform: translate(-50%, -50%) rotate(240deg) scale(0.95);
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

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

/* ==================== 主要内容容器 ==================== */
.ack-container {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

/* ==================== 标题区域 ==================== */
.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;

  .title-orb {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .orb-core {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: radial-gradient(circle, $phoebe-gold, $phoebe-lilac);
      filter: drop-shadow(0 0 30px rgba($phoebe-gold, 0.8));
      z-index: 2;
      animation: corePulse 3s ease-in-out infinite;
    }

    .orb-ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid;
      opacity: 0.4;

      &.ring-1 {
        width: 100%;
        height: 100%;
        border-color: $phoebe-gold;
        animation: ringSpin 12s linear infinite;
      }

      &.ring-2 {
        width: 70%;
        height: 70%;
        border-color: $phoebe-lilac;
        animation: ringSpin 8s linear reverse infinite;
      }

      &.ring-3 {
        width: 40%;
        height: 40%;
        border-color: $phoebe-blue-bright;
        animation: ringSpin 5s linear infinite;
      }
    }
  }

  .page-title {
    font-size: clamp(2rem, 5vw, 2.8rem);
    font-weight: 700;
    margin: 0 0 0.5rem;
    background: linear-gradient(90deg, $phoebe-gold, $phoebe-lilac-light);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 4px 30px rgba($phoebe-gold, 0.3);
  }

  .page-subtitle {
    color: rgba($phoebe-white, 0.7);
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    letter-spacing: 1px;
    margin: 0;
  }

  .title-sparkle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: $phoebe-white;
    opacity: 0;
    pointer-events: none;

    &:nth-child(1) {
      top: 20%;
      left: 15%;
    }
    &:nth-child(2) {
      top: 10%;
      right: 20%;
    }
    &:nth-child(3) {
      bottom: 30%;
      left: 25%;
    }
    &:nth-child(4) {
      bottom: 20%;
      right: 30%;
    }
    &:nth-child(5) {
      top: 50%;
      right: 15%;
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
    transform: scale(0.5) rotate(var(--sparkle-offset));
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(calc(var(--sparkle-offset) + 180deg));
  }
}

/* ==================== 鸣谢列表容器 ==================== */
.ack-list-wrapper {
  flex: 1;
  background: rgba($phoebe-blue-dark, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba($phoebe-gold, 0.15);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba($phoebe-white, 0.05), inset 0 1px 0 rgba($phoebe-white, 0.1);

  .list-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba($phoebe-white, 0.08);
    background: linear-gradient(
      90deg,
      rgba($phoebe-blue-light, 0.1) 0%,
      rgba($phoebe-lilac, 0.05) 100%
    );
    display: flex;
    align-items: center;
    gap: 1rem;

    .header-icon {
      color: $phoebe-gold;
      font-size: 1.2rem;
    }

    .header-text {
      flex: 1;
      color: $phoebe-white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .header-count {
      background: rgba($phoebe-blue-light, 0.2);
      color: $phoebe-blue-bright;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid rgba($phoebe-blue-light, 0.3);
    }
  }
}

/* ==================== 滚动容器 ==================== */
.ack-scroll-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba($phoebe-white, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, $phoebe-gold, $phoebe-lilac);
    border-radius: 4px;

    &:hover {
      background: linear-gradient(to bottom, $phoebe-lilac, $phoebe-gold);
    }
  }
}

/* ==================== 鸣谢项样式 ==================== */
.ack-list {
  list-style: none;
  padding: 0;
  margin: 0;

  .ack-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
    background: rgba($phoebe-white, 0.03);
    border-radius: 16px;
    border: 1px solid transparent;
    opacity: 0;
    transform: translateY(20px);
    animation: itemSlideIn 0.6s ease forwards;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    overflow: hidden;

    &:hover {
      background: rgba($phoebe-white, 0.05);
      border-color: rgba($phoebe-gold, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba($phoebe-gold, 0.1);

      .item-badge {
        transform: scale(1.1);

        .badge-glow {
          opacity: 0.8;
        }
      }

      .item-hover-glow {
        opacity: 0.3;
      }
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .item-badge {
    position: relative;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, $phoebe-blue-light, $phoebe-lilac);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;

    .badge-number {
      color: $phoebe-white;
      font-weight: 700;
      font-size: 1.1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 2;
    }

    .badge-glow {
      position: absolute;
      inset: -5px;
      border-radius: 16px;
      background: radial-gradient(
        circle,
        rgba($phoebe-lilac, 0.6) 0%,
        transparent 70%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1;
    }
  }

  .item-content {
    flex: 1;

    .item-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;

      .nickname {
        color: $phoebe-gold;
        font-weight: 700;
        font-size: 1.1rem;
        letter-spacing: 0.3px;
      }

      .contrib-role {
        background: rgba($phoebe-blue-light, 0.15);
        color: $phoebe-blue-bright;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        border: 1px solid rgba($phoebe-blue-light, 0.2);
      }
    }

    .suggestion-wrapper {
      position: relative;
      margin-bottom: 0.75rem;

      .quote-icon {
        color: rgba($phoebe-gold, 0.5);
        font-size: 1.5rem;
        line-height: 0;
        font-family: serif;

        &:first-child {
          margin-right: 0.5rem;
        }

        &:last-child {
          margin-left: 0.5rem;
        }
      }

      .suggestion {
        color: rgba($phoebe-white, 0.9);
        font-size: 1rem;
        line-height: 1.6;
      }
    }

  
  }

  .item-decor {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 1.5rem;
    display: flex;
    align-items: center;
    pointer-events: none;

    .decor-line {
      width: 2px;
      height: 100%;
      background: linear-gradient(
        to bottom,
        transparent,
        rgba($phoebe-gold, 0.3),
        transparent
      );
    }

    .decor-orb {
      position: absolute;
      top: 50%;
      left: -3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $phoebe-gold;
      transform: translateY(-50%);
    }
  }

  .item-hover-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      rgba($phoebe-gold, 0.1) 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
}

@keyframes itemSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


/* ==================== 空状态 ==================== */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;

  .empty-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    color: rgba($phoebe-white, 0.3);

    svg {
      width: 100%;
      height: 100%;
    }
  }

  h3 {
    color: $phoebe-gold;
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
  }

  p {
    color: rgba($phoebe-white, 0.6);
    font-size: 1rem;
    margin: 0;
  }
}




/* ==================== 页脚 ==================== */
.ack-footer {
  position: relative;
  margin-top: 3rem;
  padding: 2rem 0;
  background: rgba($phoebe-blue-deep, 0.8);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba($phoebe-gold, 0.1);

  .footer-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
  }

  .footer-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1rem;

    .footer-orb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: radial-gradient(circle, $phoebe-gold, $phoebe-lilac);
      filter: drop-shadow(0 0 10px rgba($phoebe-gold, 0.5));
      animation: corePulse 3s ease-in-out infinite;
    }

    .footer-text {
      color: $phoebe-gold;
      font-weight: 600;
      font-size: 1.1rem;
      letter-spacing: 0.5px;
    }
  }

  .footer-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .copyright {
      color: rgba($phoebe-white, 0.6);
      font-size: 0.9rem;
    }

    .blessing {
      color: rgba($phoebe-gold, 0.8);
      font-size: 0.85rem;
      font-style: italic;
    }
  }

  .footer-glow {
    position: absolute;
    top: -50px;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(
      to top,
      rgba($phoebe-lilac, 0.15) 0%,
      transparent 100%
    );
    filter: blur(20px);
    pointer-events: none;
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .ack-container {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem 0;
    margin-bottom: 2rem;

    .title-orb {
      width: 60px;
      height: 60px;
      margin-bottom: 1rem;

      .orb-core {
        width: 18px;
        height: 18px;
      }
    }
  }

  .ack-list-wrapper {
    border-radius: 16px;

    .list-header {
      padding: 1rem 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;

      .header-text {
        flex: none;
        width: 100%;
        order: 1;
        font-size: 1rem;
      }
    }
  }

  .ack-scroll-container {
    padding: 0.75rem;
    max-height: 50vh;
  }

  .ack-list {
    .ack-item {
      padding: 1.25rem;
      gap: 0.75rem;

      .item-badge {
        width: 36px;
        height: 36px;

        .badge-number {
          font-size: 1rem;
        }
      }

      .item-content {
        .item-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;

          .contrib-role {
            align-self: flex-start;
          }
        }
      }

      .item-decor {
        right: 0.75rem;
        display: none; /* 在小屏幕上隐藏装饰线 */
      }
    }
  }

  .list-footer {
    padding: 1rem 1.25rem;

    .stats {
      flex-direction: column;
      gap: 1rem;

      .stat-item {
        .stat-value {
          font-size: 1.5rem;
        }
      }
    }
  }

  .back-hint {
    right: 1rem;
    bottom: 1rem;
    padding: 0.6rem 1rem;

    span {
      display: none;
    }
  }

  .ack-footer {
    padding: 1.5rem 0;

    .footer-content {
      padding: 0 1rem;
    }
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem !important;
  }

  .page-subtitle {
    font-size: 0.85rem !important;
  }

  .ack-list {
    .ack-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;

      .item-badge {
        align-self: flex-start;
      }
    }
  }

  .empty-state {
    padding: 3rem 1rem;

    .empty-icon {
      width: 60px;
      height: 60px;
    }

    h3 {
      font-size: 1.3rem;
    }
  }
}
</style>