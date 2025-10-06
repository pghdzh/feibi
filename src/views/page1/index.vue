<template>
    <main class="home">
        <canvas ref="canvasEl" class="rose-canvas"></canvas>
        <!-- 背景轮播放在最底层 -->
        <div class="carousel carousel1">
            <img v-for="(src, idx) in randomFive" :key="idx" :src="src" class="carousel-image"
                :class="{ active: idx === currentIndex }" />
        </div>
        <div class="carousel carousel2">
            <img v-for="(src, idx) in randomFive2" :key="idx" :src="src" class="carousel-image"
                :class="{ active: idx === currentIndex }" />
        </div>
        <section class="center" role="main">
            <h1 class="title">圣祈凝辉 · 菲比</h1>

            <div class="subtitle" aria-live="polite">
                <span class="typed">{{ typed }}</span><span class="cursor" aria-hidden="true">|</span>
            </div>

        </section>
        <footer class="phoebe-footer-simple" role="contentinfo" aria-label="站点页脚">
            <div class="light-strip" aria-hidden="true"></div>

            <div class="footer-inner">

                <p class="wish" aria-live="polite">愿那束你仰望的光，终有一日从你心中升起</p>

                <p class="copyright">© 2025 菲比设定集 · 霜落天亦</p>
            </div>
        </footer>
    </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import violet from '@/assets/violet.png'



const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D
let animationId: number
let lastTime = 0
let elapsed = 0

interface Rose {
    baseX: number
    y: number
    size: number
    speed: number
    swayAmp: number
    swayFreq: number
    phase: number
    angle: number
    angularSpeed: number
}

const roses: Rose[] = []
const ROSE_COUNT_DESKTOP = 20
const ROSE_COUNT_MOBILE = 8
const ROSE_IMG = new Image()
ROSE_IMG.src = violet

function initRoses(count: number) {
    roses.length = 0
    const canvas = canvasEl.value!
    const w = canvas.width / (window.devicePixelRatio || 1)
    const h = canvas.height / (window.devicePixelRatio || 1)

    for (let i = 0; i < count; i++) {
        const baseX = Math.random() * w
        roses.push({
            baseX,
            y: Math.random() * -h,
            size: 30 + Math.random() * 40,
            speed: 30 + Math.random() * 70,
            swayAmp: 20 + Math.random() * 20,
            swayFreq: 0.5 + Math.random() * 1,
            phase: Math.random() * Math.PI * 2,
            angle: Math.random() * Math.PI * 2,
            angularSpeed: (Math.random() - 0.5) * 2
        })
    }
    elapsed = 0
}

let resizeTimeout: number
function resizeCanvas() {
    window.clearTimeout(resizeTimeout)
    resizeTimeout = window.setTimeout(() => {
        cancelAnimationFrame(animationId)
        const canvas = canvasEl.value!
        const parent = canvas.parentElement!
        const dpr = window.devicePixelRatio || 1
        const w = parent.clientWidth
        const h = parent.clientHeight

        canvas.style.width = w + 'px'
        canvas.style.height = h + 'px'
        canvas.width = w * dpr
        canvas.height = h * dpr

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(dpr, dpr)

        const isMobile = w < 768
        initRoses(isMobile ? ROSE_COUNT_MOBILE : ROSE_COUNT_DESKTOP)
        lastTime = 0
        animationId = requestAnimationFrame(tickCanvas)
    }, 200)
}

