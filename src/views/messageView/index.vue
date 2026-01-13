<template>
  <div class="megumi-message-board" aria-live="polite">
    <!-- 半透明顶部标题 -->
    <header class="board-header" role="banner">
      <div class="title-wrap">
        <!-- 修改显示总条数 -->
        <span>(共{{ totalMessages }}条留言)</span>
        <p class="subtitle">在这里，思念与微光一同流淌。</p>
      </div>
    </header>

    <!-- 留言展示区 -->
    <section class="message-list" ref="listRef">
      <transition-group name="msg" tag="div" class="message-list-inner">
        <!-- skeleton loading -->
        <div v-if="loading && !hasMore" class="skeleton-wrap" key="skeleton">
          <div class="skeleton" v-for="i in 4" :key="i">
            <div class="sk-avatar"></div>
            <div class="sk-lines">
              <div class="sk-line short"></div>
              <div class="sk-line"></div>
            </div>
          </div>
        </div>

        <!-- messages -->
        <div
          v-for="(msg, idx) in messages"
          :key="msg.id || msg._tempId || idx"
          class="message-card"
          :data-index="idx"
          tabindex="0"
          role="article"
          :aria-label="`留言来自 ${msg.name || '匿名'}，内容：${msg.content}`"
        >
          <!-- 内容不变 -->
          <div class="message-meta">
            <div class="left-meta">
              <div class="name-avatar" :title="msg.name || '匿名'">
                {{ getInitial(msg.name) }}
              </div>
              <div class="meta-texts">
                <div class="message-name">{{ msg.name || "匿名" }}</div>
                <div class="message-time">{{ formatTime(msg.created_at) }}</div>
              </div>
            </div>
            <div class="meta-actions" aria-hidden="true">
              <span class="halo-star">✦</span>
            </div>
          </div>

          <p class="message-content">{{ msg.content }}</p>
        </div>

        <!-- 加载更多提示 -->
        <div v-if="loadingMore" class="loading-more" key="loading-more">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          正在加载更多留言...
        </div>

        <!-- 没有更多数据提示 -->
        <div
          v-if="!hasMore && messages.length > 0 && !loading"
          class="no-more"
          key="no-more"
        >
          ✨ 已加载全部留言
        </div>
        <div
          v-if="hasMore"
          ref="sentinelRef"
          class="sentinel"
          key="sentinel"
        ></div>
      </transition-group>
    </section>
    <!-- 底部发送区 -->
    <section class="message-form" aria-label="写下你的留言">
      <label class="sr-only" for="mb-name">你的昵称</label>
      <input
        id="mb-name"
        v-model="name"
        type="text"
        placeholder="你的昵称"
        @keydown.enter.prevent
      />

      <label class="sr-only" for="mb-content">留言内容</label>
      <textarea
        id="mb-content"
        v-model="content"
        placeholder="写下你的留言..."
        @keydown.ctrl.enter.prevent="submitMessage"
        @input="autoGrow"
        ref="textareaRef"
      />

      <div class="form-row">
        <div class="hint">按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快捷发送</div>
        <button @click="submitMessage" :disabled="isSending || !content.trim()">
          <span v-if="!isSending">发送</span>
          <span v-else>发送中…</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watch } from "vue";
import { getMessageList, createMessage } from "@/api/modules/message";

// 分页相关变量
const currentPage = ref(1);
const pageSize = ref(50);
const totalMessages = ref(0);
const hasMore = ref(true);
const loading = ref(true);
const loadingMore = ref(false);
const isSending = ref(false);

const messages = ref<any[]>([]);
const name = ref(localStorage.getItem("feibi_name") || "");
const content = ref("");
const listRef = ref<HTMLElement | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
// Intersection Observer
let observer: IntersectionObserver | null = null;

// 防抖处理
let scrollTimer: number | null = null;

