<template>
  <div class="gallery-container">
    <button class="upload-btn" @click="openUploadModal">上传图片</button>

    <section class="gallery section">
      <div class="sort-controls">
        <button @click="toggleSort" class="sort-btn">
          按 {{ sortBy === "like_count" ? "点赞量" : "最新上传" }} 排序
        </button>
      </div>
      <div class="gallery-grid">
        <div
          v-for="(img, index) in images"
          :key="img.id"
          class="card"
          @click="openLightbox(index)"
          ref="cards"
        >
          <div class="card-inner">
            <img
              :src="img.src"
              :alt="img.alt"
              loading="lazy"
              @load="onImageLoad($event)"
            />
            <div class="overlay">
              <span>查看大图</span>
            </div>
            <button class="like-btn" @click.stop="handleLike(img)">
              <i class="heart" :class="{ liked: img.liked }"></i>
              <span class="like-count">{{ img.likeCount }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- sentinel：用于触发无限滚动 -->
      <div ref="sentinel" class="sentinel"></div>
      <!-- 可选：加载中/结束提示 -->
      <div class="loading" v-if="loading">加载中...</div>
      <div class="finished" v-if="finished">已全部加载</div>
    </section>
    <aside class="ranking-panel">
      <div class="panel-header" @click="expanded = !expanded">
        <h3 class="ranking-title">上传排行榜</h3>
        <span>共{{ imageTotal }}张</span>
        <span class="toggle-icon">{{ expanded ? "▾" : "▸" }}</span>
      </div>
      <transition name="fade">
        <ul v-if="expanded" class="ranking-list">
          <li
            v-for="(item, idx) in rankingList"
            :key="idx"
            class="ranking-item"
            :class="`rank-${idx + 1}`"
          >
            <span class="rank">{{ idx + 1 }}</span>
            <span class="name">{{ item.nickname }}</span>
            <span class="count">{{ item.count }} 张</span>
          </li>
        </ul>
      </transition>
    </aside>
    <!-- Lightbox Modal -->
    <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
      <span class="close" @click="closeLightbox">✕</span>
      <span class="prev" @click.stop="prevImage">‹</span>
      <img :src="images[currentIndex].src" :alt="images[currentIndex].alt" />
      <span class="next" @click.stop="nextImage">›</span>
    </div>

    <!-- 上传弹窗 -->
    <div
      v-if="uploadModalOpen"
      class="upload-modal-overlay"
      @click.self="closeUploadModal"
    >
      <div class="upload-modal">
        <h3>批量上传图片</h3>
        <div class="tip-container">
          <ul class="tips-list">
            <li>审核规则：1.不要色情倾向（我怕被封） 2.要我能认出是菲比。</li>
            <li>
              由于没有用户系统，我这边不好做审核反馈，但只要显示上传成功，我这边肯定能收到。
            </li>
            <li>
              如果图片数量较多请在b站私信联系我给我网盘链接，因为我云服务器比较小一次性上传太多图片可能会导致上传不上，感谢理解。
            </li>
            <li>
              因为审核上传一次比较麻烦，所以审核时间不定，最晚一周，感谢谅解。
            </li>
          </ul>
        </div>
        <p class="stats">
          今日已上传：<strong>{{ uploadedToday }}</strong> 张，
          剩余可上传：<strong>{{ remaining }}</strong> 张
        </p>
        <label>
          昵称：
          <input v-model="nickname" type="text" placeholder="请输入昵称" />
        </label>
        <label>
          选择图片（最多 {{ remaining }} 张）：
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileSelect"
          />
        </label>
        <p class="tip" v-if="selectedFiles.length">
          已选 {{ selectedFiles.length }} 张
        </p>
        <div class="modal-actions">
          <button :disabled="!canSubmit || isUploading" @click="submitUpload">
            {{ isUploading ? "上传中..." : "立即上传" }}
          </button>
          <button class="cancel" @click="closeUploadModal">取消</button>
        </div>
      </div>
    </div>

    <div class="floating-chibis">
      <img
        v-for="(pet, i) in chibiList"
        :key="i"
        :src="pet.src"
        :style="{ top: pet.top + 'px', left: pet.left + 'px' }"
        class="chibi-img"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from "vue";
import { uploadImages } from "@/api/modules/images"; // 前面封装的上传接口
import { getRankingList } from "@/api/modules/ranking"; // 根据你的实际路径调整
import { gsap } from "gsap"; // ← 本地引入
import { getImagesLikesList, likeImage } from "@/api/modules/imagesLikes";
import { debounce } from "lodash";

const sortBy = ref<"uploaded_at" | "like_count">("like_count");
const order = ref<"asc" | "desc">("desc");
function toggleSort() {
  if (sortBy.value === "uploaded_at") {
    sortBy.value = "like_count";
    order.value = "desc";
  } else {
    sortBy.value = "uploaded_at";
    order.value = "desc";
  }
  pageImage.value = 1;
  images.value = [];
  finished.value = false;
  window.scrollTo(0, 0);
  loadNextPage();
}
// 获取已点赞 ID 数组
function getLikedIds(): number[] {
  const data = localStorage.getItem("likedImageIds");
  return data ? JSON.parse(data) : [];
}

// 保存已点赞 ID 数组
function setLikedIds(ids: number[]) {
  localStorage.setItem("likedImageIds", JSON.stringify(ids));
}

async function handleLike(img: ImageItem) {
  if (img.liked) return; // 已点过就不重复调用

  try {
    await likeImage(img.id); // 调用后端接口
    img.likeCount += 1; // 本地更新点赞数
    img.liked = true; // 标记已点赞

    // 更新 localStorage
    const likedIds = getLikedIds();
    likedIds.push(img.id);
    setLikedIds(likedIds);
  } catch (error) {
    console.error("点赞失败", error);
    alert("点赞失败，请稍后重试");
  }
}

interface ImageItem {
  src: string;
  alt: string;
  likeCount: number;
  id: number;
  liked: Boolean;
}

interface RankingItem {
  id?: number; // 如果接口返回有 id，可加上
  nickname: string;
  count: number;
}
const rankingList = ref<RankingItem[]>([]);
const expanded = ref(true);

// 默认分页参数（如不分页可省略）
const page = 1;
const pageSize = 99;

const fetchRanking = async () => {
  const res = await getRankingList({ page, pageSize, character_key: "feibi" });
  if (res.success) {
    rankingList.value = res.data;
  } else {
    console.error("获取排行榜失败", res.message);
  }
};

// 响应式存放最终图片列表
const images = ref<ImageItem[]>([]);
const imageTotal = ref(0);
const pageImage = ref(1);
const limit = ref(10);
const loading = ref(false);
const finished = ref(false);

const sentinel = ref<HTMLElement | null>(null);

// 1. 在外层创建一个单例 observerCard
const observerCard = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observerCard.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
// 2. 每次有新卡片时，都调用这个方法去挂载观察
async function observeNewCards(startIndex = 0) {
  await nextTick();
  const cards = document.querySelectorAll<HTMLElement>(".card");
  for (let i = startIndex; i < cards.length; i++) {
    observerCard.observe(cards[i]);
  }
}

async function loadNextPage() {
  if (loading.value || finished.value) return;
  loading.value = true;
  try {
    const res = await getImagesLikesList({
      page: pageImage.value,
      limit: limit.value,
      sortBy: sortBy.value,
      character_key: "feibi",
      order: order.value,
    });
    const likedIds = getLikedIds();
    const list = (
      res.images as Array<{ url: string; like_count: number; id: number }>
    ).map((item) => ({
      src: item.url,
      alt: "",
      likeCount: item.like_count,
      id: item.id, // 如果需要的话，方便点赞用
      liked: likedIds.includes(item.id),
    }));
    if (list.length === 0) {
      finished.value = true;
      return;
    }
    // 记录加载前的长度，方便后面找出“新增”节点
    const oldLength = images.value.length;
    const existingIds = new Set(images.value.map((i) => i.id));
    const filtered = list.filter((item) => !existingIds.has(item.id));
    images.value.push(...filtered);
    pageImage.value++;
    imageTotal.value = res.total;
    observeNewCards(oldLength);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// 3. 给 loadNextPage 包装一个防抖版
const debouncedLoad = debounce(
  () => {
    loadNextPage();
  },
  200,
  { leading: true, trailing: false }
);

const lightboxOpen = ref(false);
const currentIndex = ref(0);

function openLightbox(index: number) {
  currentIndex.value = index;
  lightboxOpen.value = true;
}
function closeLightbox() {
  lightboxOpen.value = false;
}
function prevImage() {
  currentIndex.value =
    (currentIndex.value + images.value.length - 1) % images.value.length;
}
function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % images.value.length;
}

// 渐显＆Blur‑Up 效果
function onImageLoad(e: Event) {
  const img = e.target as HTMLImageElement;
  const card = img.closest(".card");
  card?.classList.add("loaded");
}

// 上传弹窗逻辑

const uploadModalOpen = ref(false);
const nickname = ref("");
const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);

// 从 localStorage 读取“今天”已上传数量
function getTodayKey() {
  return `uploaded_${new Date().toISOString().slice(0, 10)}`;
}
const uploadedToday = ref<number>(
  Number(localStorage.getItem(getTodayKey()) || 0)
);
const remaining = computed(() => Math.max(24 - uploadedToday.value, 0));

// 控制提交按钮
const canSubmit = computed(() => {
  return (
    nickname.value.trim().length > 0 &&
    selectedFiles.value.length > 0 &&
    selectedFiles.value.length <= remaining.value
  );
});

// 放在 script 顶部，或者 utils 里
function clearOldUploadRecords() {
  const today = new Date();
  const storage = window.localStorage;
  for (const key of Object.keys(storage)) {
    if (!key.startsWith("uploaded_")) continue;

    // key 格式 uploaded_YYYY-MM-DD
    const dateStr = key.slice("uploaded_".length);
    const recordDate = new Date(dateStr);
    if (isNaN(recordDate.getTime())) continue;

    // 计算相差天数
    const diffMs = today.getTime() - recordDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // 如果超过 2 天，就删掉
    if (diffDays > 2) {
      storage.removeItem(key);
    }
  }
}

function openUploadModal() {
  clearOldUploadRecords();
  nickname.value = "";
  selectedFiles.value = [];
  if (fileInput.value) fileInput.value.value = "";
  // 每次打开重新刷新已上传数
  uploadedToday.value = Number(localStorage.getItem(getTodayKey()) || 0);
  uploadModalOpen.value = true;
}
function closeUploadModal() {
  uploadModalOpen.value = false;
}

// 本地截断到剩余数量
function handleFileSelect(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || []);

  if (!files) return;

  const validFiles: File[] = [];
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) {
      alert(`文件太大：${file.name}，请控制在 20MB 内`);
      continue;
    }
    validFiles.push(file);
  }

  if (validFiles.length === 0) return;

  if (validFiles.length > remaining.value) {
    alert(
      `今天最多还能上传 ${remaining.value} 张，已为你截取前 ${remaining.value} 张`
    );
    selectedFiles.value = files.slice(0, remaining.value);
  } else {
    selectedFiles.value = files;
  }
}
const isUploading = ref(false);
async function submitUpload() {
  if (!canSubmit.value) return;
  isUploading.value = true;
  try {
    const res = await uploadImages(
      selectedFiles.value,
      nickname.value.trim(),
      "feibi"
    );
    const uploadedCount = res.data.length;
    // 更新 localStorage
    uploadedToday.value += uploadedCount;
    localStorage.setItem(getTodayKey(), String(uploadedToday.value));

    alert(`成功上传 ${uploadedCount} 张图片`);
    closeUploadModal();
    // …可选：刷新画廊列表或把新图片追加到 images …
  } catch (err: any) {
    console.error(err);
    alert(err.message || "上传失败");
  } finally {
    isUploading.value = false;
  }
}

