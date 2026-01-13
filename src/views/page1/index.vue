<template>
    <main class="home">
        <!-- 玫瑰花瓣背景动画 -->
        <canvas ref="canvasEl" class="rose-canvas" aria-hidden="true"></canvas>
        
        <!-- 背景轮播图 - 根据屏幕方向显示 -->
        <div class="carousel carousel-horizontal">
            <img v-for="(src, idx) in randomFive" :key="`h-${idx}`" :src="src" class="carousel-image"
                :class="{ active: idx === currentIndex }" alt="菲比横版插画" />
        </div>
        <div class="carousel carousel-vertical">
            <img v-for="(src, idx) in randomFive2" :key="`v-${idx}`" :src="src" class="carousel-image"
                :class="{ active: idx === currentIndex }" alt="菲比竖版插画" />
        </div>
        
        <!-- 主内容区 -->
        <section class="center" role="main">
            <div class="title-container">
                <div class="title-decoration">
                    <div class="decoration-left"></div>
                    <div class="decoration-center">
                        <span class="icon-star">✦</span>
                    </div>
                    <div class="decoration-right"></div>
                </div>
                
                <h1 class="title">
                    <span class="title-text">圣祈凝辉</span>
                    <span class="title-sub">· 菲比 ·</span>
                </h1>
                
                <div class="title-decoration reverse">
                    <div class="decoration-left"></div>
                    <div class="decoration-center">
                        <span class="icon-star">✦</span>
                    </div>
                    <div class="decoration-right"></div>
                </div>
            </div>

            <div class="subtitle-container" aria-live="polite">
                <div class="subtitle-icon">
                    <span class="icon-quote">❝</span>
                </div>
                <div class="subtitle">
                    <span class="typed">{{ typed }}</span>
                    <span class="cursor" aria-hidden="true"></span>
                </div>
                <div class="subtitle-icon">
                    <span class="icon-quote">❞</span>
                </div>
            </div>
            
            <!-- <div class="character-info">
                <div class="info-item">
                    <span class="info-label">声潮</span>
                    <span class="info-value">鸣潮</span>
                </div>
                <div class="info-item">
                    <span class="info-label">职责</span>
                    <span class="info-value">圣祈者</span>
                </div>
                <div class="info-item">
                    <span class="info-label">属性</span>
                    <span class="info-value">光</span>
                </div>
            </div> -->
        </section>
        
        <!-- 页脚 -->
        <footer class="phoebe-footer" role="contentinfo" aria-label="站点页脚">
            <div class="light-strip" aria-hidden="true"></div>
            
            <div class="footer-inner">
            
                
                <p class="wish" aria-live="polite">
                    愿那束你仰望的光，终有一日从你心中升起
                </p>
                
                <div class="footer-divider"></div>
                
                <p class="copyright">
                    © 2026 菲比设定集 · 霜落天亦
                </p>
            </div>
        </footer>
        
        <!-- 装饰元素 -->
        <div class="floating-element floating-element-1"></div>
        <div class="floating-element floating-element-2"></div>
        <div class="floating-element floating-element-3"></div>
    </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import violet from '@/assets/violet.png';

// Canvas玫瑰花瓣动画
const canvasEl = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D;
let animationId: number;
let lastTime = 0;
let elapsed = 0;

interface Rose {
    baseX: number;
    y: number;
    size: number;
    speed: number;
    swayAmp: number;
    swayFreq: number;
    phase: number;
    angle: number;
    angularSpeed: number;
    alpha: number;
    alphaSpeed: number;
}

const roses: Rose[] = [];
const ROSE_COUNT_DESKTOP = 25;
const ROSE_COUNT_MOBILE = 12;
const ROSE_IMG = new Image();
ROSE_IMG.src = violet;

function initRoses(count: number) {
    roses.length = 0;
    const canvas = canvasEl.value!;
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    for (let i = 0; i < count; i++) {
        const baseX = Math.random() * w;
        const size = 25 + Math.random() * 50;
        roses.push({
            baseX,
            y: Math.random() * -h - size, // 从上方开始
            size,
            speed: 20 + Math.random() * 60,
            swayAmp: 15 + Math.random() * 25,
            swayFreq: 0.3 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            angle: Math.random() * Math.PI * 2,
            angularSpeed: (Math.random() - 0.5) * 1.5,
            alpha: 0.3 + Math.random() * 0.7,
            alphaSpeed: (Math.random() - 0.5) * 0.5
        });
    }
    elapsed = 0;
}

let resizeTimeout: number;
function resizeCanvas() {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
        cancelAnimationFrame(animationId);
        const canvas = canvasEl.value!;
        const parent = canvas.parentElement!;
        const dpr = window.devicePixelRatio || 1;
        const w = parent.clientWidth;
        const h = parent.clientHeight;

        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = w * dpr;
        canvas.height = h * dpr;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const isMobile = w < 768;
        initRoses(isMobile ? ROSE_COUNT_MOBILE : ROSE_COUNT_DESKTOP);
        lastTime = 0;
        animationId = requestAnimationFrame(tickCanvas);
    }, 200);
}