// 获取留言列表
const fetchMessages = async (loadMore = false) => {
  if (loadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }

  try {
    const res = await getMessageList({
      page: currentPage.value,
      pageSize: pageSize.value,
    });

    if (loadMore) {
      // 追加数据
      // 追加数据（过滤重复）
      const newMessages = res.data || [];
      const existingIds = new Set(messages.value.map((m) => m.id));
      const filteredMessages = newMessages.filter(
        (msg) => !existingIds.has(msg.id)
      );
      messages.value = [...messages.value, ...filteredMessages];
    } else {
      // 首次加载
      messages.value = res.data || [];
      // 重置总条数（如果接口返回了总数）
      totalMessages.value = res.pagination.total;
    }

    // 判断是否还有更多数据
    if (res.pagination.total > pageSize.value * currentPage.value) {
      hasMore.value = true;
    } else {
      hasMore.value = false;
    }

    await nextTick();
    // 如果有更多数据且是追加加载，重新观察哨兵元素
    if (loadMore && hasMore.value && sentinelRef.value && observer) {
      observer.unobserve(sentinelRef.value);
      observer.observe(sentinelRef.value);
    }
  } catch (err) {
    console.error(err);
    hasMore.value = false;
  } finally {
    if (loadMore) {
      loadingMore.value = false;
    } else {
      loading.value = false;
    }
  }
};
// 初始化 Intersection Observer
const initObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && !loadingMore.value && hasMore.value) {
        loadMoreMessages();
      }
    },
    {
      root: listRef.value, // 使用列表容器作为根
      rootMargin: "100px", // 提前100px触发
      threshold: 0.1, // 10%可见时触发
    }
  );

  // 等待列表渲染后观察哨兵元素
  nextTick(() => {
    if (sentinelRef.value && observer) {
      observer.observe(sentinelRef.value);
    }
  });
};

// 加载更多
const loadMoreMessages = async () => {
  if (loadingMore.value || !hasMore.value) return;

  currentPage.value++;
  await fetchMessages(true);
};

// 提交留言（需要重置分页）
const submitMessage = async () => {
  if (!content.value.trim() || isSending.value) return;

  isSending.value = true;
  const payload = { name: name.value || "匿名", content: content.value };

  try {
    localStorage.setItem("feibi_name", name.value);
    content.value = "";
    await nextTick();

    // 发送请求
    await createMessage(payload);

    // 重置分页，重新加载第一页
    currentPage.value = 1;
    hasMore.value = true;
    messages.value = []; // 清空当前列表
    await fetchMessages();
    nextTick(() => {
      initObserver();
    });
    // 滚动到顶部
    if (listRef.value) {
      listRef.value.scrollTop = 0;
    }
  } catch (err) {
    console.error(err);
  } finally {
    isSending.value = false;
  }
};

