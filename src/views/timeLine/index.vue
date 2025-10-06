<template>
  <div class="megumi-page" aria-live="polite">
    <main class="container" ref="mainContainer">
      <!-- HERO -->
      <header class="hero" role="banner">


        <div class="left-col">
          <button class="avatar-card">
            <picture class="avatar-wrap">
              <img src="@/assets/images1/slty (5).webp" class="avatar" loading="lazy" decoding="async" />
            </picture>


          </button>


        </div>

        <div class="right-col" ref="metaCard">
          <div class="hero-panel">
            <h1 class="name">菲比 <span class="jp">（ 隐海修会的教士）</span></h1>

            <p class="subtitle">她是光明的回响，亦是温柔的信仰。</p>

            <p class="lead">
              友善虔诚、稳重得体。 恪守教义、自我约束的圣职者，仍然存有着为所爱之物欢欣雀跃的真挚之心。
            </p>
          </div>
        </div>
      </header>

      <!-- 其余内容保持原样 -->
      <section id="personality" class="card personality">
        <div class="card-head">
          <h2>核心机制</h2>
        </div>

        <ul class="traits">
          <li>
            菲比可以为敌人附加大量的debuff【光噪效应】，会根据层数给敌人持续伤害
          </li>
          <li>
            【福音】：血条上方的特殊能量条，3次常态攻击或闪避反击后，可以消耗【福音】施放一次特殊重击·星辉。星辉会在赦罪状态下打出更高伤害，在告解状态下附加5层【光噪效应】。
          </li>
          <li>
            【祈愿】：血条上方，【福音】下方的黄色能量条，每24秒可以充满一次，随后菲比可以选择重击进入赦罪状态（输出模式），或者长按E进入告解状态（辅助模式）。注意：【福音】未消耗完，无法进入上述状态。
          </li>
          <li>
            【镜之环】：菲比的共鸣技能，不存在【镜之环】时，短按E会在敌人脚下召唤【镜之环】并造成停滞和牵引，长按E会在自身脚下召唤【镜之环】。存在【镜之环】时，短按E菲比会传送进【镜之环】中。菲比在【镜之环】外，敌人在内时会造成额外伤害。菲比在【镜之环】内，会有更高的额外伤害。
          </li>

        </ul>

        <blockquote class="quote">
          主C打法：变奏入场-Z-E-Q-R-（A-A-A-Z）* 4
          <br>
          辅助打法：长按E-R-（A-A-A-Z）* 2-Q
          <br />(普攻--A，重击--Z，共鸣技能--E，共鸣解放--R，声骸--Q)
        </blockquote>
      </section>

      <section id="overview" class="card overview">
        <div class="card-head">
          <h2>配队</h2>
        </div>

        <div class="grid two-col">
          <div class="team">
            <h3>赞菲守</h3>
            <ul>
              <li><img src="@/assets/avatar/feibi.png" alt="" /></li>
              <li><img src="@/assets/avatar/zan_ni.png" alt="" /></li>
              <li><img src="@/assets/avatar/shouanren.webp" alt="" /></li>
            </ul>
          </div>

          <div class="team">
            <h3>赞菲光</h3>
            <ul>
              <li><img src="@/assets/avatar/feibi.png" alt="" /></li>
              <li><img src="@/assets/avatar/zan_ni.png" alt="" /></li>
              <li><img src="@/assets/avatar/man.png" alt="" /></li>
            </ul>
          </div>

          <div class="team">
            <h3>赞菲光</h3>
            <ul>
              <li><img src="@/assets/avatar/feibi.png" alt="" /></li>
              <li><img src="@/assets/avatar/zan_ni.png" alt="" /></li>
              <li><img src="@/assets/avatar/woman.png" alt="" /></li>
            </ul>
          </div>
        </div>
      </section>

      <section id="timeline" class="card timeline" aria-labelledby="timeline-heading">
        <div class="card-head">
          <h2 id="timeline-heading">共鸣链详解 · 提升</h2>
        </div>

        <div class="tl-wrap" role="list">
          <!-- 中心线（视觉） -->
          <div class="vl" aria-hidden="true"></div>

          <ol class="tl-list">
            <li v-for="(ev, i) in timeline" :key="i" class="tl-item" role="listitem" tabindex="0">
              <div class="tl-card">
                <h3 class="tl-title">
                  {{ ev.title }}
                  <span class="tl-meta" aria-hidden="true">(第 {{ i + 1 }} 链 )</span>
                </h3>
                <p class="tl-desc">{{ ev.desc }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
/* 你的脚本逻辑保持不变（我这里保留你原始的 onMounted/gsap/timeline 等） */
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const timeline = ref([
  {
    time: "7.58%",
    title: "暖灯与枕边的祝愿",
    desc: `赦罪状态下共鸣解放启明之誓愿伤害倍率提升效果从255%变为480%。
告解状态下共鸣解放启明之誓愿伤害倍率提升90%，并且附加【光噪效应】层数提升至目标可附加层数的上限。`,
  },
  {
    time: "26.3%",
    title: "泪水中飘摇的孤船",
    desc: `赦罪状态下，延奏技能对拥有【光噪效应】的目标伤害加深120%。
告解状态下，默祷的【光噪效应】伤害加深效果额外提升120%。`,
  },
  {
    time: "18.4%",
    title: "雏菊编织花环与梦",
    desc: `赦罪状态下，重击星辉伤害倍率提升91%。
告解状态下，重击星辉伤害倍率提升249%。`,
  },
  {
    time: "6.3%",
    title: "再次敲响振翅的钟声",
    desc: `普攻、普攻夏弥尔之星、闪避反击、夏弥尔之星·闪避反击命中目标时，目标衍射伤害抗性降低10%，持续30秒。`,
  },
  {
    time: "8.5%",
    title: "向遥远光辉虔声祈祷",
    desc: `施放变奏技能金色恩典时，菲比的衍射伤害加成提升12%，持续15秒。`,
  },
  {
    time: "87.5%",
    title: "于静寂窗边啁啾歌唱",
    desc: `【镜之环】的停滞效果增加2秒。【镜之环】持续期间，对每个进入【镜之环】的目标施加停滞效果；同一个【镜之环】最多可对12个目标施加停滞效果，且对每个目标只能施加一次。
赦罪状态、告解状态下，菲比施放共鸣技能召唤【镜之环】时，攻击提升10%，持续20秒，同时向【镜之环】位置附带一次重击星辉。此次重击星辉不消耗【福音】，不视为施放重击。`,
  },
]);

const reducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

onMounted(() => {
  if (!reducedMotion) {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".avatar-card", {
      duration: 0.8,
      y: 18,
      opacity: 0,
      scale: 0.99,
    }).from(
      ".right-col > .hero-panel .name",
      { duration: 0.9, x: 24, opacity: 0 },
      "-=0.45"
    );

    gsap.utils.toArray(".tl-item").forEach((it: any, idx: number) => {
      gsap.from(it.querySelector(".tl-card"), {
        scrollTrigger: {
          trigger: it,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 22,
        duration: 0.7,
        delay: idx * 0.06,
      });
    });


  } else {
    document.documentElement.classList.add("reduced-motion");
  }
});
</script>

<style scoped lang="scss">
/* ---------- 整体色调与背景 ---------- */
.megumi-page {
  position: relative;
  min-height: 100vh;

  background: linear-gradient(180deg, #fffaf5 0%, #fff0f0 40%, #a2d4ff 100%);
  font-family: "Noto Sans SC", system-ui, -apple-system, "Segoe UI", Roboto,
    Arial;
  color: #121417;
  /* 深色文字以保证可读性 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: clamp(18px, 4vw, 80px);
  box-sizing: border-box;
  padding-top: 60px;

  .container {
    position: relative;
    z-index: 10;
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(12px, 2vw, 40px);
  }

  &.reduced-motion * {
    transition: none !important;
    animation: none !important;
  }
}





/* ---------- HERO 布局（玻璃面板 + 花瓣装饰） ---------- */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 28px;
  align-items: start;
  padding: 12px;
  margin-bottom: 6px;



  .left-col {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: center;
  }

  .avatar-card {
    background: linear-gradient(180deg,
        rgba(255, 255, 255, 0.92),
        rgba(255, 248, 249, 0.86));
    border-radius: 16px;
    padding: 12px;
    display: grid;
    justify-items: center;
    gap: 8px;
    border: 1px solid rgba(158, 24, 32, 0.06);
    box-shadow: 0 22px 56px rgba(158, 24, 32, 0.06);
    cursor: pointer;

    width: 100%;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 30px 80px rgba(158, 24, 32, 0.11);
    }
  }

  .avatar-wrap {
    width: 100%;
    display: block;
  }

  .avatar {
    width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
    box-shadow: 0 12px 40px rgba(158, 24, 32, 0.06);
    border: 3px solid rgba(255, 255, 255, 0.9);
    transition: transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);

  }

  .avatar-card:hover .avatar {
    transform: translateY(-4px) scale(1.01);
  }





  .right-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* ---------- hero-panel（毛玻璃面板） ---------- */
  .hero-panel {
    position: relative;
    z-index: 9;
    padding: 18px;
    border-radius: 14px;
    background: linear-gradient(180deg,
        rgba(255, 245, 246, 0.62),
        rgba(255, 238, 240, 0.44));
    -webkit-backdrop-filter: blur(6px) saturate(120%);
    backdrop-filter: blur(6px) saturate(120%);
    border: 1px solid rgba(158, 24, 32, 0.08);
    box-shadow: 0 18px 50px rgba(20, 18, 20, 0.06);
  }

  .name {
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    margin: 0;

    background: linear-gradient(90deg, #e9c36a 0%, #f6de97 30%, #4a86ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    font-weight: 900;
    letter-spacing: 0.6px;
    display: inline-block;
    -webkit-text-stroke: 0.2px rgba(0, 0, 0, 0.06);
  }

  .jp {
    font-size: 0.95rem;
    color: #6f6f6f;
    margin-left: 8px;
    font-weight: 400;
  }

  .subtitle {
    margin: 6px 0 0;
    font-size: 1.02rem;
    color: #e9c36a;
    font-weight: 600;
    line-height: 1.4;
    
  }

  .lead {
    margin: 10px 0 0;
    color: #47525a;
    line-height: 1.7;
    max-width: 72ch;
  }
}

/* ---------- 卡片与通用元素微调 ---------- */
.card {
  margin-top: 22px;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.96),
      rgba(255, 248, 249, 0.94));
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 18px 44px rgba(20, 20, 30, 0.06);
  backdrop-filter: blur(4px);
  color: #222;
  border: 1px solid rgba(220, 200, 205, 0.5);

  h2 {
    margin: 0 0 8px 0;
    font-size: 1.12rem;
    color: #111315;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .btn {
    padding: 8px 12px;
    border-radius: 10px;
    border: none;
    background: #ffffff;
    box-shadow: 0 8px 22px rgba(20, 20, 30, 0.04);
    cursor: pointer;
    font-weight: 600;
  }
}