function tickCanvas(now: number) {
    if (!lastTime) lastTime = now;
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    elapsed += dt;

    const canvas = canvasEl.value!;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    roses.forEach(r => {
        r.y += r.speed * dt;
        const sway = r.swayAmp * Math.sin(r.phase + elapsed * r.swayFreq);
        const x = r.baseX + sway;
        r.angle += r.angularSpeed * dt;
        r.alpha += r.alphaSpeed * dt * 0.1;
        r.alpha = Math.max(0.2, Math.min(0.9, r.alpha));

        if (r.y > h + r.size) {
            r.y = -r.size;
            r.baseX = Math.random() * w;
            r.phase = Math.random() * Math.PI * 2;
            r.alpha = 0.3 + Math.random() * 0.7;
        }

        if (x > w + r.size || x < -r.size) return;

        const yAlpha = 1 - (r.y / h) * 0.5;
        const clampedAlpha = Math.max(0.2, Math.min(0.9, r.alpha * yAlpha));
        
        ctx.save();
        ctx.globalAlpha = clampedAlpha;
        ctx.translate(x, r.y);
        ctx.rotate(r.angle);
        
        // 添加花瓣光晕效果
        ctx.shadowColor = '#b97fe0';
        ctx.shadowBlur = 8;
        ctx.drawImage(ROSE_IMG, -r.size / 2, -r.size / 2, r.size, r.size);
        ctx.restore();
    });

    animationId = requestAnimationFrame(tickCanvas);
}

// 打字机效果
const lines = [
    '光下的誓言，花间的祈愿。',
    '花影与圣光，共谱一段温柔史诗。',
    '包裹着金弦与蓝光的记忆之册。',
    '暖灯与枕边的祝愿',
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

const TYPING = 150;     // 打字速度（ms/字符）
const DELETING = 40;   // 删除速度
const PAUSE = 1200;    // 完成后停留时间

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

// 图片轮播逻辑
const modules = import.meta.glob("@/assets/images1/*.{jpg,png,jpeg,webp}", {
    eager: true,
});
const allSrcs: string[] = Object.values(modules).map((mod: any) => mod.default);

const modules2 = import.meta.glob("@/assets/images2/*.{jpg,png,jpeg,webp}", {
    eager: true,
});
const allSrcs2: string[] = Object.values(modules2).map((mod: any) => mod.default);

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
    // 启动打字机效果
    timer = window.setTimeout(tick, 800);
    
    // 启动图片轮播
    Imgtimer = window.setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % 5;
    }, 5000);
    
    // 启动Canvas动画
    const canvas = canvasEl.value!;
    ctx = canvas.getContext('2d')!;
    
    ROSE_IMG.onload = () => {
        resizeCanvas();
    };
    window.addEventListener('resize', resizeCanvas);
    
    // 添加悬浮元素动画
    animateFloatingElements();
});

onBeforeUnmount(() => {
    clearInterval(Imgtimer);
    if (timer) window.clearTimeout(timer);
    
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resizeCanvas);
});

// 悬浮元素动画
function animateFloatingElements() {
    const elements = document.querySelectorAll('.floating-element');
    elements.forEach((el, index) => {
        const elm = el as HTMLElement;
        const duration = 8 + index * 2; // 每个元素不同速度
        const delay = index * 1.5;
        
        elm.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });
}
</script>

<style lang="scss" scoped>
/* 菲比风格配色变量 */
$phoebe-gold: #f6de97;
$phoebe-gold-light: #fff9e6;
$phoebe-blue-dark: #0c1e3a;
$phoebe-blue-deep: #07122b;
$phoebe-blue-light: #3b7be0;
$phoebe-blue-bright: #6aa7ff;

$phoebe-white: #fafcfd;
$phoebe-white-trans: rgba(250, 252, 253, 0.95);

/* 主容器 */
.home {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(135deg, $phoebe-blue-deep 0%, $phoebe-blue-dark 50%, rgba($phoebe-blue-dark, 5%) 100%);
    color: $phoebe-white;
    font-family: 'Noto Sans SC', 'Segoe UI', system-ui, -apple-system, sans-serif;
    position: relative;
    overflow: hidden;
    
    /* 玫瑰花瓣Canvas */
    .rose-canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
        width: 100%;
        height: 100%;
    }
    
    /* 背景轮播图 */
    .carousel {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        
        &::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to bottom,
                rgba($phoebe-blue-deep, 0.7) 0%,
                rgba($phoebe-blue-deep, 0.3) 50%,
                rgba($phoebe-blue-dark, 0.8) 100%
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
            filter: blur(2px) brightness(0.7);
            transform: scale(1.05);
            
            &.active {
                opacity: 0.5;
                filter: blur(0) brightness(0.8);
                transform: scale(1);
            }
        }
    }
    
    /* 横版图片容器 */
    .carousel-horizontal {
        display: block;
    }
    
    /* 竖版图片容器 */
    .carousel-vertical {
        display: none;
    }
}