interface Chibi {
  src: string;
  top: number;
  left: number;
}

const chibiList = ref<Chibi[]>([]);
let sentinelObserver: IntersectionObserver;
// Scroll-triggered lazy animation
onMounted(async () => {
  // 1. 拉排行榜
  await fetchRanking();

  // 2. 拉第一页图片并挂载动画 observer
  await loadNextPage(); // 内部会调用 observeNewCards(oldLen)
  // 对首次卡片做一次完整 observe
  observeNewCards(0);

  // 3. 初始化 sentinelObserver，再 observe
  sentinelObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) debouncedLoad();
    },
    { rootMargin: "0px", threshold: 0.1 }
  );
  if (sentinel.value) {
    sentinelObserver.observe(sentinel.value);
  }
  // 1. 基础配置信息
  const total = 16; 
  let pickCount = 3; // 每次抽取 3 张
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = window.innerWidth <= 768;
  // 如果已知单张小人图片的宽高，可避免超出边界；
  // 假设小人图片宽 100px、高 100px，按需替换：
  const imgWidth = 100;
  const imgHeight = 100;

  // 2. Fisher–Yates 洗牌函数
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 3. 随机选出 3 个编号
  const nums = shuffle(Array.from({ length: total }, (_, k) => k + 1));
  if (isMobile) {
    pickCount = 1;
  }
  const picks = nums.slice(0, pickCount);

  // 4. 生成随机位置并填充 chibiList
  chibiList.value = []; // 先清空
  picks.forEach((i) => {
    chibiList.value.push({
      src: `/QImages/1 (${i}).png`,
      left: Math.random() * (vw - imgWidth), // 保证不超出左右边界
      top: Math.random() * (vh - imgHeight), // 保证不超出上下边界
    });
  });

  // 2. 等 img 渲染到 DOM
  await nextTick();

  // 3. 给每个小人绑定 GSAP 动画
  const imgs = document.querySelectorAll<HTMLImageElement>(".chibi-img");
  imgs.forEach((img, index) => {
    const padding = 200; // 边缘预留空间
    // ✅ 初始出场动画（闪现）
    gsap.fromTo(
      img,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(2)",
        delay: 0.2 * index,
      }
    );

    // ✅ 鼠标靠近闪避
    img.addEventListener("mouseenter", () => {
      gsap.killTweensOf(img);

      gsap.to(img, {
        x: "+=" + ((Math.random() - 0.5) * 400).toFixed(0),
        y: "+=" + ((Math.random() - 0.5) * 400).toFixed(0),
        duration: 1.2,
        ease: "back.out(2)",
        onComplete: () => {
          // 闪避完成后，再重新启用动画
          animate(img);
        },
      });
    });

    const animate = (img: HTMLImageElement) => {
      let { x, y } = img.getBoundingClientRect();
      let deltaX = (Math.random() - 0.5) * 200;
      let deltaY = (Math.random() - 0.5) * 200;

      // 预测一下偏移后的位置
      let nextX = x + deltaX;
      let nextY = y + deltaY;

      // 校正：防漂出左、右、上、下边界
      if (nextX < padding) deltaX = padding - x;
      if (nextX + img.width > window.innerWidth - padding)
        deltaX = window.innerWidth - padding - (x + img.width);
      if (nextY < padding) deltaY = padding - y;
      if (nextY + img.height > window.innerHeight - padding)
        deltaY = window.innerHeight - padding - (y + img.height);

      gsap.to(img, {
        x: `+=${deltaX.toFixed(0)}`,
        y: `+=${deltaY.toFixed(0)}`,
        rotation: `+=${((Math.random() - 0.5) * 60).toFixed(0)}`,
        duration: 2 + Math.random() * 2,
        ease: "power1.inOut",
        onComplete: () => animate(img),
      });
    };
    animate(img);
  });
});

