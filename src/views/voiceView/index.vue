<template>
    <main class="voice-hall" role="main" aria-labelledby="vh-title">
        <div class="carousel carousel1">
            <img v-for="(src, idx) in randomFive" :key="idx" :src="src" class="carousel-image"
                :class="{ active: idx === currentIndex }" />
        </div>
        <div class="carousel carousel2">
            <img v-for="(src, idx) in randomFive2" :key="idx" :src="src" class="carousel-image"
                :class="{ active: idx === currentIndex }" />
        </div>
        <header class="vh-header">
            <div class="vh-head-inner">
                <div class="vh-brand">

                    <div class="texts">
                        <h1 id="vh-title" class="vh-title">菲比的语音馆</h1>
                        <p class="vh-sub">本地已解锁的语音可以播放，未解锁项被锁定</p>
                    </div>
                </div>

                <div class="vh-actions" aria-hidden="true">
                    <div class="stats">
                        <span class="count">{{ unlockedCount }}</span>
                        <small>已解锁 / 23</small>
                    </div>
                </div>
            </div>
        </header>

        <section class="vh-list" aria-live="polite">
            <ul class="cards" role="list">
                <li v-for="id in audioIds" :key="id" class="card"
                    :class="{ unlocked: isUnlocked(id), playing: playingId === id }">
                    <div class="card-media" aria-hidden="true">
                        <div class="thumb">
                            <!-- 支持替换为真实图片：background-image -->
                            <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
                                <defs>
                                    <linearGradient id="g" x1="0" x2="1">
                                        <stop offset="0" stop-color="#f6de97" />
                                        <stop offset="1" stop-color="#3b7be0" />
                                    </linearGradient>
                                </defs>
                                <rect x="6" y="6" width="68" height="68" rx="10" fill="url(#g)" opacity="0.12" />
                                <g transform="translate(20 18)" fill="#f6de97">
                                    <path d="M20 0 L24 10 L34 14 L24 18 L20 28 L16 18 L6 14 L16 10 Z" />
                                </g>
                            </svg>
                        </div>
                    </div>

                    <div class="card-body">
                        <div class="meta">

                            <div class="title">语音·菲比（{{ id }}）</div>
                        </div>

                        <div class="controls">
                            <button v-if="isUnlocked(id)" class="play-btn" :aria-pressed="playingId === id"
                                :title="playingId === id ? '暂停' : '播放'" @click="togglePlay(id)">
                                <span v-if="playingId === id" class="icon pause" aria-hidden="true">▮▮</span>
                                <span v-else class="icon play" aria-hidden="true">▶</span>
                                <span class="sr-only">{{ playingId === id ? '暂停' : '播放' }}</span>
                            </button>

                            <div v-else class="locked" aria-hidden="true" title="未解锁">
                                <!-- 小锁图标 -->
                                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                    <path fill="#9aa7b6"
                                        d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1zM9 6a3 3 0 0 1 6 0v2H9V6z" />
                                </svg>
                            </div>

                            <div class="state" aria-hidden="true">
                                <span v-if="isUnlocked(id)" class="state-text">{{ playingId === id ? '播放中' : '已解锁'
                                    }}</span>
                                <span v-else class="state-text locked-text">锁定</span>
                            </div>
                        </div>

                        <div class="error" v-if="errors[id]">
                            <small>播放失败</small>
                        </div>
                    </div>
                </li>
            </ul>

            <div v-if="unlockedCount === 0" class="empty">
                <div class="empty-card">
                    <div class="empty-ill" aria-hidden="true">
                        <!-- 小徽章提示 -->
                        <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
                            <circle cx="32" cy="20" r="10" fill="#f6de97" opacity="0.12" />
                            <path d="M32 6 L36 18 L48 22 L36 26 L32 38 L28 26 L16 22 L28 18 Z" fill="#f6de97" />
                        </svg>
                    </div>
                    <p class="empty-text">当前没有已解锁的语音，去祈福殿抽取一条吧</p>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

/* 配置 */
// 若你的真实音频路径不同，请调整 audioBase 或 fileNameFor
const audioBase = '/audio';
const total = 23;
const STORAGE_KEY_PLAYED = 'feibi-played-audios-v1';

const audioIds = Array.from({ length: total }, (_, i) => i + 1);

/* 状态 */
const unlockedSet = ref<Set<number>>(new Set());
const playingId = ref<number | null>(null);
const currentAudio = ref<HTMLAudioElement | null>(null);
const errors = ref<Record<number, boolean>>({});


