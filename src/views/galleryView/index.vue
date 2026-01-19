<template>
  <div class="gallery-container">
    <button class="upload-btn" @click="openUploadModal">上传图片</button>

    <section class="gallery section">
      <div class="sort-controls">
        <button @click="toggleSort" class="sort-btn">
          按 {{ sortBy === "like_count" ? "点赞量" : "最新上传" }} 排序
        </button>
        <!-- 点赞筛选按钮 -->
        <div class="filter-controls">
          <button
            class="filter-btn liked-filter"
            @click="toggleLikedFilter"
            :class="{ active: showLikedOnly }"
            :disabled="
              isLoadingLikedImages || (likedIds.length === 0 && !showLikedOnly)
            "
            :title="showLikedOnly ? '显示所有图片' : '只看点赞过的图片'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            <span class="filter-text">
              {{ showLikedOnly ? "所有图片" : "只看点赞" }}
            </span>

            <span class="loading-spinner" v-if="isLoadingLikedImages"></span>
            <div class="filter-glow"></div>
          </button>

          <!-- 筛选状态提示 -->
          <transition name="fade">
            <div v-if="showLikedOnly" class="filter-info">
              <span class="info-text">
                {{
                  likedImages.length > 0
                    ? `已筛选：${likedImages.length} 张点赞图片`
                    : "暂无点赞图片"
                }}
                <span v-if="isLoadingLikedImages" class="loading-text"
                  >（加载中...）</span
                >
              </span>
              <button
                class="clear-filter"
                @click="clearLikedFilter"
                title="清除筛选"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </transition>
        </div>
      </div>
      <!-- 画廊网格 -->
      <div class="gallery-grid">
        <!-- 筛选模式下的空状态 -->
        <div
          v-if="
            showLikedOnly && likedImages.length === 0 && !isLoadingLikedImages
          "
          class="filter-empty"
        >
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
          <h3>暂无点赞图片</h3>
          <p>快去为你喜欢的图片点赞吧！</p>
        </div>

        <!-- 图片卡片 -->
        <div
          v-for="(img, index) in displayedImages"
          :key="img.id"
          class="card"
          @click="openLightbox(getDisplayedIndex(img.id, index))"
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
      <div class="loading" v-if="loading && !showLikedOnly">加载中...</div>
      <div class="finished" v-if="finished && !showLikedOnly">已全部加载</div>
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
    <!-- Lightbox Modal -->
    <div
      v-if="lightboxOpen"
      class="lightbox"
      @click.self="closeLightbox"
      @wheel.prevent="handleLightboxWheel"
    >
      <!-- 控制按钮 -->
      <div class="lightbox-controls">
        <button class="lightbox-close" @click="closeLightbox" title="关闭">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="lightbox-toolbar">
          <!-- 缩放控制 -->
          <div class="zoom-controls">
            <button
              @click.stop="zoomOut"
              :disabled="zoomLevel <= 0.5"
              title="缩小"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14" />
              </svg>
            </button>
            <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
            <button
              @click.stop="zoomIn"
              :disabled="zoomLevel >= 3"
              title="放大"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button @click.stop="resetZoom" title="重置缩放">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
                <path d="M9 12h6M12 9v6" />
              </svg>
            </button>
          </div>

          <!-- 点赞按钮 -->
          <button
            class="lightbox-like-btn"
            @click.stop="handleLike(currentImage)"
            :class="{ liked: currentImage?.liked }"
            :title="currentImage?.liked ? '已点赞' : '点赞'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            <span class="like-count">{{ currentImage?.likeCount || 0 }}</span>
            <div class="like-pulse"></div>
          </button>

          <!-- 下载按钮 -->
          <button
            class="lightbox-download-btn"
            @click.stop="downloadImage"
            title="下载图片"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          <!-- 导航信息 -->
          <div class="nav-info">
            <span class="current-index">{{ currentIndex + 1 }}</span>
            <span class="separator">/</span>
            <span class="total-count">{{ images.length }}</span>
          </div>
        </div>
      </div>

      <!-- 图片容器 -->
      <div
        class="lightbox-image-container"
        :style="{
          transform: `scale(${zoomLevel})`,
          transformOrigin: `${panOrigin.x}% ${panOrigin.y}%`,
        }"
        @mousedown="startPan"
        @touchstart="startPan"
        @mousemove="doPan"
        @touchmove="doPan"
        @mouseup="endPan"
        @touchend="endPan"
        @mouseleave="endPan"
      >
        <img
          :src="currentImage?.src"
          :alt="currentImage?.alt"
          :style="{
            cursor: isPanning ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
          }"
          @load="onLightboxImageLoad"
        />
      </div>

      <!-- 导航按钮 -->
      <button class="lightbox-nav prev" @click.stop="prevImage" title="上一张">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button class="lightbox-nav next" @click.stop="nextImage" title="下一张">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- 拖拽提示 -->
      <div v-if="zoomLevel > 1 && !isPanning" class="pan-hint">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M9 10l-5 5 5 5" />
          <path d="M20 4v7a4 4 0 01-4 4H4" />
        </svg>
        <span>拖拽查看大图</span>
      </div>
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
import {
  ref,
  onMounted,
  computed,
  nextTick,
  onBeforeUnmount,
  watch,
} from "vue";
import { uploadImages } from "@/api/modules/images"; // 前面封装的上传接口
import { getRankingList } from "@/api/modules/ranking"; // 根据你的实际路径调整
import { gsap } from "gsap"; // ← 本地引入
import {
  getImagesLikesList,
  likeImage,
  getImagesByIds,
} from "@/api/modules/imagesLikes";
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