function tickCanvas(now: number) {
    if (!lastTime) lastTime = now
    const dt = (now - lastTime) / 1000
    lastTime = now
    elapsed += dt

    const canvas = canvasEl.value!
    const w = canvas.clientWidth
    const h = canvas.clientHeight

    ctx.clearRect(0, 0, w, h)

    roses.forEach(r => {
        r.y += r.speed * dt
        const sway = r.swayAmp * Math.sin(r.phase + elapsed * r.swayFreq)
        const x = r.baseX + sway
        r.angle += r.angularSpeed * dt

        if (r.y > h + r.size) {
            r.y = -r.size
            r.baseX = Math.random() * w
            r.phase = Math.random() * Math.PI * 2
        }

        if (x > w + r.size || x < -r.size) return


        // 计算透明度
        const alpha = 1 - (r.y / h) * 0.5;
        // 限制 alpha 在 [0,1] 之间（可选）
        const clampedAlpha = Math.max(0, Math.min(1, alpha));
        ctx.save()
        ctx.globalAlpha = clampedAlpha;
        ctx.translate(x, r.y)
        ctx.rotate(r.angle)
        ctx.drawImage(ROSE_IMG, -r.size / 2, -r.size / 2, r.size, r.size)
        ctx.restore()
    })

    animationId = requestAnimationFrame(tickCanvas)
}




// 固定要循环的副标题句子（写死）
const lines = [
    '光下的誓言，花间的祈愿。',
    '花影与圣光，共谱一段温柔史诗。',
    '包裹着金弦与蓝光的记忆之册。',
    '暖灯与枕边的祝愿 ',
    '泪水中飘摇的孤船',
    '雏菊编织花环与梦',
    '再次敲响振翅的钟声',
    '向遥远光辉虔声祈祷',
    '于静寂窗边啁啾歌唱',
];

const typed = ref('');
let lineIndex = 0;
let charIndex = 0;
let deleting = false;
let timer: number | null = null;

const TYPING = 200;     // 打字速度（ms/字符）
const DELETING = 35;   // 删除速度
const PAUSE = 1000;    // 完成后停留时间

function tick() {
    const cur = lines[lineIndex];
    if (!deleting) {
        typed.value = cur.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex >= cur.length) {
            timer = window.setTimeout(() => { deleting = true; tick(); }, PAUSE);
            return;
        }
        timer = window.setTimeout(tick, TYPING);
    } else {
        typed.value = cur.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex <= 0) {
            deleting = false;
            lineIndex = (lineIndex + 1) % lines.length;
            timer = window.setTimeout(tick, 300);
            return;
        }
        timer = window.setTimeout(tick, DELETING);
    }
}



// 1. 全量导入横图，直接映射成 string[]
const modules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", {
    eager: true,
});
const allSrcs: string[] = Object.values(modules).map((mod: any) => mod.default);

// 1. 全量导入竖图，直接映射成 string[]
const modules2 = import.meta.glob("@/assets/images2/*.{jpg,png,jpeg,webp}", {
    eager: true,
});
const allSrcs2: string[] = Object.values(modules2).map((mod: any) => mod.default);

// 2. 洗牌并取 5 张
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
let Imgtimer: number;


onMounted(() => {
    timer = window.setTimeout(tick, 500);
    Imgtimer = window.setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % 5;
    }, 5000);

    const canvas = canvasEl.value!
    ctx = canvas.getContext('2d')!

    ROSE_IMG.onload = () => {
        resizeCanvas()
    }
    window.addEventListener('resize', resizeCanvas)
});

onBeforeUnmount(() => {
    clearInterval(Imgtimer);
    if (timer) window.clearTimeout(timer);

    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resizeCanvas)
});

</script>

<style lang="scss" scoped>
/* 固定配色（写死） */
$bg-dark: #05060a;
$ice-blue: #bff7ff;
$neon-pink: #ff66c4;
$violet: #7a39ff;
$gold: #ffd580;
$text: #eef6fb;

.home {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #05060a;
    color: $text;
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Noto Sans CJK SC', sans-serif;

    .rose-canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
    }

    .carousel {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;

        &::before {
            content: "";
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.2);
            pointer-events: none;
            z-index: 1;
        }

        .carousel-image {
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 1s ease;
            filter: blur(1px);

            &.active {
                opacity: 1;
            }
        }
    }


    .carousel2 {
        display: none;
    }

}