onBeforeUnmount(() => {
  observerCard.disconnect();
  sentinelObserver.disconnect();
  // 以及你在 onMounted 里新建的其它 Observer
});
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
$phoebe-gold-trans: rgba(246, 222, 151, 0.1);
$phoebe-blue-trans: rgba(59, 123, 224, 0.1);

/* 全局样式 */
.gallery-container {
  min-height: 100vh;
  background: linear-gradient(
      160deg,
      $phoebe-blue-deep 0%,
      $phoebe-blue-dark 100%
    ),
    radial-gradient(
      circle at 20% 20%,
      rgba($phoebe-gold, 0.05) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba($phoebe-blue-light, 0.08) 0%,
      transparent 40%
    );
  color: $phoebe-white;
  font-family: "Noto Sans SC", "Segoe UI", system-ui, sans-serif;
  padding: 1rem;
  position: relative;
  padding-top: 60px;
}

/* 上传按钮 */
.upload-btn {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 100;
  background: linear-gradient(
    135deg,
    $phoebe-gold 0%,
    rgba($phoebe-gold, 10%) 100%
  );
  color: $phoebe-blue-dark;
  border: none;
  border-radius: 50px;
  padding: 0.8rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 20px rgba($phoebe-gold, 0.3),
    0 0 0 1px rgba($phoebe-white, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 30px rgba($phoebe-gold, 0.4),
      0 0 0 1px rgba($phoebe-white, 0.2);
    background: linear-gradient(
      135deg,
      rgba($phoebe-gold, 5%) 0%,
      $phoebe-gold 100%
    );
  }

  &:active {
    transform: translateY(-1px);
  }

  &::before {
    content: "+";
    font-size: 1.2rem;
    font-weight: bold;
  }
}