// ==================== 点赞筛选功能 ====================
const showLikedOnly = ref(false);
const likedImages = ref<ImageItem[]>([]);
const isLoadingLikedImages = ref(false);

// 获取点赞ID数组
const likedIds = computed(() => {
  return getLikedIds();
});

// 计算当前显示的图片列表
const displayedImages = computed(() => {
  if (showLikedOnly.value) {
    return likedImages.value;
  }
  return images.value;
});

// 获取点赞过的图片
const fetchLikedImages = async () => {
  if (isLoadingLikedImages.value) return;

  isLoadingLikedImages.value = true;
  try {
    const likedIdsArray = getLikedIds();

    if (likedIdsArray.length === 0) {
      likedImages.value = [];
      return;
    }

    // 调用新接口获取点赞过的图片
    const res = await getImagesByIds({
      ids: likedIdsArray,
      character_key: "feibi",
    });

    if (res.success) {
      // 转换为前端需要的格式
      likedImages.value = res.images.map((item) => ({
        src: item.url,
        alt: "",
        likeCount: item.like_count || 0,
        id: item.id,
        liked: true, // 这些图片都是用户点赞过的
      }));
    } else {
      console.error("获取点赞图片失败:", res.message);
      // 如果新接口失败，使用本地缓存的图片
      likedImages.value = images.value.filter((img) => img.liked);
    }
  } catch (error) {
    console.error("获取点赞图片错误:", error);
    // 出错时使用本地缓存的图片
    likedImages.value = images.value.filter((img) => img.liked);
  } finally {
    isLoadingLikedImages.value = false;
  }
};

// 切换点赞筛选
const toggleLikedFilter = async () => {
  if (showLikedOnly.value) {
    // 切换到显示所有图片
    showLikedOnly.value = false;
    // 重置分页状态，确保可以重新开始无限滚动
    pageImage.value = 1;
    images.value = [];
    finished.value = false;
    loading.value = false;

    // 确保观察器重新观察哨兵元素
    await nextTick();
    if (sentinel.value && sentinelObserver) {
      sentinelObserver.unobserve(sentinel.value);
      sentinelObserver.observe(sentinel.value);
    }

    // 立即加载第一页
    loadNextPage();
  } else {
    // 切换到只显示点赞图片
    showLikedOnly.value = true;
    // 清空筛选结果，重新获取点赞图片
    likedImages.value = [];

    // 先使用已加载的图片显示，然后异步获取完整的点赞图片
    likedImages.value = images.value.filter((img) => img.liked);

    // 异步获取所有点赞图片
    fetchLikedImages();

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 显示筛选动画
    showFilterAnimation();
  }
};
// 清除筛选
const clearLikedFilter = () => {
  showLikedOnly.value = false;
  // 重置分页状态
  pageImage.value = 1;
  images.value = [];
  finished.value = false;
  loading.value = false;
  
  // 重新开始无限滚动
  nextTick(() => {
    if (sentinel.value && sentinelObserver) {
      sentinelObserver.unobserve(sentinel.value);
      sentinelObserver.observe(sentinel.value);
    }
    loadNextPage();
  });
};
// 显示筛选动画效果
const showFilterAnimation = () => {
  // 为点赞的图片添加高亮动画
  setTimeout(() => {
    const likedCards = document.querySelectorAll(".card");
    likedCards.forEach((card, index) => {
      const img = card.querySelector("img");
      if (
        img?.getAttribute("src") &&
        likedImages.value.some(
          (likedImg) => likedImg.src === img.getAttribute("src")
        )
      ) {
        // 添加心跳动画
        card.classList.add("liked-highlight");
        setTimeout(() => {
          card.classList.remove("liked-highlight");
        }, 1000 + index * 100);
      }
    });
  }, 100);
};