/* 主内容区 */
.center {
    position: relative;
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px 18px;
    gap: 36px;
    z-index: 2;
    
    .title-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: 100%;
        max-width: 800px;
        margin-bottom: 10px;
        
        .title-decoration {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            gap: 16px;
            
            &.reverse {
                flex-direction: row-reverse;
            }
            
            .decoration-left,
            .decoration-right {
                height: 1px;
                flex-grow: 1;
                background: linear-gradient(90deg, transparent, $phoebe-gold, transparent);
            }
            
            .decoration-right {
                background: linear-gradient(90deg, transparent, $phoebe-blue-light, transparent);
            }
            
            .decoration-center {
                padding: 0 20px;
                
                .icon-star {
                    color: $phoebe-gold;
                    font-size: 1.2rem;
                    opacity: 0.8;
                    animation: twinkle 3s ease-in-out infinite;
                }
            }
        }
        
        .title {
            font-size: 3.5rem;
            margin: 0;
            font-weight: 800;
            line-height: 1.1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .title-text {
                background: linear-gradient(135deg, $phoebe-gold 0%, $phoebe-gold-light 45%, rgba($phoebe-blue-light, 10%) 100%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 4px 20px rgba($phoebe-blue-light, 0.3);
                letter-spacing: 2px;
            }
            
            .title-sub {
                font-size: 1.8rem;
                font-weight: 500;
                color: $phoebe-blue-bright;
                letter-spacing: 4px;
                margin-top: 8px;
            }
        }
    }
    
    .subtitle-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        max-width: 800px;
        min-height: 60px;
        padding: 16px 24px;
        background: rgba($phoebe-blue-dark, 0.4);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        border: 1px solid rgba($phoebe-blue-light, 0.1);
        box-shadow: 
            0 8px 32px rgba($phoebe-blue-deep, 0.3),
            inset 0 1px 0 rgba($phoebe-white, 0.1);
        
        .subtitle-icon {
            color: $phoebe-gold;
            font-size: 2rem;
            opacity: 0.6;
            
            .icon-quote {
                display: block;
                line-height: 1;
            }
        }
        
        .subtitle {
            font-size: 1.4rem;
            min-height: 1.6em;
            color: $phoebe-white;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            
            .typed {
                display: inline-block;
                white-space: nowrap;
                letter-spacing: 0.6px;
                font-weight: 500;
                color: $phoebe-gold-light;
                text-shadow: 0 2px 8px rgba($phoebe-blue-dark, 0.5);
            }
            
            .cursor {
                display: inline-block;
                width: 3px;
                height: 1.4em;
                margin-left: 4px;
                background: linear-gradient(180deg, $phoebe-gold 0%, $phoebe-blue-light 100%);
                border-radius: 1px;
                animation: blink 1s steps(1) infinite;
            }
        }
    }
    
    .character-info {
        display: flex;
        gap: 32px;
        margin-top: 16px;
        
        .info-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            
            .info-label {
                font-size: 0.85rem;
                color: $phoebe-blue-bright;
                letter-spacing: 1px;
                text-transform: uppercase;
                opacity: 0.8;
            }
            
            .info-value {
                font-size: 1.2rem;
                font-weight: 600;
                color: $phoebe-gold;
                padding: 4px 12px;
                border-radius: 20px;
                background: rgba($phoebe-blue-light, 0.1);
                border: 1px solid rgba($phoebe-blue-light, 0.2);
            }
        }
    }
}

/* 页脚 */
.phoebe-footer {
    position: relative;
    padding: 32px 16px 24px;
    background: linear-gradient(180deg, rgba($phoebe-blue-dark, 0.8) 0%, $phoebe-blue-deep 100%);
    color: $phoebe-white;
    text-align: center;
    overflow: hidden;
    z-index: 2;
    border-top: 1px solid rgba($phoebe-blue-light, 0.1);
    
    .light-strip {
        position: absolute;
        top: 0;
        left: 10%;
        right: 10%;
        height: 2px;
        background: linear-gradient(90deg, 
            rgba($phoebe-blue-light, 0) 0%, 
            rgba($phoebe-blue-light, 0.9) 50%, 
            rgba($phoebe-blue-light, 0) 100%);
        filter: blur(4px);
        opacity: 0.7;
        pointer-events: none;
        border-radius: 4px;
        animation: flowMove 8s linear infinite;
    }
    
    .footer-inner {
        position: relative;
        z-index: 2;
        max-width: 980px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
    }
    
  
    
    .wish {
        margin: 0;
        font-size: 1.1rem;
        color: $phoebe-white;
        max-width: 760px;
        line-height: 1.6;
        padding: 0 16px;
        font-weight: 400;
        text-shadow: 0 2px 8px rgba($phoebe-blue-dark, 0.5);
        animation: subtlePulse 6s ease-in-out infinite;
    }
    
    .footer-divider {
        width: 120px;
        height: 1px;
        background: linear-gradient(90deg, transparent, $phoebe-gold, transparent);
        margin: 8px 0;
    }
    
    .copyright {
        margin: 0;
        font-size: 0.9rem;
        color: rgba($phoebe-white, 0.7);
        letter-spacing: 0.5px;
        font-weight: 300;
    }
}