/* personality */
.personality .traits li {
  padding: 12px 0;
  border-bottom: 1px dashed rgba(243, 183, 201, 0.12);
  font-size: 1rem;
  color: #333;
}

.quote {
  margin-top: 12px;
  padding: 12px 14px;
  border-left: 4px solid #ffd580;
  background: linear-gradient(90deg, rgba(243, 183, 201, 0.04), transparent);
  color: #4f4f4f;
  border-radius: 6px;
}

/* overview 配队 */
.overview .two-col {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 8px;
}

.team ul {
  display: flex;
  gap: 8px;
  padding: 6px 0;
}

.team li img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

/* timeline */
/* timeline（椿风格改版） */
.timeline {
  position: relative;

  .tl-wrap {
    position: relative;
    padding: 18px 6px 8px 86px;
    /* 左侧留给标记与中线 */
  }

  /* 中心竖线：带渐变与花瓣光晕 */
  .vl {
    position: absolute;
    left: 72px;
    top: 28px;
    bottom: 20px;
    width: 4px;
    border-radius: 6px;
    background: linear-gradient(180deg,
        rgba(158, 24, 32, 0.08),
        rgba(255, 123, 144, 0.06) 50%,
        rgba(158, 24, 32, 0.04));
    box-shadow: 0 6px 18px rgba(158, 24, 32, 0.03),
      inset 0 0 10px rgba(255, 255, 255, 0.02);
    z-index: 1;
    opacity: 0.95;
  }

  .tl-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .tl-item {
    position: relative;
    display: flex;
    gap: 18px;
    align-items: flex-start;
    margin: 18px 0;
    z-index: 2;
    transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.28s;

  }

  .tl-card {
    background: linear-gradient(180deg,
        rgba(255, 255, 255, 0.99),
        rgb(255, 253, 248));
    border-radius: 12px;
    padding: 14px 18px;
    box-shadow: 0 12px 36px rgba(20, 20, 30, 0.04);
    width: calc(100% - 120px);
    /* 留出左侧空间 */
    border-left: 4px solid transparent;
    transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.28s,
      border-color 0.28s;
    position: relative;
    z-index: 2;
  }

  .tl-item:hover .tl-card,
  .tl-item:focus-within .tl-card {
    transform: translateY(-8px);
    box-shadow: 0 24px 60px rgba(122, 158, 24, 0.08);
    border-left-color: rgba(158, 24, 32, 0.12);
  }

  .tl-title {
    margin: 0 0 6px 0;
    font-size: 1.02rem;
    color: #111115;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .tl-meta {
    color: #e9c36a;
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.95;
  }

  .tl-desc {
    margin: 0;
    color: #444;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  /* small screens: 标记移到卡片顶部，节省空间 */
  @media (max-width: 980px) {
    .tl-wrap {
      padding-left: 14px;
    }

    .vl {
      display: none;
    }

    .tl-item {
      display: block;
      margin: 14px 0;
    }

    .tl-card {
      width: 100%;
      padding: 12px;
      border-left: 0;
    }

    .tl-item:hover .tl-card {
      transform: none;
      box-shadow: 0 10px 30px rgba(20, 20, 30, 0.04);
    }
  }
}

/* ---------- 响应式调整（移动端优化） ---------- */
@media (max-width: 980px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 8px;
  }

  .hero .left-col {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .avatar-card {
    width: 120px;
    padding: 8px;
  }

  .avatar {
    border-radius: 10px;
  }





  .hero .hero-panel {
    padding: 14px;
  }

  .card {
    padding: 14px;
    border-radius: 12px;
  }

  .name {
    font-size: 1.6rem;
  }

  .subtitle {
    font-size: 0.98rem;
  }

  .lead {
    font-size: 0.95rem;
    max-width: 100%;
  }
}

/* 小无障碍与触摸优化 */
.avatar-card,
.btn {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.06);
}
</style>
