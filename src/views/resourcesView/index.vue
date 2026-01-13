<template>
  <div class="yuzuki-resources">
    <header class="hero">
      <div class="hero-inner">
        <h1>资源分享</h1>
        <p class="subtitle">可自由上传关于菲比的相关链接</p>
      </div>
    </header>

    <main class="container">
      <section class="uploader" :class="{ collapsed: uploaderCollapsed }">
        <div class="uploader-head">
          <button
            class="toggle"
            @click="toggleUploader"
            :aria-expanded="!uploaderCollapsed"
          >
            <span v-if="uploaderCollapsed">展开上传区</span>
            <span v-else>收起上传区</span>
          </button>
        </div>

        <form
          @submit.prevent="addResource"
          class="upload-form"
          :aria-hidden="uploaderCollapsed"
        >
          <div class="row">
            <input
              v-model="form.title"
              type="text"
              placeholder="标题（必填，如果有解压码之类的也写这里吧）"
              aria-label="标题"
            />
            <input
              v-model="form.type"
              type="text"
              placeholder="链接类型(网页链接、b站视频、网盘链接等等)"
              aria-label="来源"
            />
          </div>

          <div class="row">
            <input
              v-model="form.uploader"
              type="text"
              placeholder="上传人（可选）"
              aria-label="上传人"
            />
            <input
              v-model="form.link"
              type="url"
              placeholder="链接(只输入网址不能有中文)"
              aria-label="链接"
            />
          </div>

          <div class="actions">
            <button type="submit" class="btn primary">上传</button>
          </div>
        </form>
      </section>

      <section class="list">
        <div class="list-header">
          <h2>资源列表（{{ resources.length }}）</h2>
          <div class="sort">
            <label>
              排序：
              <select v-model="sortBy">
                <option value="time">按时间（新→旧）</option>
                <option value="likes">按点赞（高→低）</option>
              </select>
            </label>
          </div>
        </div>

        <ul class="items">
          <li v-for="item in sortedResources" :key="item.id" class="item">
            <a
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="title"
              >{{ item.title }}</a
            >

            <div class="meta">
              <div class="left">
                <span class="uploader">{{ item.uploader || "匿名" }}</span>
                <span class="dot">•</span>
                <time :datetime="item.time">{{ formatTime(item.time) }}</time>
              </div>

              <div class="right">
                <button
                  @click.prevent="handleLike(item)"
                  :aria-pressed="likedIds.has(String(item.id))"
                  class="like-btn"
                  :class="{ active: likedIds.has(String(item.id)) }"
                >
                  <img
                    :src="
                      likedIds.has(String(item.id))
                        ? '/icons/heart-red-filled.svg'
                        : '/icons/heart-red-outline.svg'
                    "
                    class="heart-icon"
                    alt="heart"
                  />
                  <span class="count">{{ item.likes }}</span>
                </button>

                <span class="badge">{{ item.type }}</span>
              </div>
            </div>
          </li>
        </ul>

        <p v-if="resources.length === 0" class="empty">
          目前没有资源，快来上传第一条吧！
        </p>
      </section>
    </main>

    <footer class="foot">提示：点击标题将直接跳转</footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
// 如果你的工程使用 ts 路径别名 @ 指向 src，可以用 '@/api/resource'，否则根据实际路径调整
import {
  getResourceList,
  createResource,
  likeResource,
} from "@/api/modules/resource";
import { ElMessage } from "element-plus";

interface Resource {
  id: number | string;
  title: string;
  uploader?: string;
  time: string; // ISO 或 created_at
  likes: number;
  link: string;
  type: string;
  role_key?: string;
}

const STORAGE_KEY = "feibi_resources_v1";
const DEFAULT_ROLE = "feibi";

const form = ref<{
  title: string;
  uploader: string;
  link: string;
  type: string;
}>({
  title: "",
  uploader: "",
  link: "",
  type: "",
});