// 获取在displayedImages中的索引
const getDisplayedIndex = (imgId: number, currentIndex: number) => {
  if (showLikedOnly.value) {
    return currentIndex;
  }
  return images.value.findIndex((img) => img.id === imgId);
};

// 更新handleLike函数
const handleLike = async (img: ImageItem) => {
  if (img.liked) return; // 已点过就不重复调用

  try {
    await likeImage(img.id); // 调用后端接口
    img.likeCount += 1; // 本地更新点赞数
    img.liked = true; // 标记已点赞

    // 更新 localStorage
    const likedIds = getLikedIds();
    likedIds.push(img.id);
    setLikedIds(likedIds);

    // 如果当前在筛选模式，更新筛选列表
    if (showLikedOnly.value) {
      // 检查图片是否已在筛选列表中
      if (!likedImages.value.some((item) => item.id === img.id)) {
        // 添加到筛选列表
        likedImages.value.push({ ...img });
      }

      // 为新点赞的图片添加高亮效果
      const card = Array.from(document.querySelectorAll(".card")).find(
        (card) => {
          const cardImg = card.querySelector("img");
          return cardImg?.getAttribute("src") === img.src;
        }
      );
      if (card) {
        card.classList.add("new-liked");
        setTimeout(() => {
          card.classList.remove("new-liked");
        }, 1500);
      }
    }
  } catch (error) {
    console.error("点赞失败", error);
    alert("点赞失败，请稍后重试");
  }
};

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
// ==================== Lightbox 功能 ====================
const zoomLevel = ref(1);
const isPanning = ref(false);
const panStart = ref({ x: 0, y: 0 });
const panOrigin = ref({ x: 50, y: 50 });

// 计算当前图片
const currentImage = computed(() => {
  return images.value[currentIndex.value];
});

// 图片加载完成
const onLightboxImageLoad = () => {
  resetZoom();
};

// 缩放功能
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value = Math.min(zoomLevel.value + 0.25, 3);
    // 重置拖拽原点
    panOrigin.value = { x: 50, y: 50 };
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(zoomLevel.value - 0.25, 0.5);
    // 如果缩放小于1，重置位置
    if (zoomLevel.value <= 1) {
      panOrigin.value = { x: 50, y: 50 };
    }
  }
};

const resetZoom = () => {
  zoomLevel.value = 1;
  panOrigin.value = { x: 50, y: 50 };
};

// 鼠标滚轮缩放
const handleLightboxWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

// 拖拽功能
const startPan = (e: MouseEvent | TouchEvent) => {
  if (zoomLevel.value <= 1) return;

  isPanning.value = true;
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

  panStart.value = { x: clientX, y: clientY };
};

const doPan = (e: MouseEvent | TouchEvent) => {
  if (!isPanning.value || zoomLevel.value <= 1) return;

  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

  const deltaX = clientX - panStart.value.x;
  const deltaY = clientY - panStart.value.y;

  // 计算新的原点位置
  const sensitivity = 0.5; // 拖拽灵敏度
  panOrigin.value = {
    x: Math.max(
      0,
      Math.min(
        100,
        panOrigin.value.x - (deltaX * sensitivity) / zoomLevel.value
      )
    ),
    y: Math.max(
      0,
      Math.min(
        100,
        panOrigin.value.y - (deltaY * sensitivity) / zoomLevel.value
      )
    ),
  };

  panStart.value = { x: clientX, y: clientY };
};

