<template>
  <div class="feibi-page">
    <div class="top-space"></div>

    <div class="hero">
      <div class="hero-inner">
 

        <div class="hero-right">
          <header class="title-block">
            <h1 class="title">菲比的祈福殿</h1>
            <p class="subtitle">在这里，菲比为你书写今日的吉言与温柔指引</p>
          </header>

          <main class="center-card">
            <div
              class="card"
              :class="{ busy: isAnimating, revealed: !!result }"
            >
              <div class="card-front">
                <div class="front-content">
                  <div class="star">✦</div>
                  <h2 class="card-title">向菲比许愿</h2>
                  <p class="card-desc">每日一次祈福 · 获得占卜签文与贴心建议</p>
                  <button
                    class="btn-pray"
                    :disabled="isAnimating || !dailyAvailable"
                    @click="prayOnce"
                  >
                    <span class="btn-label">{{
                      dailyAvailable ? "祈 福" : "今日已祈福"
                    }}</span>
                    <span class="btn-glow" aria-hidden></span>
                  </button>
                </div>
              </div>

              <transition name="reveal" mode="out-in">
                <div class="card-back" v-if="result">
                  <div class="back-content">
                    <div class="back-header">
                      <span
                        class="badge"
                        :class="result.rarity.toLowerCase()"
                        >{{ result.rarity }}</span
                      >
                      <div class="sign">{{ result.name }}</div>
                    </div>

                    <div class="back-body">
                      <p class="fortune" v-html="typedText"></p>

                      <div class="detail-grid">
                        <div class="detail">
                          <strong>建议</strong>
                          <div>{{ result.advice }}</div>
                        </div>
                        <div class="detail">
                          <strong>幸运物</strong>
                          <div>{{ result.luckyItem }}</div>
                        </div>
                        <div class="detail">
                          <strong>幸运色</strong>
                          <div class="color-wrap">
                            <span
                              class="color-sample"
                              :style="{ background: result.luckyColor }"
                            ></span>
                          </div>
                        </div>
                        <div class="detail">
                          <strong>幸运数</strong>
                          <div>{{ result.luckyNumber }}</div>
                        </div>
                      </div>

                      <div class="poem" v-if="result.poem">
                        <em>“{{ result.poem }}”</em>
                        <div class="poem-title">— {{ result.poemTitle }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <div class="ornaments" aria-hidden>
              <span class="glow large"></span>
              <span class="glow medium"></span>
              <span class="sparkles"></span>
            </div>
          </main>
        </div>
      </div>
    </div>

    <footer class="page-foot">菲比轻声：愿你今日温柔以待自己 ✨</footer>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";

const dailyAvailable = ref(true);
const isAnimating = ref(false);
const result = ref(null);
const typedText = ref("");

// 扩充的菲比风格签文库（颜色写死为 hex，幸运色仅用于色块）
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

function weightedPick(list) {
  const sum = list.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * sum;
  for (const it of list) {
    if (r < it.weight) return it;
    r -= it.weight;
  }
  return list[list.length - 1];
}

let typer = null;
async function prayOnce() {
  if (!dailyAvailable.value || isAnimating.value) return;
  isAnimating.value = true;
  result.value = null;
  typedText.value = "";

  // 微动画前奏
  await new Promise((r) => setTimeout(r, 500));
  const pick = weightedPick(prayers);
  result.value = Object.assign({}, pick);

  await nextTick();
  // 打字机逐字显示
  const full = result.value.text;
  let i = 0;
  clearInterval(typer);
  typer = setInterval(() => {
    i++;
    typedText.value = full.slice(0, i);
    if (i >= full.length) clearInterval(typer);
  }, 26);

  // 完成揭示
  setTimeout(() => {
    isAnimating.value = false;
    dailyAvailable.value = false;
  }, 800);
}
</script>

<style scoped lang="scss">
/* 字体与配色优化（颜色写死，字体样式加强，避免纯黑） */
.feibi-page {
  font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial,
    sans-serif;
  color: #2b4162; /* 主文本：深海蓝，避免纯黑 */
  background: radial-gradient(
      1200px 400px at 12% 12%,
      rgba(124, 196, 255, 0.06),
      transparent
    ),
    linear-gradient(180deg, #fffdfb 0%, #f6fbff 100%);
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 36px;

  .top-space {
    height: 80px;
  }

  .hero {
    width: 100%;
    max-width: 1400px;
  }

  .hero-inner {
    display: flex;
    gap: 40px;
    align-items: stretch;
    padding: 24px;
    box-sizing: border-box;
  }


  .hero-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .title-block {
      margin-bottom: 18px;
    }
    .title {
      font-size: 2.6rem;
      margin: 0;
      color: #2b4162;
      font-weight: 900;
      letter-spacing: 0.6px;
    }
    .subtitle {
      margin: 6px 0 0 0;
      color: #6b6272;
      font-size: 1rem;
    }

    .center-card {
      margin-top: 12px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      .card {
        width: 100%;
        max-width: 820px;
        border-radius: 18px;
        overflow: visible;
        transition: transform 0.36s ease;
        border: 1px solid rgba(200, 180, 140, 0.06);
        background: linear-gradient(180deg, #ffffff, #fefeff);
        box-shadow: 0 40px 120px rgba(60, 80, 120, 0.06);
        padding: 28px;
        position: relative;

        &.busy {
          transform: translateY(-6px) scale(1.01);
        }
        &.revealed {
          animation: card-pop 0.6s ease both;
        }

        .card-front {
          text-align: center;
          .front-content {
            .star {
              font-size: 2rem;
              color: #ffd166;
            }
            .card-title {
              font-size: 1.6rem;
              color: #2b4162;
              margin-top: 6px;
              font-weight: 900;
              letter-spacing: 0.5px;
            }
            .card-desc {
              color: #6f6375;
              margin-top: 8px;
              font-size: 1rem;
            }
            .btn-pray {
              margin-top: 18px;
              position: relative;
              overflow: visible;
              background: linear-gradient(90deg, #ffd166 0%, #7cc4ff 100%);
              border: none;
              padding: 14px 28px;
              color: #1b2430;
              border-radius: 999px;
              font-weight: 900;
              cursor: pointer;
              box-shadow: 0 24px 60px rgba(60, 120, 200, 0.12);
              font-size: 1.05rem;
              transition: transform 0.18s ease;
              &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }
              .btn-glow {
                position: absolute;
                inset: 0;
                border-radius: 999px;
                pointer-events: none;
                box-shadow: 0 0 40px rgba(255, 209, 102, 0.25);
                opacity: 0.9;
              }
              .btn-pray:active {
                transform: translateY(2px);
              }
            }
          }
        }

        .card-back {
          margin-top: 6px;
          .back-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            .back-header {
              display: flex;
              gap: 14px;
              align-items: center;
              margin-bottom: 12px;
              .badge {
                padding: 10px 14px;
                border-radius: 999px;
                font-weight: 900;
                margin-right: 6px;
                &.SSR,
                &.ssr {
                  background: linear-gradient(90deg, #ffd166 0%, #ffb347 100%);
                  color: #2b1600;
                }
                &.SR,
                &.sr {
                  background: linear-gradient(90deg, #d0e8ff 0%, #bee7ff 100%);
                  color: #2b4162;
                }
                &.R,
                &.r {
                  background: linear-gradient(90deg, #f2f9ff 0%, #eaf7ff 100%);
                  color: #1b3b2a;
                }
              }
              .sign {
                font-weight: 900;
                font-size: 1.5rem;
                color: #2b4162;
              }
            }

            .back-body {
              width: 100%;
              max-width: 760px;
              .fortune {
                min-height: 54px;
                line-height: 1.8;
                color: #2f2336;
                font-size: 1.05rem;
                margin-bottom: 12px;
              }
              .detail-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                .detail {
                  background: #ffffff;
                  padding: 12px;
                  border-radius: 10px;
                  border: 1px solid rgba(200, 180, 140, 0.04);
                  strong {
                    display: block;
                    margin-bottom: 6px;
                    color: #2b4162;
                  }
                  .color-wrap {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                  }
                  .color-sample {
                    width: 22px;
                    height: 22px;
                    border-radius: 6px;
                    box-shadow: 0 4px 10px rgba(60, 80, 120, 0.06);
                  }
                }
                .poem {
                  margin-top: 14px;
                  color: #6a5a6f;
                  font-style: italic;
                  text-align: center;
                }
              }
            }
          }
        }

        .ornaments {
          position: absolute;
          inset: auto -40px auto auto;
          pointer-events: none;
          .glow {
            display: block;
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: radial-gradient(
              circle at 30% 30%,
              rgba(255, 209, 102, 0.16),
              rgba(124, 196, 255, 0.06)
            );
            filter: blur(34px);
            &.medium {
              width: 140px;
              height: 140px;
              top: 40px;
            }
          }
          .sparkles {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background-image: radial-gradient(
                circle at 10% 10%,
                rgba(255, 255, 255, 0.9) 0px,
                transparent 6px
              ),
              radial-gradient(
                circle at 40% 30%,
                rgba(255, 255, 255, 0.6) 0px,
                transparent 6px
              );
            opacity: 0.25;
            mix-blend-mode: screen;
          }
        }
      }
    }

    .page-foot {
      margin-top: 30px;
      color: #7a6f7f;
    }
  }

  /* 动效 */
  @keyframes drift {
    0% {
      transform: translateY(-6px) rotate(0deg);
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    100% {
      transform: translateY(110vh) rotate(540deg);
      opacity: 0;
    }
  }
  @keyframes card-pop {
    0% {
      transform: scale(0.96);
      opacity: 0;
    }
    60% {
      transform: scale(1.02);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }

  /* reveal transition */
  .reveal-enter-active,
  .reveal-leave-active {
    transition: all 0.5s cubic-bezier(0.2, 0.9, 0.28, 1);
  }
  .reveal-enter-from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  .reveal-enter-to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  /* 移动端适配 */
  @media (max-width: 920px) {
    .feibi-page .hero-inner {
      flex-direction: column;
      gap: 18px;
    }

    .feibi-page .title {
      font-size: 1.6rem;
    }
    .feibi-page .card {
      padding: 18px;
    }
    .feibi-page .center-card .card-back .back-body .detail-grid {
      grid-template-columns: 1fr;
    }
    .feibi-page .ornaments {
      display: none;
    }
  }
}
</style>