const resources = ref<Resource[]>([]);
const likedIds = ref(new Set<string>());
const sortBy = ref<"time" | "likes">("time");
const uploaderCollapsed = ref(false);

function mapServerToLocal(row: any): Resource {
  return {
    id: row.id,
    title: row.title,
    uploader: row.uploader || "匿名",
    time: row.created_at || row.time || new Date().toISOString(),
    likes: row.likes ?? 0,
    link: row.link,
    type: (row.storage_type || row.type || "other") as string,
    role_key: row.role_key,
  };
}

async function loadResources() {
  try {
    // 尝试从后端拉取（分页可扩展，这里一次拉足够 demo）
    const res: any = await getResourceList({
      role_key: DEFAULT_ROLE,
      page: 1,
      pageSize: 100,
    });
    if (res && res.success && Array.isArray(res.data)) {
      resources.value = res.data.map(mapServerToLocal);
      // 可恢复本地点赞状态（仅 UI 记忆）
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.liked && Array.isArray(parsed.liked)) {
            parsed.liked.forEach((id: string) => likedIds.value.add(id));
          }
        } catch (e) {
          /* ignore */
        }
      }
      return;
    }
  } catch (err) {
    console.warn("拉取资源失败，使用本地缓存", err);
  }
  // 回退：本地缓存（仅恢复点赞状态）
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.liked && Array.isArray(parsed.liked)) {
        parsed.liked.forEach((id: string) => likedIds.value.add(id));
      }
    }
  } catch (e) {
    console.warn("本地加载失败", e);
  }
}

function saveLocalCache() {
  try {
    const liked = Array.from(likedIds.value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ liked }));
  } catch (e) {
    console.warn("保存本地缓存失败", e);
  }
}

onMounted(() => {
  loadResources();
  // 移动端默认收起上传区以节省空间
  uploaderCollapsed.value = window.innerWidth <= 640;
});
function toggleUploader() {
  uploaderCollapsed.value = !uploaderCollapsed.value;
}

async function addResource() {
  const t = form.value.title.trim();
  const l = form.value.link.trim();
  if (!form.value.title.trim() || !form.value.link.trim()) {
    return ElMessage.warning("请填写完整信息");
  }
  if (!/^https?:\/\//i.test(l)) {
    return ElMessage.error("请输入正确的链接(https开头)");
  }
  // 尝试调用后端接口
  try {
    const payload = {
      title: t,
      uploader: form.value.uploader.trim() || "匿名",
      link: l,
      storage_type: form.value.type,
      role_key: DEFAULT_ROLE,
    };
    const res: any = await createResource(payload);
    if (res && res.success && res.data) {
      const added = mapServerToLocal(res.data);
      resources.value.unshift(added);
      // 自动展开到顶部展示（可选）
      saveLocalCache();
      resetForm();
      ElMessage.success("上传成功");
      return;
    }
    ElMessage.error("上传失败");
  } catch (err) {
    console.warn("创建资源失败", err);
  }
}

function resetForm() {
  form.value.title = "";
  form.value.uploader = "";
  form.value.link = "";
  form.value.type = "";
}

async function handleLike(item: Resource) {
  // UI 乐观更新
  const id = item.id;
  const wasLiked = likedIds.value.has(String(id));
  if (wasLiked) {
    likedIds.value.delete(String(id));
    item.likes = Math.max(0, item.likes - 1);
  } else {
    likedIds.value.add(String(id));
    item.likes++;
  }
  saveLocalCache();

  // 同步后端（不依赖返回值进行 UI 回滚，简单处理：若失败则回退）
  try {
    const action = wasLiked ? "unlike" : "like";
    const res: any = await likeResource(id, action);
    if (
      res &&
      res.success &&
      res.data &&
      typeof res.data.likes !== "undefined"
    ) {
      item.likes = res.data.likes;
    }
  } catch (err) {
    console.warn("点赞接口调用失败，回滚本地状态", err);
    // 回滚
    if (wasLiked) {
      // 本来是已赞，取消失败 -> 重新添加
      likedIds.value.add(String(id));
      item.likes++;
    } else {
      likedIds.value.delete(String(id));
      item.likes = Math.max(0, item.likes - 1);
    }
    saveLocalCache();
  }
}