/* 装饰性悬浮元素 */
.floating-element {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    border-radius: 50%;
    opacity: 0.1;
    background: radial-gradient(circle, $phoebe-blue-light 0%, transparent 70%);
    
    &.floating-element-1 {
        width: 120px;
        height: 120px;
        top: 10%;
        left: 5%;
        filter: blur(20px);
    }
    
    &.floating-element-2 {
        width: 80px;
        height: 80px;
        bottom: 20%;
        right: 8%;
        filter: blur(15px);
        background: radial-gradient(circle, $phoebe-blue-light 0%, transparent 70%);
    }
    
    &.floating-element-3 {
        width: 150px;
        height: 150px;
        top: 60%;
        left: 80%;
        filter: blur(25px);
        background: radial-gradient(circle, $phoebe-gold 0%, transparent 70%);
    }
}

/* 动画关键帧 */
@keyframes blink {
    0%, 50% {
        opacity: 1;
    }
    51%, 100% {
        opacity: 0;
    }
}

@keyframes flowMove {
    0% {
        transform: translateX(-40%);
    }
    100% {
        transform: translateX(40%);
    }
}

@keyframes subtlePulse {
    0%, 100% {
        opacity: 0.9;
    }
    50% {
        opacity: 1;
        text-shadow: 0 4px 16px rgba($phoebe-blue-light, 0.2);
    }
}

@keyframes twinkle {
    0%, 100% {
        opacity: 0.6;
        transform: scale(1);
    }
    50% {
        opacity: 1;
        transform: scale(1.1);
    }
}

@keyframes gentlePulse {
    0%, 100% {
        transform: scale(1);
        opacity: 0.8;
    }
    50% {
        transform: scale(1.1);
        opacity: 1;
    }
}

@keyframes float {
    0%, 100% {
        transform: translateY(0) rotate(0deg);
    }
    33% {
        transform: translateY(-20px) rotate(5deg);
    }
    66% {
        transform: translateY(10px) rotate(-5deg);
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .home {
        .carousel-horizontal {
            display: none;
        }
        
        .carousel-vertical {
            display: block;
        }
    }
    
    .center {
        padding: 20px 16px;
        gap: 28px;
        
        .title-container {
            gap: 8px;
            
            .title {
                font-size: 2.2rem;
                
                .title-sub {
                    font-size: 1.3rem;
                    letter-spacing: 2px;
                }
            }
            
            .title-decoration {
                gap: 10px;
                
                .decoration-center {
                    padding: 0 12px;
                }
            }
        }
        
        .subtitle-container {
            flex-direction: column;
            gap: 8px;
            padding: 16px;
            
            .subtitle {
                font-size: 1.1rem;
                min-height: 1.4em;
            }
            
            .subtitle-icon {
                font-size: 1.5rem;
            }
        }
        
        .character-info {
            flex-direction: column;
            gap: 16px;
            width: 100%;
            max-width: 280px;
            
            .info-item {
                flex-direction: row;
                justify-content: space-between;
                width: 100%;
                
                .info-label {
                    font-size: 0.9rem;
                }
                
                .info-value {
                    font-size: 1rem;
                }
            }
        }
    }
    
    .phoebe-footer {
        padding: 24px 16px 20px;
        
      
        
        .wish {
            font-size: 1rem;
            padding: 0 12px;
        }
        
        .copyright {
            font-size: 0.85rem;
        }
    }
    
    .floating-element {
        &.floating-element-1,
        &.floating-element-2,
        &.floating-element-3 {
            width: 80px;
            height: 80px;
            filter: blur(15px);
        }
    }
}

@media (max-width: 480px) {
    .center {
        .title-container {
            .title {
                font-size: 1.8rem;
                
                .title-sub {
                    font-size: 1.1rem;
                    letter-spacing: 1px;
                }
            }
        }
        
        .subtitle-container {
            padding: 14px;
            
            .subtitle {
                font-size: 1rem;
            }
        }
    }
}
</style>