// 其他工具函数保持不变
const formatTime = (time: string) => {
  if (!time) return "";
  const d = new Date(time);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const getInitial = (n?: string) => {
  if (!n) return "匿";
  return n.trim().slice(0, 1).toUpperCase();
};

const autoGrow = (e?: Event) => {
  const ta = textareaRef.value;
  if (!ta) return;
  ta.style.height = "auto";
  const h = Math.min(ta.scrollHeight, 220);
  ta.style.height = h + "px";
};
// 监听 messages 变化，确保哨兵元素在正确位置
watch(messages, () => {
  nextTick(() => {
    if (sentinelRef.value && observer) {
      observer.unobserve(sentinelRef.value);
      observer.observe(sentinelRef.value);
    }
  });
});

onMounted(() => {
  fetchMessages();
  nextTick(() => {
    autoGrow();
    initObserver();
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped lang="scss">
/* 菲比风格配色变量 */
$phoebe-gold: #f6de97;
$phoebe-gold-light: #fff9e6;
$phoebe-blue-dark: #0c1e3a;
$phoebe-blue-deep: #07122b;
$phoebe-blue-light: #3b7be0;
$phoebe-blue-bright: #6aa7ff;
$phoebe-white: #fafcfd;
$phoebe-white-trans: rgba(250, 252, 253, 0.95);

/* 扩展透明度变量 */
$gold-trans-10: rgba(246, 222, 151, 0.1);
$gold-trans-20: rgba(246, 222, 151, 0.2);
$gold-trans-30: rgba(246, 222, 151, 0.3);
$gold-trans-40: rgba(246, 222, 151, 0.4);
$blue-trans-10: rgba(59, 123, 224, 0.1);
$blue-trans-20: rgba(59, 123, 224, 0.2);
$blue-trans-30: rgba(59, 123, 224, 0.3);
$dark-trans-40: rgba(7, 18, 43, 0.4);
$dark-trans-60: rgba(7, 18, 43, 0.6);
$white-trans-20: rgba(250, 252, 253, 0.2);
$white-trans-50: rgba(250, 252, 253, 0.5);
$white-trans-80: rgba(250, 252, 253, 0.8);

/* 页面容器 */
.megumi-message-board {
  min-height: 100vh;
  padding-top: 120px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
      160deg,
      $phoebe-blue-deep 0%,
      $phoebe-blue-dark 100%
    ),
    radial-gradient(circle at 20% 20%, $gold-trans-10 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, $blue-trans-10 0%, transparent 40%);
  font-family: "Noto Sans SC", "Segoe UI", system-ui, sans-serif;
  color: $phoebe-white;
  overflow: hidden;
  position: relative;

  /* 背景装饰元素 */
  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(180deg, $phoebe-blue-deep 0%, transparent 100%);
    z-index: 1;
    pointer-events: none;
  }
}

/* 顶部标题栏 */
.board-header {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  padding: 1.5rem 1rem;
  background: $dark-trans-60;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid $gold-trans-30;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.title-wrap {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  span {
    font-style: italic;
    font-size: 1rem;
    background: linear-gradient(90deg, $phoebe-gold, $phoebe-gold-light);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    margin: 0;
    font-size: 1rem;
    color: $phoebe-white-trans;
    font-style: italic;
    text-align: right;
    max-width: 300px;
  }
}

/* 留言列表区域 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1rem;
  position: relative;
  z-index: 2;
  padding-bottom: 300px;
  & > .message-list-inner {
    min-height: calc(100% + 1px); /* 确保内容撑开 */
  }
}

.message-list-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* 骨架屏加载状态 */
.skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: $dark-trans-40;
  backdrop-filter: blur(10px);
  border: 1px solid $blue-trans-20;
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

.sk-avatar {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(90deg, $gold-trans-20, $gold-trans-10);
  flex-shrink: 0;
}

.sk-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sk-line {
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(90deg, $blue-trans-20, $blue-trans-10);

  &.short {
    width: 40%;
  }
}

/* 留言卡片 */
.message-card {
  background: $dark-trans-40;
  backdrop-filter: blur(20px);
  border: 1px solid $blue-trans-20;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    border-color: $gold-trans-40;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px $gold-trans-20;

    &::before {
      opacity: 1;
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, $phoebe-gold, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.left-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.name-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: $phoebe-blue-dark;
  background: linear-gradient(135deg, $phoebe-gold, #f8e5b9);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.meta-texts {
  flex: 1;
  min-width: 0;
}

.message-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: $phoebe-gold;
  margin-bottom: 0.3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 0.85rem;
  color: $white-trans-50;
  font-weight: 400;
}

.meta-actions {
  flex-shrink: 0;

  .halo-star {
    display: inline-block;
    color: $phoebe-gold;
    font-size: 1.2rem;
    animation: haloPulse 3s ease-in-out infinite;
    filter: drop-shadow(0 0 8px rgba(246, 222, 151, 0.3));
  }
}

@keyframes haloPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(180deg);
  }
}

.message-content {
  font-size: 1rem;
  line-height: 1.6;
  color: $white-trans-80;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  position: relative;
  padding-left: 0.5rem;

  &::before {
    content: "❝";
    position: absolute;
    left: -1.2rem;
    top: -0.5rem;
    color: $gold-trans-40;
    font-size: 1.5rem;
    opacity: 0.5;
  }
}
.sentinel {
  height: 1px;
  width: 100%;
  background: transparent;
  pointer-events: none;
}
.loading-more {
  text-align: center;
  padding: 2rem 0;
  color: $white-trans-50;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .loading-dots {
    display: flex;
    gap: 0.5rem;

    span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $phoebe-gold;
      animation: dotPulse 1.4s ease-in-out infinite;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

@keyframes dotPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.no-more {
  text-align: center;
  padding: 2rem 0;
  color: $gold-trans-40;
  font-size: 0.9rem;
  font-style: italic;
}

/* 优化滚动容器 */
.message-list {
  &::-webkit-scrollbar-thumb {
    &:hover {
      background: rgba(246, 222, 151, 0.6);
    }
  }
}
/* 留言表单 */
.message-form {
  position: fixed;
  bottom: 0px;
  left: 0;
  right: 0;
  padding: 1.5rem 1rem;
  background: $dark-trans-60;
  backdrop-filter: blur(30px);
  border-top: 1px solid $gold-trans-30;
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

#mb-name,
#mb-content {
  width: 100%;
  padding: 0.9rem 1.2rem;
  margin-bottom: 1rem;
  background: $dark-trans-40;
  border: 1px solid $blue-trans-30;
  border-radius: 12px;
  color: $phoebe-white;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: $white-trans-50;
  }

  &:focus {
    border-color: $phoebe-gold;
    background: $dark-trans-60;
    box-shadow: 0 0 0 2px $gold-trans-10;
  }
}

#mb-content {
  min-height: 80px;
  max-height: 200px;
  resize: vertical;
  line-height: 1.5;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.hint {
  color: $white-trans-50;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  kbd {
    background: $blue-trans-20;
    border: 1px solid $blue-trans-30;
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
    font-family: monospace;
    color: $phoebe-white;
  }
}

button {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, $phoebe-gold, #e9c36a);
  color: $phoebe-blue-dark;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px $gold-trans-30;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: linear-gradient(135deg, $gold-trans-20, $gold-trans-10);
    color: $white-trans-50;
  }
}

/* 消息过渡动画 */
.msg-enter-from,
.msg-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.msg-enter-active,
.msg-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.msg-enter-to,
.msg-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .megumi-message-board {
    padding-top: 120px;
  }

  .board-header {
    padding: 1rem;
  }

  .title-wrap {
    align-items: flex-start;
    gap: 0.5rem;

    span {
      font-size: 0.9rem;
    }

    .subtitle {
      font-size: 0.9rem;
      text-align: left;
    }
  }

  .message-list {
    padding: 1rem 0.5rem 300px;
  }

  .message-card {
    padding: 1rem;
    border-radius: 12px;
  }

  .name-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .message-name {
    font-size: 1rem;
  }

  .message-time {
    font-size: 0.8rem;
  }

  .message-content {
    font-size: 0.95rem;
  }
  .loading-more,
  .no-more {
    padding: 1.5rem 0;
    font-size: 0.85rem;
  }
  .message-form {
    padding: 1rem;
    bottom: 40px;
  }

  #mb-name,
  #mb-content {
    padding: 0.8rem 1rem;
    font-size: 0.95rem;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .hint {
    justify-content: center;
  }

  button {
    width: 100%;
    padding: 0.9rem;
  }
}

@media (max-width: 480px) {
  .message-card {
    margin: 0 0.5rem;
  }

  .left-meta {
    gap: 0.8rem;
  }

  .meta-actions .halo-star {
    font-size: 1rem;
  }
}
</style>