/* helper: 从 storage 读取已解锁 id 列表 */
function loadUnlocked() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PLAYED);
        if (!raw) {
            unlockedSet.value = new Set();
            return;
        }
        const arr = JSON.parse(raw);
        // 允许 number[] 或 string[]，强转为 number[]
        if (Array.isArray(arr)) {
            const ids = arr.map((v: any) => Number(v)).filter((n: number) => Number.isInteger(n) && n >= 1 && n <= total);
            unlockedSet.value = new Set(ids);
        } else {
            unlockedSet.value = new Set();
        }
    } catch (e) {
        console.warn('loadUnlocked err', e);
        unlockedSet.value = new Set();
    }
}

function isUnlocked(id: number) {
    return unlockedSet.value.has(id);
}

/* 音频文件名 -> 请按你项目结构调整 */
function fileNameFor(id: number) {
    // 与你先前使用的一致： "audio (N).mp3"
    return `${audioBase}/${encodeURIComponent(`audio (${id}).mp3`)}`;
}

/* 播放控制 */
async function togglePlay(id: number) {
    if (!isUnlocked(id)) return;
    // 当前正在播放同一条 => 切换 pause/play
    if (playingId.value === id) {
        if (currentAudio.value && !currentAudio.value.paused) {
            currentAudio.value.pause();
            playingId.value = null;
        } else if (currentAudio.value) {
            try {
                await currentAudio.value.play();
                playingId.value = id;
            } catch (e) {
                console.warn('play failed', e);
                errors.value[id] = true;
            }
        }
        return;
    }

    // 停止旧的
    stopCurrent();

    // 创建新 audio
    const src = fileNameFor(id);
    const audio = new Audio(src);
    audio.preload = 'auto';
    currentAudio.value = audio;
    errors.value[id] = false;

    audio.onended = () => {
        playingId.value = null;
        // 不自动修改 storage
    };
    audio.onerror = () => {
        errors.value[id] = true;
        playingId.value = null;
    };

    try {
        await audio.play();
        playingId.value = id;
    } catch (e) {
        console.warn('audio play error', e);
        errors.value[id] = true;
        playingId.value = null;
    }
}

function stopCurrent() {
    try {
        if (currentAudio.value) {
            currentAudio.value.pause();
            try { currentAudio.value.src = ''; } catch (_) { }
            currentAudio.value = null;
        }
    } catch (e) {
        console.warn('stop error', e);
    } finally {
        playingId.value = null;
    }
}

/* 统计已解锁数量（方便显示） */
const unlockedCount = computed(() => unlockedSet.value.size);


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


/* 生命周期 */
onMounted(() => {
    loadUnlocked();
    // 如果你希望页面打开时自动把 storage 的变化同步（例如在其他页更改），可以监听 storage 事件：
    window.addEventListener('storage', onStorage);
    Imgtimer = window.setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % 5;
    }, 5000);
});

onBeforeUnmount(() => {
    stopCurrent();
    window.removeEventListener('storage', onStorage);
    clearInterval(Imgtimer);
});

function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY_PLAYED) {
        loadUnlocked();
    }
}
</script>