/* 画廊主区域 */
.gallery {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 0;
}

.sort-controls {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.sort-btn {
  background: rgba($phoebe-white, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  color: $phoebe-gold;
  border-radius: 25px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba($phoebe-gold, 0.2);
    border-color: $phoebe-gold;
    transform: translateY(-2px);
  }

  &::before {
    content: "↕";
    font-size: 1rem;
  }
}

/* 画廊网格 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
}

/* 卡片样式 */
.card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 3/4;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px);

    .card-inner {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba($phoebe-gold, 0.3);

      img {
        transform: scale(1.08);
        filter: brightness(1.1);
      }

      .overlay {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba($phoebe-white, 0.05);
  transition: box-shadow 0.4s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.6s ease;
    filter: brightness(0.95);
  }
}

/* 卡片覆盖层 */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba($phoebe-blue-dark, 0.9) 0%,
    rgba($phoebe-blue-dark, 0.6) 50%,
    transparent 100%
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s ease;

  span {
    color: $phoebe-gold;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 1px;
    padding: 0.5rem 1rem;
    background: rgba($phoebe-blue-dark, 0.7);
    border-radius: 20px;
    border: 1px solid rgba($phoebe-gold, 0.3);
    backdrop-filter: blur(10px);
  }
}

/* 点赞按钮 */
.like-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba($phoebe-blue-dark, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-white, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;

  &:hover {
    background: rgba($phoebe-blue-dark, 0.9);
    border-color: $phoebe-gold;
    transform: scale(1.1);
  }

  .heart {
    position: relative;
    width: 20px;
    height: 20px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f6de97'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")
      no-repeat center;
    background-size: contain;
    transition: all 0.3s ease;

    &.liked {
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff4757'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")
        no-repeat center;
      animation: heartBeat 0.6s ease;

      &::after {
        content: "";
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        background: rgba(255, 71, 87, 0.2);
        animation: pulse 1.5s ease-out infinite;
      }
    }
  }

  .like-count {
    position: absolute;
    bottom: -20px;
    right: 8px;
    font-size: 1.2rem;
    color: $phoebe-white;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    min-width: 20px;
    text-align: center;
  }
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.2);
    opacity: 0;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* 无限滚动指示器 */