const sortedResources = computed(() => {
  const arr = [...resources.value];
  if (sortBy.value === "time") {
    arr.sort((a, b) => +new Date(b.time) - +new Date(a.time));
  } else {
    arr.sort((a, b) => b.likes - a.likes);
  }
  return arr;
});

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch (e) {
    return iso;
  }
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

.yuzuki-resources {
  min-height: 100vh;
  /* 神圣渐变背景：模拟菲比祈祷时的光晕效果 */
  background: linear-gradient(
    160deg,
    $phoebe-gold-light 0%,
    rgba($phoebe-white, 0.9) 30%,
    rgba($phoebe-blue-bright, 0.15) 100%
  );
  color: $phoebe-blue-dark;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  font-family: "Noto Sans SC", "PingFang SC", "Helvetica Neue", Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;

  /* 神圣光晕背景装饰 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 400px;
    background: radial-gradient(
      ellipse at 50% 0%,
      rgba($phoebe-gold, 0.18) 0%,
      rgba($phoebe-blue-bright, 0.08) 40%,
      transparent 70%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* 英雄区域 - 神圣标题 */
  .hero {
    padding: 24px 20px;
    background: linear-gradient(
      180deg,
      rgba($phoebe-white, 0.92) 0%,
      rgba($phoebe-gold-light, 0.3) 100%
    );
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    backdrop-filter: blur(12px) saturate(180%);
    border-bottom: 1px solid rgba($phoebe-gold, 0.15);
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 30px rgba($phoebe-blue-dark, 0.05);

    .hero-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: center;

      h1 {
        margin: 0;
        font-size: 2.2rem;
        font-weight: 900;
        letter-spacing: 0.8px;
        /* 神圣文字效果：金色光晕 */
        background: linear-gradient(
          135deg,
          $phoebe-gold 0%,
          rgba($phoebe-gold, 12%) 25%,
          $phoebe-blue-bright 60%,
          $phoebe-blue-light 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 2px 20px rgba($phoebe-gold, 0.25);
        position: relative;
        display: inline-block;

        &::after {
          content: "✦";
          position: absolute;
          right: -28px;
          top: 50%;
          transform: translateY(-50%);
          color: $phoebe-gold;
          font-size: 1.4rem;
          filter: drop-shadow(0 0 8px rgba($phoebe-gold, 0.6));
        }
      }

      .subtitle {
        margin-top: 8px;
        color: rgba($phoebe-blue-dark, 0.75);
        font-size: 1.05rem;
        font-weight: 500;
        letter-spacing: 0.3px;
      }
    }
  }

  .container {
    max-width: 1000px;
    margin: 24px auto;
    padding: 0 20px;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;

    /* 上传区域 - 圣典般的卡片 */
    .uploader {
      background: linear-gradient(
        145deg,
        rgba($phoebe-white, 0.95) 0%,
        rgba($phoebe-white-trans, 0.98) 100%
      );
      border-radius: 20px;
      padding: 0;
      box-shadow: 0 12px 40px rgba($phoebe-blue-dark, 0.08),
        0 0 0 1px rgba($phoebe-gold, 0.15) inset,
        0 0 60px rgba($phoebe-blue-bright, 0.05) inset;
      border: 1px solid rgba($phoebe-blue-bright, 0.1);
      overflow: hidden;
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
      position: relative;

      /* 装饰性光点 */
      &::before {
        content: "";
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200px;
        height: 200px;
        background: radial-gradient(
          circle,
          rgba($phoebe-gold, 0.2) 0%,
          transparent 70%
        );
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
      }

      .uploader-head {
        display: flex;
        justify-content: flex-end;
        padding: 16px 20px;
        border-bottom: 1px solid rgba($phoebe-blue-bright, 0.08);
        position: relative;
        z-index: 1;

        .toggle {
          background: linear-gradient(
            135deg,
            rgba($phoebe-blue-bright, 0.1) 0%,
            rgba($phoebe-gold, 0.1) 100%
          );
          border: 1px solid rgba($phoebe-blue-bright, 0.2);
          color: $phoebe-blue-light;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;

          &::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              135deg,
              rgba($phoebe-blue-bright, 0.2) 0%,
              rgba($phoebe-gold, 0.2) 100%
            );
            opacity: 0;
            transition: opacity 0.25s;
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba($phoebe-blue-bright, 0.15);

            &::before {
              opacity: 1;
            }
          }

          &:active {
            transform: translateY(0);
          }
        }
      }

      .upload-form {
        padding: 24px;
        max-height: 500px;
        overflow: hidden;
        transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
          padding 0.4s ease, opacity 0.3s ease;
        opacity: 1;
        position: relative;
        z-index: 1;

        .row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;

          input,
          select {
            flex: 1 1 0;
            padding: 14px 18px;
            border-radius: 14px;
            border: 1px solid rgba($phoebe-blue-bright, 0.15);
            font-size: 1rem;
            background: rgba($phoebe-white, 0.9);
            color: $phoebe-blue-dark;
            outline: none;
            transition: all 0.25s ease;
            font-family: inherit;
            box-shadow: 0 4px 12px rgba($phoebe-blue-dark, 0.03);

            &::placeholder {
              color: rgba($phoebe-blue-dark, 0.5);
            }

            &:focus {
              border-color: $phoebe-gold;
              box-shadow: 0 8px 30px rgba($phoebe-blue-bright, 0.12),
                0 0 0 3px rgba($phoebe-gold, 0.15);
              transform: translateY(-2px);
            }
          }

          select {
            max-width: 180px;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230c1e3a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 16px center;
            padding-right: 48px;
          }
        }

        .actions {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 24px;

          .btn {
            padding: 14px 28px;
            border-radius: 14px;
            border: none;
            font-weight: 800;
            cursor: pointer;
            font-size: 1.05rem;
            transition: all 0.25s ease;
            font-family: inherit;
            position: relative;
            overflow: hidden;

            &.primary {
              /* 神圣按钮：菲比的金蓝圣光 */
              background: linear-gradient(
                135deg,
                $phoebe-gold 0%,
                $phoebe-blue-light 50%,
                $phoebe-blue-bright 100%
              );
              color: $phoebe-blue-deep;
              box-shadow: 0 12px 36px rgba($phoebe-blue-light, 0.25),
                0 0 0 1px rgba($phoebe-white, 0.8) inset;

              &::after {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(
                  135deg,
                  rgba($phoebe-white, 0.3) 0%,
                  transparent 50%
                );
                opacity: 0;
                transition: opacity 0.25s;
              }

              &:hover {
                transform: translateY(-4px);
                box-shadow: 0 20px 50px rgba($phoebe-blue-light, 0.35),
                  0 0 0 1px rgba($phoebe-white, 0.9) inset;

                &::after {
                  opacity: 1;
                }
              }

              &:active {
                transform: translateY(-1px);
              }
            }
          }
        }
      }

      &.collapsed {
        .upload-form {
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
          opacity: 0;
        }
      }
    }

    /* 资源列表区域 - 圣光卡片集 */
    .list {
      margin-top: 32px;

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding: 0 8px;

        h2 {
          font-size: 1.6rem;
          margin: 0;
          color: $phoebe-blue-deep;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 12px;

          &::before {
            content: "📜";
            font-size: 1.4rem;
            filter: drop-shadow(0 2px 4px rgba($phoebe-gold, 0.3));
          }
        }

        .sort {
          label {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            color: rgba($phoebe-blue-dark, 0.8);
            font-size: 0.95rem;
          }

          select {
            padding: 10px 16px;
            padding-right: 40px;
            border-radius: 12px;
            border: 1px solid rgba($phoebe-blue-bright, 0.2);
            background: rgba($phoebe-white, 0.9);
            color: $phoebe-blue-dark;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%230c1e3a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 16px center;

            &:focus {
              border-color: $phoebe-gold;
              box-shadow: 0 0 0 3px rgba($phoebe-gold, 0.15);
              outline: none;
            }
          }
        }
      }

      .items {
        list-style: none;
        padding: 0;
        margin: 0;

        .item {
          background: linear-gradient(
            145deg,
            rgba($phoebe-white, 0.95) 0%,
            rgba($phoebe-white-trans, 0.98) 100%
          );
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 12px 40px rgba($phoebe-blue-dark, 0.06),
            0 0 0 1px rgba($phoebe-blue-bright, 0.08) inset;
          border: 1px solid rgba($phoebe-gold, 0.15);
          transition: all 0.35s cubic-bezier(0.2, 0.9, 0.25, 1);
          position: relative;
          overflow: hidden;

          /* 悬停时的神圣光效 */
          &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              $phoebe-gold,
              transparent
            );
            opacity: 0;
            transition: opacity 0.3s;
          }

          &:hover {
            transform: translateY(-8px) scale(1.01);
            box-shadow: 0 24px 60px rgba($phoebe-blue-dark, 0.12),
              0 0 0 1px rgba($phoebe-gold, 0.25) inset,
              0 0 40px rgba($phoebe-blue-bright, 0.1) inset;

            &::before {
              opacity: 1;
            }

            .title {
              color: $phoebe-blue-light;
            }
          }

          .title {
            display: block;
            color: $phoebe-blue-deep;
            font-weight: 800;
            text-decoration: none;
            margin-bottom: 16px;
            font-size: 1.25rem;
            line-height: 1.5;
            transition: color 0.25s;
            position: relative;
            padding-right: 30px;

            /* 链接图标 */
            &::after {
              content: "↗";
              position: absolute;
              right: 0;
              top: 50%;
              transform: translateY(-50%);
              font-size: 1.2rem;
              color: $phoebe-gold;
              opacity: 0.7;
              transition: opacity 0.25s, transform 0.25s;
            }

            &:hover::after {
              opacity: 1;
              transform: translateY(-50%) translateX(2px);
            }
          }

          .meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: rgba($phoebe-blue-dark, 0.7);
            font-size: 0.95rem;
            padding-top: 16px;
            border-top: 1px solid rgba($phoebe-blue-bright, 0.1);

            .left {
              display: flex;
              align-items: center;
              gap: 12px;

              .uploader {
                color: $phoebe-blue-dark;
                font-weight: 700;
                background: rgba($phoebe-gold, 0.1);
                padding: 4px 12px;
                border-radius: 8px;
                border: 1px solid rgba($phoebe-gold, 0.2);
              }

              .dot {
                opacity: 0.4;
                color: $phoebe-blue-light;
              }

              time {
                color: rgba($phoebe-blue-dark, 0.6);
                font-weight: 500;
              }
            }

            .right {
              display: flex;
              align-items: center;
              gap: 16px;

              .like-btn {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 12px;
                font-weight: 700;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.25s ease;
                color: rgba($phoebe-blue-dark, 0.8);
                position: relative;
                overflow: hidden;

                /* 点赞按钮的光效背景 */
                &::before {
                  content: "";
                  position: absolute;
                  inset: 0;
                  background: linear-gradient(
                    135deg,
                    rgba($phoebe-blue-bright, 0.1) 0%,
                    rgba($phoebe-gold, 0.1) 100%
                  );
                  border-radius: inherit;
                  opacity: 0;
                  transition: opacity 0.25s;
                }

                &:hover {
                  transform: translateY(-2px);

                  &::before {
                    opacity: 1;
                  }
                }

                .heart-icon {
                  width: 20px;
                  height: 20px;
                  display: block;
                  transition: all 0.3s ease;
                  filter: grayscale(100%) opacity(0.7);
                }

                /* 激活状态 - 神圣之心 */
                &.active {
                  color: $phoebe-blue-light;

                  .heart-icon {
                    filter: none;
                    transform: scale(1.15);
                  }

                  .count {
                    color: $phoebe-blue-light;
                    font-weight: 900;
                  }

                  &::after {
                    content: "";
                    position: absolute;
                    inset: -2px;
                    border-radius: 14px;
                    background: conic-gradient(
                      from 0deg at 50% 50%,
                      $phoebe-gold,
                      $phoebe-blue-bright,
                      $phoebe-gold
                    );
                    z-index: -1;
                    opacity: 0.3;
                    animation: rotate 3s linear infinite;
                  }
                }

                .count {
                  font-weight: 800;
                  min-width: 20px;
                  text-align: center;
                  transition: color 0.25s;
                }
              }

              .badge {
                padding: 6px 14px;
                border-radius: 999px;
                font-size: 0.9rem;
                font-weight: 800;
                background: linear-gradient(
                  135deg,
                  rgba($phoebe-blue-bright, 0.15) 0%,
                  rgba($phoebe-gold, 0.1) 100%
                );
                color: $phoebe-blue-dark;
                border: 1px solid rgba($phoebe-blue-bright, 0.2);
                transition: all 0.25s;
                white-space: nowrap;

                &:hover {
                  transform: translateY(-2px);
                  border-color: rgba($phoebe-gold, 0.3);
                  background: linear-gradient(
                    135deg,
                    rgba($phoebe-blue-bright, 0.2) 0%,
                    rgba($phoebe-gold, 0.15) 100%
                  );
                }
              }
            }
          }
        }
      }

      .empty {
        text-align: center;
        color: rgba($phoebe-blue-dark, 0.6);
        padding: 60px 20px;
        font-size: 1.1rem;
        background: rgba($phoebe-white, 0.7);
        border-radius: 20px;
        border: 2px dashed rgba($phoebe-blue-bright, 0.2);
        margin-top: 20px;
        position: relative;

        &::before {
          content: "✨";
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 2rem;
          opacity: 0.5;
        }
      }
    }
  }

  .foot {
    text-align: center;
    color: rgba($phoebe-blue-dark, 0.6);
    font-size: 0.95rem;
    margin: 40px 0 60px;
    padding: 20px;
    position: relative;
    z-index: 1;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba($phoebe-gold, 0.5),
        transparent
      );
    }
  }

  /* 旋转动画（用于点赞特效） */
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* ---------- 移动端适配 ---------- */
  @media (max-width: 768px) {
    padding-top: 70px;

    .hero {
      padding: 20px 16px;

      .hero-inner {
        h1 {
          font-size: 1.8rem;

          &::after {
            right: -24px;
            font-size: 1.2rem;
          }
        }

        .subtitle {
          font-size: 1rem;
        }
      }
    }

    .container {
      padding: 0 16px;

      .uploader {
        .upload-form {
          padding: 20px;

          .row {
            flex-direction: column;
            gap: 12px;
          }
        }
      }

      .list {
        .list-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;

          h2 {
            font-size: 1.4rem;
          }
        }

        .items .item {
          padding: 20px;

          .meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;

            .right {
              width: 100%;
              justify-content: space-between;
            }
          }
        }
      }
    }
  }

  /* 小屏幕手机额外优化 */
  @media (max-width: 480px) {
    .hero .hero-inner h1 {
      font-size: 1.6rem;

      &::after {
        display: none; /* 小屏幕隐藏装饰符号 */
      }
    }

    .container {
      .uploader .uploader-head .toggle {
        width: 100%;
        justify-content: center;
      }

      .list .items .item {
        .title {
          font-size: 1.1rem;
        }

        .meta .right {
          flex-wrap: wrap;
          gap: 12px;
        }
      }
    }
  }
}
</style>