<style scoped lang="scss">
/* 菲比风格（固定色：金/蓝/白），卡片化布局，响应式 */
.voice-hall {
    padding: 28px 18px 80px;
    min-height: calc(100vh - 80px);
    box-sizing: border-box;

    color: #102a3b;
    font-family: "Noto Sans SC", "PingFang SC", "Helvetica Neue", sans-serif;
    padding-top: 80px;

    .carousel {
        position: absolute;
        inset: 0;
        z-index: -10;
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

    .vh-header {
        width: 100%;
        max-width: 1260px;
        margin: 0 auto 18px;
        box-sizing: border-box;

        border-radius: 14px;
        padding: 6px;
        background-color: rgba($color: #000000, $alpha: 0.1);

        .vh-head-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 12px;
        }

        .vh-brand {
            display: flex;
            align-items: center;
            gap: 12px;


            .texts {
                .vh-title {
                    margin: 0;
                    font-weight: 900;
                    font-size: 1.35rem;
                    color: #fff;
                }

                .vh-sub {
                    margin: 2px 0 0;
                    /* 珍珠白 -> 圣蓝 -> 金色 */
                    background: linear-gradient(90deg, #f7fbff 0%, #4a86ff 45%, #e9c36a 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                    /* 柔和蓝色光晕 */
                    text-shadow: 0 10px 40px rgba(74, 134, 255, 0.08);
                    font-size: 0.95rem;
                }
            }
        }

        .vh-actions {
            .stats {
                display: flex;
                align-items: baseline;
                gap: 8px;

                .count {
                    font-weight: 900;
                    color: #3b7be0;
                    font-size: 1.2rem;
                }

                small {
                    color: #e9c36a;
                    font-size: 0.85rem;
                }
            }
        }
    }

    .vh-list {
        width: 100%;
        max-width: 1260px;
        margin: 0 auto;
        z-index: 3;
        box-sizing: border-box;
        height: 80vh;
        overflow-y: auto;

        .cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .card {
            background: rgba($color: #000000, $alpha: 0.2);
            border-radius: 12px;
            border: 1px solid rgba(16, 40, 60, 0.04);
            box-shadow: 0 20px 60px rgba(16, 40, 60, 0.04);
            padding: 12px;
            display: flex;
            gap: 12px;
            align-items: center;
            transition: transform .18s ease, box-shadow .18s ease;
            position: relative;
            overflow: hidden;
            min-height: 96px;

            &:hover {
                transform: translateY(-6px);
                box-shadow: 0 30px 100px rgba(16, 40, 60, 0.06);
            }

            &.unlocked {
                border-left: 4px solid #f6de97;
            }

            &.playing {
                box-shadow: 0 36px 120px rgba(59, 123, 224, 0.12);
            }

            .card-media {
                flex: 0 0 88px;
                display: flex;
                align-items: center;
                justify-content: center;

                .thumb {
                    width: 80px;
                    height: 80px;
                    border-radius: 10px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(90deg, rgba(246, 222, 151, 0.06), rgba(59, 123, 224, 0.04));
                }
            }

            .card-body {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 8px;

                .meta {
                    display: flex;
                    align-items: center;
                    gap: 12px;


                    .title {
                        font-weight: 800;
                        background: linear-gradient(90deg, #f7fbff 0%, #4a86ff 45%, #e9c36a 100%);
                        -webkit-background-clip: text;
                        background-clip: text;
                        color: transparent;
                        -webkit-text-fill-color: transparent;
                        /* 柔和蓝色光晕 */
                        text-shadow: 0 10px 40px rgba(74, 134, 255, 0.08);
                        font-size: 1rem;
                    }
                }

                .controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 4px;

                    .play-btn {
                        appearance: none;
                        border: none;
                        background: linear-gradient(90deg, #f6de97 0%, #3b7be0 100%);
                        color: #fff;
                        padding: 8px 12px;
                        border-radius: 10px;
                        font-weight: 900;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 8px 28px rgba(59, 123, 224, 0.12);
                        transition: transform .12s ease, box-shadow .12s ease;
                    }

                    .play-btn:active {
                        transform: translateY(1px);
                    }

                    .play-btn .icon {
                        font-weight: 900;
                        font-size: 0.95rem;
                    }

                    .locked {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        color: #9aa7b6;
                        padding: 6px 8px;
                        border-radius: 8px;
                        background: rgba(16, 40, 60, 0.02);
                    }

                    .state {
                        margin-left: 8px;
                        color: #f6de97;
                        font-size: 0.9rem;

                        .locked-text {
                            color: #a0aab3;
                            font-weight: 700;
                        }
                    }
                }

                .error {
                    color: #bf3b3b;
                    font-weight: 700;
                    font-size: 0.85rem;
                }
            }
        }

        /* .card end */

        .empty {
            margin-top: 36px;
            display: flex;
            justify-content: center;
        }

        .empty-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            background: linear-gradient(180deg, #fff, #fffefc);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(16, 40, 60, 0.04);
        }

        .empty-text {
            color: #6b6770;
            font-weight: 700;
        }
    }



    @media (max-width: 640px) {

        .carousel1 {
            display: none;
        }

        .carousel2 {
            display: block;
        }

        .vh-header .vh-head-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }

        .vh-list .cards {
            grid-template-columns: 1fr;
        }

        .card {
            padding: 12px;
            min-height: 84px;
        }

        .card-media {
            display: none;
        }


        .card .play-btn {
            padding: 10px 12px;
            width: 110px;
            justify-content: center;
        }
    }


}
</style>