.center {
    position: relative; // 新增：为绝对定位的 ::before 做参照
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px 18px;
    gap: 18px;




    .title {
        z-index: 9;
        font-size: 3rem;
        margin: 0;
        font-weight: 800;
        line-height: 1;
        /* 珍珠白 -> 圣蓝 -> 金色 */
        background: linear-gradient(90deg, #f7fbff 0%, #4a86ff 45%, #e9c36a 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        /* 柔和蓝色光晕 */
        text-shadow: 0 10px 40px rgba(74, 134, 255, 0.08);
    }

    .subtitle {
        font-size: 1.25rem;
        min-height: 1.6em; // 保证高度稳定
        color: #d9ecff;
        /* 浅蓝，柔和可读 */
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        z-index: 9;

        .typed {
            display: inline-block;
            white-space: nowrap;
            letter-spacing: 0.6px;
            font-weight: 600;
            /* 稍微提亮使文字更清晰 */
            color: #eaf6ff;
        }

        .cursor {
            display: inline-block;
            width: 10px;
            height: 1.05em;
            margin-left: 4px;
            /* 浅蓝 -> 紫罗兰 高光（呼应菲比眼色）*/
            background: linear-gradient(180deg, #97c4ff 0%, #b97fe0 100%);
            border-radius: 2px;
            animation: blink 1s steps(1) infinite;
        }
    }


}



@keyframes blink {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.phoebe-footer-simple {
    position: relative;
    padding: 28px 16px;
    /* 写死的渐变背景（深海 -> 紫灰） */
    background: linear-gradient(180deg, #0b1220 0%, #251631 100%);
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    overflow: hidden;

    .light-strip {
        position: absolute;
        top: 6px;
        left: 10%;
        right: 10%;
        height: 3px;
        /* 写死的高光色（圣蓝）*/
        background: linear-gradient(90deg, rgba(74, 134, 255, 0) 0%, rgba(74, 134, 255, 0.9) 50%, rgba(74, 134, 255, 0) 100%);
        filter: blur(6px);
        opacity: 0.9;
        pointer-events: none;
        border-radius: 4px;
        animation: flowMove 6s linear infinite;
    }

    .footer-inner {
        position: relative;
        z-index: 2;
        max-width: 980px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }


    .wish {
        margin: 0;
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.92);
        max-width: 760px;
        line-height: 1.45;
        padding: 0 8px;
        opacity: 0.95;
        animation: subtlePulse 5s ease-in-out infinite;
    }

    .copyright {
        margin: 0;
        font-size: 0.82rem;
        color: rgba(255, 245, 250, 0.6);
        background: linear-gradient(90deg, #e9c36a 0%, #f6de97 30%, #4a86ff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        letter-spacing: .3px;
    }

    @media (max-width: 520px) {
        padding: 20px 12px;

        .brand {
            .brand-name {
                font-size: 0.95rem;
            }

            .brand-badge {
                width: 32px;
                height: 32px;
            }
        }

        .wish {
            font-size: 0.92rem;
            padding: 0 6px;
        }
    }

    /* 动画 keyframes（写死颜色） */
    @keyframes flowMove {
        0% {
            transform: translateX(-40%);
        }

        100% {
            transform: translateX(40%);
        }
    }



    @keyframes subtlePulse {

        0%,
        100% {
            opacity: 0.95;
            filter: none;
        }

        50% {
            opacity: 1;
            filter: drop-shadow(0 6px 18px rgba(74, 134, 255, 0.03));
        }
    }
}

@media (max-width: 720px) {
    .home {
        .carousel1 {
            display: none;
        }

        .carousel2 {
            display: block;
        }
    }

    .center {
        padding: 20px 14px;

        .title {
            font-size: 1.5rem;
        }

        .subtitle {
            font-size: 0.98rem;
        }
    }


}
</style>