const endPan = () => {
  isPanning.value = false;
};

// 下载图片
const downloadImage = async () => {
  if (!currentImage.value) return;

  try {
    const response = await fetch(currentImage.value.src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // 从URL中提取文件名，如果没有则使用默认名称
    const fileName =
      currentImage.value.src.split("/").pop() || `菲比图集_${Date.now()}.jpg`;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放URL对象
    window.URL.revokeObjectURL(url);

    // 显示下载成功提示
    showDownloadSuccess();
  } catch (error) {
    console.error("下载失败:", error);
    alert("下载失败，请稍后重试");
  }
};

// 下载成功提示
const showDownloadSuccess = () => {
  // 创建一个临时的成功提示
  const successEl = document.createElement("div");
  successEl.className = "download-success-toast";
  successEl.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <span>图片已开始下载</span>
  `;

  document.body.appendChild(successEl);

  // 添加动画类
  setTimeout(() => {
    successEl.classList.add("show");
  }, 10);

  // 3秒后移除
  setTimeout(() => {
    successEl.classList.remove("show");
    setTimeout(() => {
      if (successEl.parentNode) {
        document.body.removeChild(successEl);
      }
    }, 300);
  }, 3000);
};

// 打开lightbox时重置状态
function openLightbox(index: number) {
  if (showLikedOnly.value) {
    // 在筛选模式下，需要找到该图片在原始列表中的索引
    const displayedImg = likedImages.value[index];
    const originalIndex = images.value.findIndex(
      (img) => img.id === displayedImg.id
    );
    currentIndex.value = originalIndex;
  } else {
    currentIndex.value = index;
  }

  lightboxOpen.value = true;
  resetZoom();
  // 阻止背景滚动
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightboxOpen.value = false;
  resetZoom();
  // 恢复背景滚动
  document.body.style.overflow = "";
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

watch(showLikedOnly, (newVal) => {
  if (!newVal && !loading.value && !finished.value) {
    // 从"只看点赞"切换回"全部图片"时，手动触发一次加载
    // 同时重置状态以确保可以继续加载
    nextTick(() => {
      // 确保观察器重新生效
      if (sentinel.value && sentinelObserver) {
        sentinelObserver.unobserve(sentinel.value);
        sentinelObserver.observe(sentinel.value);
      }
      // 如果当前没有图片，立即加载第一页
      if (images.value.length === 0) {
        loadNextPage();
      }
    });
  }
});
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

  // 预加载点赞图片，提升用户体验
  const likedIdsArray = getLikedIds();
  if (likedIdsArray.length > 0) {
    // 延迟加载，不影响主流程
    setTimeout(() => {
      fetchLikedImages();
    }, 1000);
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
@keyframes fadeIn {
  to {
    opacity: 1;
  }
} /* ==================== Lightbox 增强样式 ==================== */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba($phoebe-blue-deep, 0.98);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
  overflow: hidden;
  touch-action: none;

  // 禁止文本选择
  user-select: none;
  -webkit-user-select: none;
}

.lightbox-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.lightbox-close {
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  color: $phoebe-gold;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba($phoebe-blue-dark, 0.95);
    border-color: $phoebe-gold;
    transform: scale(1.1);
  }
}

.lightbox-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  border-radius: 25px;
  padding: 0.75rem 1.25rem;

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    button {
      background: rgba($phoebe-white, 0.1);
      border: 1px solid rgba($phoebe-gold, 0.2);
      color: $phoebe-white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        background: rgba($phoebe-gold, 0.2);
        border-color: $phoebe-gold;
        transform: scale(1.1);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .zoom-level {
      color: $phoebe-gold;
      font-size: 0.9rem;
      font-weight: 600;
      min-width: 50px;
      text-align: center;
    }
  }

  .lightbox-like-btn {
    position: relative;
    background: rgba($phoebe-white, 0.1);
    border: 1px solid rgba($phoebe-gold, 0.2);
    color: $phoebe-white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    svg {
      width: 18px;
      height: 18px;
      transition: all 0.3s ease;
    }

    .like-count {
      position: absolute;
      bottom: -18px;
      font-size: 0.75rem;
      color: $phoebe-white;
      font-weight: 600;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    .like-pulse {
      position: absolute;
      inset: -5px;
      border-radius: 50%;
      opacity: 0;
    }

    &:hover {
      background: rgba($phoebe-gold, 0.2);
      border-color: $phoebe-gold;
      transform: scale(1.1);

      svg {
        transform: scale(1.1);
      }
    }

    &.liked {
      color: #ff4757;
      border-color: rgba(255, 71, 87, 0.5);

      svg {
        fill: #ff4757;
        stroke: #ff4757;
        filter: drop-shadow(0 0 8px rgba(255, 71, 87, 0.5));
      }

      .like-pulse {
        border: 2px solid rgba(255, 71, 87, 0.3);
        animation: heartPulse 1.5s ease-out infinite;
      }
    }
  }

  .lightbox-download-btn {
    background: rgba($phoebe-blue-light, 0.2);
    border: 1px solid rgba($phoebe-blue-light, 0.3);
    color: $phoebe-blue-bright;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      background: rgba($phoebe-blue-light, 0.3);
      border-color: $phoebe-blue-bright;
      transform: scale(1.1);
      color: $phoebe-white;
    }
  }

  .nav-info {
    color: $phoebe-white;
    font-size: 0.9rem;
    font-weight: 500;
    padding-left: 0.75rem;
    border-left: 1px solid rgba($phoebe-white, 0.2);

    .current-index {
      color: $phoebe-gold;
      font-weight: 700;
    }

    .separator {
      margin: 0 4px;
      opacity: 0.6;
    }

    .total-count {
      opacity: 0.8;
    }
  }
}

.lightbox-image-container {
  position: relative;
  max-width: 85vw;
  max-height: 85vh;
  transition: transform 0.2s ease-out;
  will-change: transform;

  img {
    max-width: 100%;
    max-height: 85vh;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba($phoebe-gold, 0.2);
    object-fit: contain;
    display: block;
    user-drag: none;
    -webkit-user-drag: none;
  }
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  color: $phoebe-gold;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: rgba($phoebe-blue-dark, 0.95);
    border-color: $phoebe-gold;
    transform: translateY(-50%) scale(1.1);
  }

  &.prev {
    left: 2rem;
  }

  &.next {
    right: 2rem;
  }
}

.pan-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  color: $phoebe-gold;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  animation: floatHint 3s ease-in-out infinite;

  svg {
    width: 20px;
    height: 20px;
    animation: arrowMove 2s ease-in-out infinite;
  }
}

.download-success-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.95),
    rgba($phoebe-blue-deep, 0.95)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba($phoebe-gold, 0.4);
  color: $phoebe-gold;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 3000;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba($phoebe-gold, 0.1);

  svg {
    width: 20px;
    height: 20px;
  }

  &.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 动画关键帧 */
@keyframes floatHint {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-10px);
  }
}

@keyframes arrowMove {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-5px);
  }
}

@keyframes heartPulse {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .lightbox-controls {
    padding: 1rem;
  }

  .lightbox-close {
    width: 42px;
    height: 42px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .lightbox-toolbar {
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;

    .zoom-controls {
      button {
        width: 32px;
        height: 32px;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .zoom-level {
        font-size: 0.8rem;
        min-width: 40px;
      }
    }

    .lightbox-like-btn,
    .lightbox-download-btn {
      width: 32px;
      height: 32px;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .nav-info {
      font-size: 0.8rem;
      padding-left: 0.5rem;
    }
  }

  .lightbox-nav {
    width: 48px;
    height: 48px;

    svg {
      width: 20px;
      height: 20px;
    }

    &.prev {
      left: 1rem;
    }

    &.next {
      right: 1rem;
    }
  }

  .pan-hint {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

@media (max-width: 480px) {
  .lightbox-toolbar {
    flex-wrap: wrap;
    justify-content: center;
    max-width: 280px;
    margin: 0 auto;

    .nav-info {
      border-left: none;
      border-top: 1px solid rgba($phoebe-white, 0.2);
      padding-left: 0;
      padding-top: 0.5rem;
      width: 100%;
      text-align: center;
      order: 3;
    }
  }

  .lightbox-image-container {
    max-width: 95vw;
    max-height: 75vh;

    img {
      max-height: 75vh;
    }
  }
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
    display: none;
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

/* ==================== 筛选控制样式 ==================== */
.filter-controls {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: rgba($phoebe-white, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba($phoebe-gold, 0.3);
  color: $phoebe-gold;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      transform: none;
      background: rgba($phoebe-white, 0.1);
      border-color: rgba($phoebe-gold, 0.3);
    }
  }

  svg {
    width: 16px;
    height: 16px;
    transition: all 0.3s ease;
  }

  .filter-text {
    transition: all 0.3s ease;
  }

  .filter-glow {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      rgba(255, 71, 87, 0.1) 0%,
      rgba($phoebe-gold, 0.05) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  &:hover:not(:disabled) {
    background: rgba($phoebe-white, 0.15);
    border-color: rgba($phoebe-gold, 0.5);
    transform: translateY(-2px);

    svg {
      transform: scale(1.1);
    }

    .filter-glow {
      opacity: 1;
    }
  }

  &.active {
    background: linear-gradient(
      135deg,
      rgba(255, 71, 87, 0.15) 0%,
      rgba(255, 71, 87, 0.1) 100%
    );
    border-color: rgba(255, 71, 87, 0.4);
    color: #ff6b81;

    svg {
      fill: #ff4757;
      stroke: #ff4757;
      filter: drop-shadow(0 0 6px rgba(255, 71, 87, 0.3));
    }

    &:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgba(255, 71, 87, 0.2) 0%,
        rgba(255, 71, 87, 0.15) 100%
      );
      border-color: rgba(255, 71, 87, 0.6);
    }

    .filter-glow {
      background: linear-gradient(
        135deg,
        rgba(255, 71, 87, 0.2) 0%,
        rgba(255, 107, 129, 0.1) 100%
      );
    }
  }

  &.liked-filter {
    svg {
      transform-origin: center bottom;
    }

    &:hover:not(:disabled) svg {
      animation: heartBeat 0.6s ease;
    }
  }
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba($phoebe-white, 0.3);
  border-top-color: $phoebe-gold;
  border-radius: 50%;
  animation: spinner 0.6s linear infinite;
  margin-left: 0.5rem;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.filter-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: 12px;
  animation: slideIn 0.3s ease;

  .info-text {
    color: #ff6b81;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .loading-text {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .clear-filter {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 71, 87, 0.3);
    color: #ff6b81;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(255, 71, 87, 0.2);
      transform: scale(1.1);
    }
  }
}

/* 筛选模式空状态 */
.filter-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: $phoebe-gold;

  svg {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    opacity: 0.7;
  }
}

/* 点赞图片高亮动画 */
.card.liked-highlight {
  animation: likedPulse 1s ease;

  .card-inner {
    &::before {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 16px;
      background: linear-gradient(45deg, #ff4757, #ff6b81, $phoebe-gold);
      z-index: -1;
      animation: borderGlow 1s ease;
    }

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at center,
        rgba(255, 71, 87, 0.2),
        transparent 70%
      );
      border-radius: inherit;
      animation: fadeOut 1s ease forwards;
    }
  }
}

.card.new-liked {
  .card-inner {
    animation: heartPulse 1.5s ease;

    &::before {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 16px;
      background: linear-gradient(45deg, #ff4757, #ff6b81);
      z-index: -1;
      opacity: 0;
      animation: borderFlash 1.5s ease;
    }
  }

  .like-btn .heart {
    animation: heartExplosion 1.5s ease;
  }
}

/* 动画关键帧 */
@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(255, 71, 87, 0.3);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 2px 12px rgba(255, 71, 87, 0.5);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes likedPulse {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes borderGlow {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes borderFlash {
  0%,
  100% {
    opacity: 0;
  }
  25%,
  75% {
    opacity: 0.8;
  }
}

@keyframes heartExplosion {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(2);
    filter: drop-shadow(0 0 20px rgba(255, 71, 87, 0.8));
  }
  50% {
    transform: scale(1.5);
  }
  75% {
    transform: scale(1.8);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sort-controls {
    align-items: flex-start;
    gap: 0.75rem;
  }

  .filter-btn {
    flex: 1;
    justify-content: center;
  }

  .filter-info {
    display: none;
  }
}
</style>