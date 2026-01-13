<template>
  <div class="wiki-page">
    <!-- 神圣背景装饰 -->
    <div class="sacred-background">
      <div class="bg-glow-1"></div>
      <div class="bg-glow-2"></div>
      <div class="bg-glow-3"></div>
      <div class="floating-ornaments">
        <div
          class="ornament"
          v-for="n in 8"
          :key="n"
          :style="getOrnamentStyle(n)"
        ></div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="wiki-container">
      <!-- 神圣标题区 -->
      <header class="sacred-header">
        <div class="header-content">
          <div class="title-section">
            <h1 class="main-title">
              <span class="title-text">菲比文本分享</span>
              <span class="title-icon">📜</span>
            </h1>
            <p class="sacred-subtitle">愿您的爱永远长存，永不止息。</p>
            <div class="title-decoration">
              <div class="decoration-line"></div>
              <div class="decoration-star">✦</div>
              <div class="decoration-line"></div>
            </div>
          </div>

          <!-- 搜索和操作区域 -->
          <div class="header-actions">
            <div class="search-container">
              <div class="search-icon">🔍</div>
              <input
                v-model="search"
                class="sacred-search"
                placeholder="搜索标题或标签..."
                @focus="onSearchFocus"
                @blur="onSearchBlur"
              />
              <div class="search-hint" v-if="search">
                找到 {{ filteredEntries.length }} 个结果
              </div>
            </div>

            <button class="sacred-button new-entry-btn" @click="openCreate">
              <span class="button-icon">✎</span>
              <span class="button-text">新建词条</span>
              <div class="button-glow"></div>
            </button>
          </div>
        </div>
      </header>

      <!-- 主体内容区 -->
      <main class="sacred-main">
        <!-- 空状态 -->
        <div v-if="filteredEntries.length === 0" class="sacred-empty-state">
          <div class="empty-icon">✨</div>
          <h3 class="empty-title">暂无词条</h3>
          <p class="empty-description">
            {{
              search
                ? "没有找到匹配的词条"
                : "还没有词条，点击上方按钮创建第一个"
            }}
          </p>
          <button
            class="sacred-button empty-action"
            @click="openCreate"
            v-if="!search"
          >
            创建词条
          </button>
        </div>

        <!-- 词条网格 -->
        <div v-else class="entries-grid">
          <div
            v-for="entry in filteredEntries"
            :key="entry.id"
            class="sacred-entry-card"
            @click="openDetail(entry)"
          >
            <!-- 卡片装饰 -->
            <div class="card-glow"></div>
            <div class="card-corner corner-tl">❖</div>
            <div class="card-corner corner-tr">❖</div>
            <div class="card-corner corner-bl">❖</div>
            <div class="card-corner corner-br">❖</div>

            <!-- 卡片内容 -->
            <div class="card-content">
              <div class="card-header">
                <div class="entry-badge" :class="getBadgeClass(entry.slug)">
                  #{{ entry.slug || "未分类" }}
                </div>
                <div class="entry-likes" @click.stop="toggleLike(entry.id)">
                  <span
                    class="like-icon"
                    :class="{ active: isLiked(entry.id) }"
                  >
                    {{ isLiked(entry.id) ? "♥" : "♡" }}
                  </span>
                  <span class="like-count">{{ entry.likes || 0 }}</span>
                </div>
              </div>

              <h3 class="entry-title">{{ entry.title }}</h3>

              <div class="entry-preview">
                {{ truncateContent(entry.content, 120) }}
              </div>

              <div class="entry-footer">
                <div class="entry-author">
                  <span class="author-icon">🖋️</span>
                  <span>{{ entry.author || "匿名" }}</span>
                </div>
                <div class="entry-time">
                  <span class="time-icon">🕒</span>
                  <span>{{ formatTime(entry.updatedAt) }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="entry-actions" v-if="canEdit(entry.id)" @click.stop>
                <button
                  class="action-btn edit-btn"
                  @click.stop="openEdit(entry)"
                >
                  编辑
                </button>
                <button
                  class="action-btn delete-btn"
                  @click.stop="remove(entry.id)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 页脚 -->
      <footer class="sacred-footer">
        <div class="footer-content">
          <div class="footer-text">
            <span class="footer-icon">✨</span>
            共 {{ entries.length }} 个词条 • 愿知识的光辉指引你
          </div>
          <div class="footer-hint">点击词条查看详情 • 长按可快速点赞</div>
        </div>
      </footer>
    </div>

    <!-- 编辑/创建模态框 -->
    <transition name="modal-fade">
      <div
        class="sacred-modal-overlay"
        v-if="showModal"
        @click.self="closeModal"
      >
        <div class="sacred-modal">
          <div class="modal-glow"></div>

          <header class="modal-header">
            <h3 class="modal-title">
              <span class="modal-icon">{{ editing ? "✏️" : "🆕" }}</span>
              {{ editing ? "编辑词条" : "新建词条" }}
            </h3>
            <button class="modal-close" @click="closeModal">
              <span class="close-icon">✕</span>
            </button>
          </header>

          <section class="modal-body">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📝</span>
                标题
              </label>
              <input
                v-model="form.title"
                class="sacred-input"
                placeholder="请输入词条标题..."
                :class="{ 'input-error': !form.title.trim() }"
              />
              <div class="input-hint" v-if="!form.title.trim()">
                标题不能为空
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🏷️</span>
                标签
              </label>
              <input
                v-model="form.slug"
                class="sacred-input"
                placeholder="例如：彩蛋、考据、攻略..."
              />
              <div class="input-hint">用于分类和搜索的简短标签</div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">👤</span>
                作者
              </label>
              <input
                v-model="form.author"
                class="sacred-input"
                placeholder="您的昵称（可选）"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📄</span>
                内容
              </label>
              <textarea
                v-model="form.content"
                class="sacred-textarea"
                rows="8"
                placeholder="在此输入词条详细内容..."
                :class="{ 'input-error': !form.content.trim() }"
              ></textarea>
              <div class="textarea-hint">
                {{ form.content.length }}/5000 字符
              </div>
              <div class="input-hint" v-if="!form.content.trim()">
                内容不能为空
              </div>
            </div>
          </section>

          <footer class="modal-footer">
            <button class="modal-button secondary" @click="closeModal">
              取消
            </button>
            <button
              class="modal-button primary"
              @click="submit"
              :disabled="!canSubmit"
              :class="{ 'button-disabled': !canSubmit }"
            >
              {{ editing ? "保存修改" : "创建词条" }}
              <span class="button-loading" v-if="isSubmitting">⏳</span>
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- 详情模态框 -->
    <transition name="modal-fade">
      <div
        class="sacred-modal-overlay"
        v-if="detailEntry"
        @click.self="detailEntry = null"
      >
        <div class="sacred-modal detail-modal">
          <div class="modal-glow"></div>

          <header class="modal-header">
            <div class="detail-header">
              <div
                class="detail-badge"
                :class="getBadgeClass(detailEntry.slug)"
              >
                #{{ detailEntry.slug || "未分类" }}
              </div>
              <h3 class="modal-title">{{ detailEntry.title }}</h3>
            </div>
            <button class="modal-close" @click="detailEntry = null">
              <span class="close-icon">✕</span>
            </button>
          </header>

          <section class="modal-body">
            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span class="meta-label">作者：</span>
                <span class="meta-value">{{
                  detailEntry.author || "匿名"
                }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🕒</span>
                <span class="meta-label">创建时间：</span>
                <span class="meta-value">{{
                  formatTime(detailEntry.createdAt)
                }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-label">更新时间：</span>
                <span class="meta-value">{{
                  formatTime(detailEntry.updatedAt)
                }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">♥</span>
                <span class="meta-label">点赞数：</span>
                <span class="meta-value">{{ detailEntry.likes || 0 }}</span>
              </div>
            </div>

            <div class="detail-content">
              <div class="content-header">
                <span class="content-icon">📜</span>
                <span class="content-title">内容详情</span>
              </div>
              <div class="content-body">
                {{ detailEntry.content }}
              </div>
            </div>
          </section>

          <footer class="modal-footer">
            <button
              class="modal-button like-btn"
              :class="{ liked: isLiked(detailEntry.id) }"
              @click="toggleLike(detailEntry.id)"
            >
              <span class="like-icon">{{
                isLiked(detailEntry.id) ? "♥" : "♡"
              }}</span>
              {{ isLiked(detailEntry.id) ? "已点赞" : "点赞" }}
              <span class="like-count">({{ detailEntry.likes || 0 }})</span>
            </button>
            <button
              class="modal-button primary"
              v-if="canEdit(detailEntry.id)"
              @click="openEdit(detailEntry)"
            >
              编辑词条
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- 加载指示器 -->
    <transition name="fade">
      <div class="sacred-loading" v-if="isLoading">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-text">加载中...</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getWikiList,
  createWiki,
  updateWiki,
  deleteWiki,
  likeWiki,
} from "@/api/modules/wiki";

// 本地存储自己创建的词条 ID
const LS_MY_WIKI_IDS = "phoebe:wiki:my_ids";
const myWikiIds: string[] = JSON.parse(
  localStorage.getItem(LS_MY_WIKI_IDS) || "[]"
);
const markAsMine = (id: string | number) => {
  if (!myWikiIds.includes(String(id))) {
    myWikiIds.push(String(id));
    localStorage.setItem(LS_MY_WIKI_IDS, JSON.stringify(myWikiIds));
  }
};
const canEdit = (id: string | number) => myWikiIds.includes(String(id));

// 数据状态
const entries = ref<any[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);

// 本地存储键
const LS_LIKED_IDS = "phoebe:wiki:liked_ids";
// 从 localStorage 读取已点赞 id 列表（字符串形式）
const likedIds = ref<string[]>(
  JSON.parse(localStorage.getItem(LS_LIKED_IDS) || "[]")
);

const showModal = ref(false);
const editing = ref(false);
const editingId = ref<string | number | null>(null);
const detailEntry = ref<any>(null);
const form = reactive({ title: "", slug: "", author: "", content: "" });
const search = ref("");
const searchFocused = ref(false);

// 时间格式化
function formatTime(ts: string | number | null | undefined) {
  if (!ts) return "未知时间";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "未知时间";

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "今天";
  } else if (days === 1) {
    return "昨天";
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`;
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }
}

// 加载词条列表
async function loadEntries() {
  isLoading.value = true;
  try {
    const res: any = await getWikiList();
    entries.value = res.data.map((e: any) => ({
      ...e,
      createdAt: e.createdAt || e.created_at,
      updatedAt: e.updatedAt || e.updated_at,
    }));
  } catch (err) {
    console.error(err);
    ElMessage.error("加载词条失败");
  } finally {
    isLoading.value = false;
  }
}

// 打开/关闭弹窗
function openCreate() {
  editing.value = false;
  editingId.value = null;
  form.title = "";
  form.slug = "";
  form.author = "";
  form.content = "";
  showModal.value = true;
}

function openEdit(entry: any) {
  if (!canEdit(entry.id)) {
    ElMessage.warning("只有创建者可以编辑");
    return;
  }
  editing.value = true;
  editingId.value = entry.id;
  form.title = entry.title;
  form.slug = entry.slug;
  form.author = entry.author;
  form.content = entry.content;
  showModal.value = true;
  if (detailEntry.value) {
    detailEntry.value = null;
  }
}

function closeModal() {
  showModal.value = false;
}

const canSubmit = computed(() => form.title.trim() && form.content.trim());

// 提交
async function submit() {
  if (!canSubmit.value) {
    ElMessage.warning("请填写标题和内容");
    return;
  }

  isSubmitting.value = true;
  const payload = {
    title: form.title.trim(),
    author: form.author.trim() || "匿名",
    content: form.content.trim(),
    slug: null,
  };
  if (form.slug.trim()) payload.slug = form.slug.trim();

  try {
    if (editing.value && editingId.value) {
      await updateWiki(editingId.value, payload);
      ElMessage.success("编辑成功");
    } else {
      const res: any = await createWiki(payload);
      markAsMine(res.data.id);
      editingId.value = res.data.id;
      ElMessage.success("创建成功");
    }
    showModal.value = false;
    loadEntries();
  } catch (err) {
    console.error(err);
    ElMessage.error("提交失败");
  } finally {
    isSubmitting.value = false;
  }
}

// 删除
async function remove(id: string | number) {
  if (!canEdit(id)) {
    ElMessage.warning("只有创建者可以删除");
    return;
  }

  if (!confirm("确认删除该词条？此操作不可撤销")) return;

  try {
    await deleteWiki(id);
    const index = myWikiIds.indexOf(String(id));
    if (index !== -1) myWikiIds.splice(index, 1);
    localStorage.setItem(LS_MY_WIKI_IDS, JSON.stringify(myWikiIds));
    ElMessage.success("删除成功");
    loadEntries();
  } catch (err) {
    console.error(err);
    ElMessage.error("删除失败");
  }
}

// 点赞
function persistLikedIds() {
  try {
    localStorage.setItem(LS_LIKED_IDS, JSON.stringify(likedIds.value));
  } catch (e) {
    console.warn("保存 likedIds 失败", e);
  }
}

// 判断是否已点赞（供模板绑定 class/aria-pressed）
function isLiked(id: string | number) {
  return likedIds.value.includes(String(id));
}

// 点赞 / 取消点赞（乐观更新，本地仅存 id，点赞数使用 entry.likes）
async function toggleLike(id: string | number) {
  const entry = entries.value.find((e) => e.id === id);
  if (!entry) return;

  const idStr = String(id);
  const wasLiked = likedIds.value.includes(idStr);

  // 乐观更新 UI（立即反映）
  if (wasLiked) {
    // 取消点赞：保证不低于 0
    entry.likes = Math.max(0, (entry.likes || 0) - 1);
    likedIds.value = likedIds.value.filter((x) => x !== idStr);
  } else {
    // 点赞
    entry.likes = (entry.likes || 0) + 1;
    likedIds.value.push(idStr);
  }
  persistLikedIds();

  try {
    const action = wasLiked ? "unlike" : "like";
    await likeWiki(id, action);
  } catch (err) {
    console.error("toggleLike error", err);
    if (wasLiked) {
      entry.likes = (entry.likes || 0) + 1;
      if (!likedIds.value.includes(idStr)) likedIds.value.push(idStr);
    } else {
      entry.likes = Math.max(0, (entry.likes || 0) - 1);
      likedIds.value = likedIds.value.filter((x) => x !== idStr);
    }
    persistLikedIds();
    ElMessage.error("点赞失败，请稍后重试");
  }
}

// 详情弹窗
async function openDetail(entry: any) {
  detailEntry.value = entry;
}

// 搜索过滤
const filteredEntries = computed(() => {
  const q = String(search.value || "")
    .trim()
    .toLowerCase();
  let list = entries.value;

  // 搜索过滤
  if (q) {
    list = list.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.slug || "").toLowerCase().includes(q) ||
        (e.content || "").toLowerCase().includes(q)
    );
  }

  // 按点赞数排序（默认降序：点赞多的在前）
  return [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
});

// 辅助函数
function truncateContent(content: string, length: number) {
  if (!content) return "";
  return content.length > length
    ? content.substring(0, length) + "..."
    : content;
}

function getBadgeClass(slug: string) {
  const slugMap: Record<string, string> = {
    彩蛋: "badge-egg",
    考据: "badge-research",
    攻略: "badge-guide",
    剧情: "badge-story",
    设定: "badge-setting",
    技巧: "badge-tips",
  };
  return slugMap[slug] || "badge-default";
}

function getOrnamentStyle(index: number) {
  const angle = (index / 8) * Math.PI * 2;
  const radius = 150;
  return {
    left: `calc(50% + ${Math.cos(angle) * radius}px)`,
    top: `calc(50% + ${Math.sin(angle) * radius}px)`,
    animationDelay: `${index * 0.5}s`,
  };
}

function onSearchFocus() {
  searchFocused.value = true;
}

function onSearchBlur() {
  searchFocused.value = false;
}

onMounted(() => {
  loadEntries();
});

onUnmounted(() => {
  // 清理工作
});
</script>

<style scoped lang="scss">
/* ==== 菲比风格配色变量 ==== */
$phoebe-gold: #f6de97;
$phoebe-gold-light: #fff9e6;
$phoebe-blue-dark: #0c1e3a;
$phoebe-blue-deep: #07122b;
$phoebe-blue-light: #3b7be0;
$phoebe-blue-bright: #6aa7ff;
$phoebe-white: #fafcfd;
$phoebe-white-trans: rgba(250, 252, 253, 0.95);

/* 辅助变量 */
$border-radius: 16px;
$transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
$shadow-sm: 0 4px 12px rgba($phoebe-blue-dark, 0.1);
$shadow-md: 0 8px 32px rgba($phoebe-blue-dark, 0.15);
$shadow-lg: 0 16px 64px rgba($phoebe-blue-dark, 0.2);
$shadow-gold: 0 0 20px rgba($phoebe-gold, 0.3);
$shadow-blue: 0 0 20px rgba($phoebe-blue-bright, 0.3);

/* 基础样式重置 */
.wiki-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    $phoebe-blue-deep 0%,
    $phoebe-blue-dark 100%
  );
  color: $phoebe-white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC",
    "PingFang SC", sans-serif;
  position: relative;
  overflow-x: hidden;
  padding: 20px;
  box-sizing: border-box;
  padding-top: 80px;
  &::before {
    content: "";
    position: fixed;
    inset: 0;
    background: radial-gradient(
        circle at 20% 80%,
        rgba($phoebe-gold, 0.05) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba($phoebe-blue-bright, 0.05) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
}

/* 背景装饰 */
.sacred-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;

  .bg-glow-1 {
    position: absolute;
    top: 10%;
    left: 10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba($phoebe-gold, 0.1) 0%,
      transparent 70%
    );
    filter: blur(40px);
    animation: float 20s ease-in-out infinite;
  }

  .bg-glow-2 {
    position: absolute;
    bottom: 10%;
    right: 10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      rgba($phoebe-blue-bright, 0.08) 0%,
      transparent 70%
    );
    filter: blur(60px);
    animation: float 25s ease-in-out infinite reverse;
  }

  .bg-glow-3 {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      rgba($phoebe-blue-light, 0.05) 0%,
      transparent 70%
    );
    filter: blur(80px);
    transform: translate(-50%, -50%);
  }

  .floating-ornaments {
    position: absolute;
    inset: 0;

    .ornament {
      position: absolute;
      width: 8px;
      height: 8px;
      background: $phoebe-gold;
      border-radius: 50%;
      filter: blur(1px);
      opacity: 0.6;
      animation: twinkle 3s ease-in-out infinite;

      &::after {
        content: "";
        position: absolute;
        inset: -4px;
        border: 1px solid rgba($phoebe-gold, 0.3);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      }
    }
  }
}

/* 容器 */
.wiki-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* 神圣标题区 */
.sacred-header {
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.8) 0%,
    rgba($phoebe-blue-deep, 0.9) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: $border-radius;
  border: 1px solid rgba($phoebe-gold, 0.1);
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: $shadow-md, $shadow-gold;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba($phoebe-gold, 0.05) 50%,
      transparent 100%
    );
    pointer-events: none;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
}

.title-section {
  text-align: center;

  .main-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(
      135deg,
      $phoebe-gold 0%,
      $phoebe-blue-bright 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-flex;
    align-items: center;
    gap: 20px;

    .title-icon {
      font-size: 3rem;
      filter: drop-shadow(0 4px 8px rgba($phoebe-gold, 0.3));
    }
  }

  .sacred-subtitle {
    font-size: 1.2rem;
    color: rgba($phoebe-white, 0.8);
    margin: 20px 0 30px;
    font-weight: 300;
    letter-spacing: 2px;
  }

  .title-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    margin-top: 30px;

    .decoration-line {
      width: 100px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba($phoebe-gold, 0.5) 50%,
        transparent 100%
      );
    }

    .decoration-star {
      font-size: 2rem;
      color: $phoebe-gold;
      animation: rotate 10s linear infinite;
    }
  }
}

/* 搜索和操作区域 */
.header-actions {
  display: flex;
  gap: 20px;
  align-items: center;

  .search-container {
    flex: 1;
    position: relative;

    .search-icon {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.2rem;
      color: rgba($phoebe-white, 0.6);
      transition: $transition;
    }

    .sacred-search {
      width: 100%;
      padding: 18px 20px 18px 60px;
      background: rgba($phoebe-blue-deep, 0.6);
      border: 1px solid rgba($phoebe-gold, 0.2);
      border-radius: $border-radius;
      color: $phoebe-white;
      font-size: 1.1rem;
      transition: $transition;

      &::placeholder {
        color: rgba($phoebe-white, 0.5);
      }

      &:focus {
        outline: none;
        border-color: $phoebe-gold;
        box-shadow: 0 0 0 3px rgba($phoebe-gold, 0.1), $shadow-gold;
        background: rgba($phoebe-blue-deep, 0.8);

        & + .search-icon {
          color: $phoebe-gold;
        }
      }
    }

    .search-hint {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
      color: rgba($phoebe-white, 0.6);
      background: rgba($phoebe-blue-dark, 0.5);
      padding: 4px 12px;
      border-radius: 12px;
    }
  }
}

/* 神圣按钮 */
.sacred-button {
  position: relative;
  padding: 18px 40px;
  background: linear-gradient(
    135deg,
    $phoebe-gold 0%,
    $phoebe-blue-bright 100%
  );
  border: none;
  border-radius: $border-radius;
  color: $phoebe-blue-deep;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: $transition;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  overflow: hidden;

  .button-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba($phoebe-white, 0.3) 0%,
      transparent 50%
    );
    opacity: 0;
    transition: $transition;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg, $shadow-gold;

    .button-glow {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &.new-entry-btn {
    min-width: 180px;
  }

  &.empty-action {
    margin-top: 20px;
    padding: 15px 30px;
  }
}

/* 主体内容区 */
.sacred-main {
  min-height: 60vh;
}

/* 空状态 */
.sacred-empty-state {
  text-align: center;
  padding: 80px 40px;
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.7) 0%,
    rgba($phoebe-blue-deep, 0.8) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: $border-radius;
  border: 1px solid rgba($phoebe-gold, 0.1);
  box-shadow: $shadow-md;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    display: inline-block;
    animation: bounce 2s ease-in-out infinite;
  }

  .empty-title {
    font-size: 2rem;
    margin: 0 0 15px;
    color: $phoebe-gold;
  }

  .empty-description {
    font-size: 1.1rem;
    color: rgba($phoebe-white, 0.7);
    max-width: 400px;
    margin: 0 auto 30px;
    line-height: 1.6;
  }
}

/* 词条网格 */
.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

/* 神圣词条卡片 */
.sacred-entry-card {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.8) 0%,
    rgba($phoebe-blue-deep, 0.9) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: $border-radius;
  border: 1px solid rgba($phoebe-gold, 0.1);
  padding: 30px;
  cursor: pointer;
  transition: $transition;
  overflow: hidden;
  box-shadow: $shadow-md;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba($phoebe-gold, 0.05) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: $transition;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: $shadow-lg, $shadow-gold;

    &::before {
      opacity: 1;
    }

    .card-glow {
      opacity: 1;
    }
  }
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba($phoebe-gold, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: $transition;
}

.card-corner {
  position: absolute;
  font-size: 1.2rem;
  color: rgba($phoebe-gold, 0.3);

  &.corner-tl {
    top: 15px;
    left: 15px;
  }
  &.corner-tr {
    top: 15px;
    right: 15px;
  }
  &.corner-bl {
    bottom: 15px;
    left: 15px;
  }
  &.corner-br {
    bottom: 15px;
    right: 15px;
  }
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entry-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;

  &.badge-egg {
    background: linear-gradient(
      135deg,
      rgba(255, 215, 0, 0.2),
      rgba(255, 165, 0, 0.1)
    );
    color: #ffd700;
    border: 1px solid rgba(255, 215, 0, 0.3);
  }

  &.badge-research {
    background: linear-gradient(
      135deg,
      rgba(59, 123, 224, 0.2),
      rgba(106, 167, 255, 0.1)
    );
    color: $phoebe-blue-bright;
    border: 1px solid rgba($phoebe-blue-bright, 0.3);
  }

  &.badge-guide {
    background: linear-gradient(
      135deg,
      rgba(0, 200, 83, 0.2),
      rgba(0, 150, 136, 0.1)
    );
    color: #00c853;
    border: 1px solid rgba(0, 200, 83, 0.3);
  }

  &.badge-default {
    background: linear-gradient(
      135deg,
      rgba($phoebe-gold, 0.2),
      rgba($phoebe-gold, 0.1)
    );
    color: $phoebe-gold;
    border: 1px solid rgba($phoebe-gold, 0.3);
  }
}

.entry-likes {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba($phoebe-blue-dark, 0.5);
  border-radius: 20px;
  border: 1px solid rgba($phoebe-gold, 0.2);
  cursor: pointer;
  transition: $transition;

  &:hover {
    background: rgba($phoebe-gold, 0.1);
    transform: scale(1.05);
  }

  .like-icon {
    font-size: 1.2rem;
    transition: $transition;

    &.active {
      color: #ff4757;
      animation: heartBeat 0.6s ease;
    }
  }

  .like-count {
    font-weight: 600;
    color: $phoebe-white;
  }
}

.entry-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: $phoebe-white;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.entry-preview {
  font-size: 1rem;
  color: rgba($phoebe-white, 0.7);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.entry-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba($phoebe-gold, 0.1);

  .entry-author,
  .entry-time {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: rgba($phoebe-white, 0.6);

    .author-icon,
    .time-icon {
      font-size: 1rem;
    }
  }
}

.entry-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;

  .action-btn {
    padding: 8px 16px;
    border-radius: 12px;
    border: none;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: $transition;
    flex: 1;

    &.edit-btn {
      background: rgba($phoebe-blue-bright, 0.2);
      color: $phoebe-blue-bright;
      border: 1px solid rgba($phoebe-blue-bright, 0.3);

      &:hover {
        background: rgba($phoebe-blue-bright, 0.3);
        transform: translateY(-2px);
      }
    }

    &.delete-btn {
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
      border: 1px solid rgba(255, 71, 87, 0.3);

      &:hover {
        background: rgba(255, 71, 87, 0.3);
        transform: translateY(-2px);
      }
    }
  }
}

/* 页脚 */
.sacred-footer {
  margin-top: 40px;
  padding: 30px;
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.7) 0%,
    rgba($phoebe-blue-deep, 0.8) 100%
  );
  backdrop-filter: blur(20px);
  border-radius: $border-radius;
  border: 1px solid rgba($phoebe-gold, 0.1);
  box-shadow: $shadow-md;
  text-align: center;

  .footer-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .footer-text {
    font-size: 1.1rem;
    color: rgba($phoebe-white, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .footer-icon {
      font-size: 1.3rem;
      animation: twinkle 2s ease-in-out infinite;
    }
  }

  .footer-hint {
    font-size: 0.9rem;
    color: rgba($phoebe-white, 0.5);
  }
}

/* 模态框 */
.sacred-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.sacred-modal {
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(
    135deg,
    rgba($phoebe-blue-dark, 0.95) 0%,
    rgba($phoebe-blue-deep, 0.98) 100%
  );
  backdrop-filter: blur(30px);
  border-radius: $border-radius;
  border: 1px solid rgba($phoebe-gold, 0.2);
  box-shadow: $shadow-lg, $shadow-gold;
  padding: 40px;

  .modal-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      rgba($phoebe-gold, 0.1) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  &.detail-modal {
    max-width: 900px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba($phoebe-gold, 0.2);

  .detail-header {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .modal-title {
    font-size: 2rem;
    margin: 0;
    color: $phoebe-gold;
    display: flex;
    align-items: center;
    gap: 15px;

    .modal-icon {
      font-size: 2rem;
    }
  }

  .modal-close {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: rgba($phoebe-blue-dark, 0.6);
    color: rgba($phoebe-white, 0.8);
    cursor: pointer;
    transition: $transition;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba($phoebe-gold, 0.1);
      color: $phoebe-gold;
      transform: rotate(90deg);
    }

    .close-icon {
      font-size: 1.5rem;
    }
  }
}

.modal-body {
  .form-group {
    margin-bottom: 25px;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    color: $phoebe-gold;

    .label-icon {
      font-size: 1.2rem;
    }
  }

  .sacred-input,
  .sacred-textarea {
    width: 100%;
    padding: 16px 20px;
    background: rgba($phoebe-blue-deep, 0.6);
    border: 1px solid rgba($phoebe-gold, 0.2);
    border-radius: 12px;
    color: $phoebe-white;
    font-size: 1rem;
    transition: $transition;
    box-sizing: border-box;

    &::placeholder {
      color: rgba($phoebe-white, 0.5);
    }

    &:focus {
      outline: none;
      border-color: $phoebe-gold;
      box-shadow: 0 0 0 3px rgba($phoebe-gold, 0.1);
      background: rgba($phoebe-blue-deep, 0.8);
    }

    &.input-error {
      border-color: #ff4757;
    }
  }

  .sacred-textarea {
    resize: vertical;
    min-height: 150px;
    line-height: 1.6;
    font-family: inherit;
  }

  .input-hint,
  .textarea-hint {
    font-size: 0.9rem;
    color: rgba($phoebe-white, 0.5);
    margin-top: 8px;
  }

  /* 详情模态框样式 */
  .detail-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    background: linear-gradient(
      135deg,
      rgba($phoebe-gold, 0.2),
      rgba($phoebe-gold, 0.1)
    );
    color: $phoebe-gold;
    border: 1px solid rgba($phoebe-gold, 0.3);
  }

  .detail-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
    padding: 25px;
    background: rgba($phoebe-blue-dark, 0.5);
    border-radius: 12px;
    border: 1px solid rgba($phoebe-gold, 0.1);

    .meta-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1rem;

      .meta-icon {
        font-size: 1.2rem;
        color: $phoebe-gold;
      }

      .meta-label {
        color: rgba($phoebe-white, 0.6);
      }

      .meta-value {
        color: $phoebe-white;
        font-weight: 600;
      }
    }
  }

  .detail-content {
    .content-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba($phoebe-gold, 0.2);

      .content-icon {
        font-size: 2rem;
        color: $phoebe-gold;
      }

      .content-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: $phoebe-white;
      }
    }

    .content-body {
      font-size: 1.1rem;
      line-height: 1.8;
      color: rgba($phoebe-white, 0.9);
      white-space: pre-wrap;
      padding: 25px;
      background: rgba($phoebe-blue-dark, 0.3);
      border-radius: 12px;
      border-left: 4px solid $phoebe-gold;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid rgba($phoebe-gold, 0.2);

  .modal-button {
    padding: 14px 28px;
    border-radius: 12px;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: $transition;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 120px;

    &.primary {
      background: linear-gradient(
        135deg,
        $phoebe-gold 0%,
        $phoebe-blue-bright 100%
      );
      color: $phoebe-blue-deep;

      &:hover:not(.button-disabled) {
        transform: translateY(-2px);
        box-shadow: $shadow-md, $shadow-gold;
      }

      &.button-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &.secondary {
      background: rgba($phoebe-blue-dark, 0.6);
      color: $phoebe-white;
      border: 1px solid rgba($phoebe-gold, 0.2);

      &:hover {
        background: rgba($phoebe-gold, 0.1);
        transform: translateY(-2px);
      }
    }

    &.like-btn {
      background: rgba($phoebe-blue-dark, 0.6);
      color: $phoebe-white;
      border: 1px solid rgba(255, 71, 87, 0.2);

      &:hover {
        background: rgba(255, 71, 87, 0.1);
        transform: translateY(-2px);
      }

      &.liked {
        background: rgba(255, 71, 87, 0.2);
        color: #ff4757;

        &:hover {
          background: rgba(255, 71, 87, 0.3);
        }
      }

      .like-icon {
        font-size: 1.2rem;
      }

      .like-count {
        font-weight: 400;
      }
    }

    .button-loading {
      animation: spin 1s linear infinite;
    }
  }
}

/* 加载指示器 */
.sacred-loading {
  position: fixed;
  inset: 0;
  background: rgba($phoebe-blue-dark, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .spinner-ring {
      width: 60px;
      height: 60px;
      border: 4px solid rgba($phoebe-gold, 0.2);
      border-top-color: $phoebe-gold;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-text {
      color: $phoebe-gold;
      font-size: 1.2rem;
      font-weight: 600;
    }
  }
}

/* 动画定义 */
@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -20px) rotate(2deg);
  }
  50% {
    transform: translate(-15px, 15px) rotate(-1deg);
  }
  75% {
    transform: translate(10px, -10px) rotate(1deg);
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes heartBeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .sacred-modal {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .sacred-modal {
    transform: translateY(30px) scale(0.95);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .wiki-page {
    padding: 10px;
  }

  .sacred-header {
    padding: 25px;

    .header-content {
      gap: 25px;
    }
  }

  .title-section {
    .main-title {
      font-size: 2.2rem;
      flex-direction: column;
      gap: 10px;

      .title-icon {
        font-size: 2.2rem;
      }
    }

    .sacred-subtitle {
      font-size: 1rem;
      margin: 15px 0 20px;
    }

    .title-decoration {
      gap: 15px;
      margin-top: 20px;

      .decoration-line {
        width: 50px;
      }

      .decoration-star {
        font-size: 1.5rem;
      }
    }
  }

  .header-actions {
    flex-direction: column;

    .search-container {
      width: 100%;
    }

    .sacred-button.new-entry-btn {
      width: 100%;
      min-width: unset;
    }
  }

  .entries-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .sacred-entry-card {
    padding: 20px;
  }

  .sacred-modal {
    padding: 25px;
  }

  .modal-header {
    .modal-title {
      font-size: 1.5rem;

      .modal-icon {
        font-size: 1.5rem;
      }
    }

    .detail-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }

  .modal-body {
    .detail-meta {
      grid-template-columns: 1fr;
    }
  }

  .modal-footer {
    flex-direction: column;

    .modal-button {
      width: 100%;
    }
  }
}

@media (max-width: 480px) {
  .sacred-header {
    padding: 20px;
  }

  .title-section .main-title {
    font-size: 1.8rem;
  }

  .entry-title {
    font-size: 1.3rem;
  }

  .sacred-modal {
    padding: 20px;
  }
}
</style>