.sentinel {
  height: 100px;
}

.loading,
.finished {
  text-align: center;
  padding: 2rem;
  color: $phoebe-gold;
  font-size: 0.9rem;
  font-weight: 500;
}

.loading {
  &::after {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba($phoebe-gold, 0.3);
    border-top-color: $phoebe-gold;
    border-radius: 50%;
    margin-left: 0.5rem;
    animation: spin 1s linear infinite;
    vertical-align: middle;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 排行榜面板 */
.ranking-panel {
  position: fixed;
  top: 80px;
  right: 2rem;
  width: 260px;
  z-index: 90;
}

.panel-header {
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($phoebe-blue-dark, 0.9);
    border-color: $phoebe-gold;
    transform: translateY(-2px);
  }

  .ranking-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: $phoebe-gold;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: "🏆";
      font-size: 0.9rem;
    }
  }

  .toggle-icon {
    color: $phoebe-gold;
    font-size: 0.9rem;
    transition: transform 0.3s ease;
  }
}

.ranking-list {
  margin-top: 0.5rem;
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.2);
  border-radius: 12px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba($phoebe-white, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba($phoebe-gold, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba($phoebe-gold, 0.5);
    }
  }
}

.ranking-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  background: rgba($phoebe-white, 0.05);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($phoebe-white, 0.1);
    border-color: rgba($phoebe-gold, 0.2);
  }

  &:last-child {
    margin-bottom: 0;
  }

  .rank {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($phoebe-white, 0.1);
    border-radius: 50%;
    font-size: 0.8rem;
    font-weight: 700;
    color: $phoebe-gold;
  }

  .name {
    flex: 1;
    padding: 0 1rem;
    font-size: 0.9rem;
    color: $phoebe-white;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count {
    font-size: 0.85rem;
    color: $phoebe-gold;
    font-weight: 600;
    white-space: nowrap;
  }

  /* 前三名特殊样式 */
  &.rank-1 {
    background: linear-gradient(
      135deg,
      rgba($phoebe-gold, 0.2),
      rgba($phoebe-gold, 0.1)
    );
    border-color: rgba($phoebe-gold, 0.3);

    .rank {
      background: $phoebe-gold;
      color: $phoebe-blue-dark;
    }

    .count {
      color: $phoebe-gold-light;
    }
  }

  &.rank-2 {
    background: linear-gradient(
      135deg,
      rgba($phoebe-blue-light, 0.15),
      rgba($phoebe-blue-light, 0.05)
    );
    border-color: rgba($phoebe-blue-light, 0.2);

    .rank {
      background: $phoebe-blue-light;
      color: $phoebe-white;
    }
  }

  &.rank-3 {
    background: linear-gradient(
      135deg,
      rgba($phoebe-blue-bright, 0.15),
      rgba($phoebe-blue-bright, 0.05)
    );
    border-color: rgba($phoebe-blue-bright, 0.2);

    .rank {
      background: $phoebe-blue-bright;
      color: $phoebe-white;
    }
  }
}

/* 灯箱模态框 */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba($phoebe-blue-deep, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.lightbox img {
  max-width: 85vw;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba($phoebe-gold, 0.2);
  object-fit: contain;
}

.close,
.prev,
.next {
  position: absolute;
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  color: $phoebe-gold;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($phoebe-blue-dark, 0.9);
    border-color: $phoebe-gold;
    transform: scale(1.1);
  }
}

.close {
  top: 2rem;
  right: 2rem;
}

.prev {
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
}

.next {
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
}

/* 上传模态框 */
.upload-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($phoebe-blue-deep, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

.upload-modal {
  background: rgba($phoebe-blue-dark, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  color: $phoebe-white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba($phoebe-gold, 0.1);

  h3 {
    color: $phoebe-gold;
    margin: 0 0 1.5rem 0;
    font-size: 1.4rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &::before {
      content: "📤";
    }
  }
}

.tip-container {
  background: rgba($phoebe-white, 0.05);
  border: 1px solid rgba($phoebe-gold, 0.1);
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
    color: rgba($phoebe-white, 0.9);
    line-height: 1.5;

    &:last-child {
      margin-bottom: 0;
    }

    &::before {
      content: "•";
      color: $phoebe-gold;
      position: absolute;
      left: 0;
    }
  }
}

.stats {
  text-align: center;
  margin: 1.5rem 0;
  font-size: 1rem;
  color: $phoebe-white;

  strong {
    color: $phoebe-gold;
    font-weight: 700;
  }
}

.upload-modal label {
  display: block;
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
  color: rgba($phoebe-white, 0.9);

  input[type="text"],
  input[type="file"] {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.8rem 1rem;
    background: rgba($phoebe-white, 0.05);
    border: 1px solid rgba($phoebe-gold, 0.2);
    border-radius: 8px;
    color: $phoebe-white;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: $phoebe-gold;
      background: rgba($phoebe-white, 0.1);
    }

    &::placeholder {
      color: rgba($phoebe-white, 0.5);
    }
  }
}

.tip {
  text-align: center;
  margin: 1rem 0;
  font-size: 0.85rem;
  color: $phoebe-gold;
  font-style: italic;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;

  button {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  button:not(.cancel) {
    background: linear-gradient(
      135deg,
      $phoebe-gold 0%,
      rgba($phoebe-gold, 10%) 100%
    );
    color: $phoebe-blue-dark;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba($phoebe-gold, 0.3);
    }
  }

  .cancel {
    background: transparent;
    border: 1px solid rgba($phoebe-white, 0.3);
    color: $phoebe-white;

    &:hover {
      background: rgba($phoebe-white, 0.1);
      border-color: $phoebe-white;
    }
  }
}

/* 浮动角色 */
.floating-chibis {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.chibi-img {
  position: absolute;
  width: 80px;
  user-select: none;
  transform-origin: center center;
  pointer-events: auto;
  z-index: 10;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .gallery-container {
    padding: 0.5rem;
    padding-top: 60px;
  }

  .upload-btn {
    bottom: 1rem;
    left: 1rem;
    padding: 0.7rem 1.2rem;
    font-size: 0.85rem;
  }

  .gallery {
    padding: 1rem 0;
  }

  .sort-controls {
    padding: 0 0.5rem;
  }

  .gallery-grid {
    padding: 0 0.5rem;
  }

  .panel-header,
  .ranking-list {
    backdrop-filter: none;
  }

  .close,
  .prev,
  .next {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .close {
    top: 1rem;
    right: 1rem;
  }

  .prev {
    left: 1rem;
  }

  .next {
    right: 1rem;
  }

  .upload-modal {
    width: 95%;
    padding: 1.5rem;
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .card {
    aspect-ratio: 2/3;
  }

  .ranking-panel {
    margin: 1rem auto;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
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
</style>