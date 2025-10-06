<template>
  <div class="megumi-message-board" aria-live="polite">
    <!-- 半透明顶部标题 -->
    <header class="board-header" role="banner">
      <div class="title-wrap">
        <h1>留言板</h1>
        <p class="subtitle">在这里，思念与微光一同流淌。</p>
      </div>
    </header>

    <!-- 留言展示区 -->
    <section class="message-list">
      <transition-group name="msg" tag="div" class="message-list-inner">
        <!-- skeleton loading -->
        <div v-if="loading" class="skeleton-wrap" key="skeleton">
          <div class="skeleton" v-for="i in 4" :key="i">
            <div class="sk-avatar"></div>
            <div class="sk-lines">
              <div class="sk-line short"></div>
              <div class="sk-line"></div>
            </div>
          </div>
        </div>

        <!-- messages -->
        <div v-for="(msg, idx) in messages" :key="msg.id || msg._tempId || idx" class="message-card" :data-index="idx"
          tabindex="0" role="article" :aria-label="`留言来自 ${msg.name || '匿名'}，内容：${msg.content}`">
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
      </transition-group>
    </section>

    <!-- 底部发送区 -->
    <section class="message-form" aria-label="写下你的留言">
      <label class="sr-only" for="mb-name">你的昵称</label>
      <input id="mb-name" v-model="name" type="text" placeholder="你的昵称" @keydown.enter.prevent />

      <label class="sr-only" for="mb-content">留言内容</label>
      <textarea id="mb-content" v-model="content" placeholder="写下你的留言..." @keydown.ctrl.enter.prevent="submitMessage"
        @input="autoGrow" ref="textareaRef" />

      <div class="form-row">
        <div class="hint">按 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 快捷发送</div>
        <button @click="submitMessage" :disabled="isSending || !content.trim()"
          aria-disabled="isSending || !content.trim()">
          <span v-if="!isSending">发送</span>
          <span v-else>发送中…</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { getMessageList, createMessage } from "@/api/modules/message";

const messages = ref<any[]>([]);
const name = ref(localStorage.getItem("feibi_name") || "");
const content = ref("");
const loading = ref(true);
const isSending = ref(false);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const fetchMessages = async () => {
  loading.value = true;
  try {
    const res = await getMessageList({ page: 1, pageSize: 9999 });
    messages.value = res.data || [];
    await nextTick();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

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
    // 重新同步列表（更可靠）
    await fetchMessages();
  } catch (err) {
    console.error(err);
  } finally {
    isSending.value = false;
  }
};

const formatTime = (time: string) => {
  if (!time) return "";
  const d = new Date(time);
  // 例如：2025-08-11 15:30
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

onMounted(() => {
  fetchMessages();
  // ensure textarea autosize initial
  nextTick(() => autoGrow());
});
</script>

<style scoped lang="scss">
.megumi-message-board {
  position: relative;
  min-height: 100vh;
  padding-top: 110px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg,
      #fffafc 0%,
      /* 顶部奶白 */
      #e0f0ff 50%,
      /* 浅蓝渐变 */
      #c4e4ff 100%,
      /* 更亮蓝 */
    );

  font-family: "Noto Sans SC", "Noto Sans", system-ui, -apple-system, "Segoe UI",
    Roboto, Arial;
  color: #222;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;



  .board-header {
    position: absolute;
    top: 72px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 960px;
    background: linear-gradient(180deg,
        rgba(255, 250, 252, 0.78),
        rgba(240, 248, 255, 0.62));
    padding: 14px 18px;
    border-radius: 14px;
    box-shadow: 0 10px 34px rgba(158, 24, 32, 0.06);
    backdrop-filter: blur(6px) saturate(120%);
    z-index: 6;
    border: 1px solid rgba(58, 123, 224, 0.06);


    .title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;

      h1 {
        margin: 0;
        font-size: 18px;
        color: #3b7be0;
        /* 菲比蓝 */
        letter-spacing: 0.4px;
        font-weight: 800;
      }

      .subtitle {
        margin: 0;
        margin-left: auto;
        color: #7a7f8c;
        /* 柔和灰 */
        font-size: 13px;
        font-weight: 500;
      }
    }

  }

  /* ---------- 留言列表 ---------- */
  .message-list {
    z-index: 2;
    position: relative;
    flex: 1;
    overflow-y: auto;
    padding: 28px 20px 300px;
    margin-top: 18px;

    .message-list-inner {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
      z-index: 2;
    }

    /* skeleton 样式保持，但色系替换为椿风 */
    .skeleton-wrap {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .skeleton {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 12px;
        background: linear-gradient(180deg,
            rgba(255, 255, 255, 0.86),
            rgba(230, 245, 255, 0.9));
        box-shadow: 0 6px 18px rgba(58, 123, 224, 0.03);
        border: 1px solid rgba(220, 235, 245, 0.7);
        border-radius: 12px;
      }

      .sk-avatar {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: linear-gradient(90deg, #fff1a0, #ffe066);
        /* 金发渐变 */
      }

      .sk-lines {
        flex: 1;

        .sk-line {
          height: 10px;
          border-radius: 6px;
          background: linear-gradient(90deg,
              rgba(255, 255, 255, 0.9),
              rgba(225, 240, 255, 0.9));
          margin-bottom: 8px;
        }

        .sk-line.short {
          width: 40%;
        }
      }
    }
  }

  /* ---------- 单条消息卡片（椿风版） ---------- */
  .message-card {
    background: linear-gradient(180deg,
        rgba(255, 255, 255, 0.98),
        rgba(250, 250, 255, 0.97));
    border-radius: 14px;
    padding: 14px 16px;
    margin: 0 auto;
    width: calc(100% - 48px);
    max-width: 960px;
    box-shadow: 0 10px 30px rgba(58, 123, 224, 0.04);
    border: 1px solid rgba(245, 235, 240, 0.8);
    transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.28s;
    transform-origin: center;
    position: relative;
    z-index: 3;


    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 60px rgba(58, 123, 224, 0.08);
    }

    .message-meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;

      .left-meta {
        display: flex;
        gap: 12px;
        align-items: center;

        .name-avatar {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(180deg, #fff1a0 0%, #ffd966 100%);
          /* 金发渐变 */
          border: 2px solid rgba(255, 255, 255, 0.6);
          box-shadow: inset 0 -6px 12px rgba(255, 223, 127, 0.08);
          font-size: 16px;
          flex-shrink: 0;
        }

        .meta-texts {
          .message-name {
            font-size: 15px;
            color: #3b7be0;
            /* 菲比蓝名字 */
            font-weight: 800;
            line-height: 1;
          }

          .message-time {
            font-size: 12px;
            color: #7a7f8c;
            margin-top: 2px;
          }
        }
      }

      .meta-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        color: #ffd966;

        /* 金色小按钮点缀 */
        .halo-star {
          display: inline-block;
          color: #6ec1ff;
          text-shadow:
            0 0 6px rgba(173, 221, 255, 0.8),
            0 0 18px rgba(255, 255, 255, 0.5);
          animation: haloPulse 2.6s ease-in-out infinite;
        }

        @keyframes haloPulse {

          0%,
          100% {
            opacity: 0.7;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      }
    }

    .message-content {
      font-size: 15px;
      color: #2f2f2f;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 0;
      padding-bottom: 2px;
      letter-spacing: 0.2px;
    }


  }

  /* 动画：消息列表进入的淡入上移（保留你原有的 transition-group 名称） */
  .msg-enter-from,
  .msg-leave-to {
    opacity: 0;
    transform: translateY(12px);
    filter: blur(0.6px);
  }

  .msg-enter-active,
  .msg-leave-active {
    transition: all 360ms cubic-bezier(0.2, 0.9, 0.2, 1);
  }

  /* ---------- 固定底部输入区（更椿的按钮与输入） ---------- */
  .message-form {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 18px;
    width: calc(100% - 32px);
    max-width: 960px;
    background: linear-gradient(180deg, #fdd867 0%, #fff7dd 100%);
    padding: 14px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 10px 30px rgba(59, 123, 224, 0.14);
    z-index: 6;
    border: none;

    input,
    textarea {
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid rgba(230, 220, 225, 0.7);
      font-size: 14px;
      outline: none;
      transition: box-shadow 0.18s, border-color 0.18s;
      background: linear-gradient(180deg,
          rgba(255, 255, 255, 0.98),
          rgba(250, 248, 249, 0.98));
      box-shadow: inset 0 -4px 10px rgba(234, 217, 227, 0.04);
      color: #333;
      resize: none;
    }

    input:focus,
    textarea:focus {
      border-color: rgba(158, 24, 32, 0.16);
      box-shadow: 0 8px 26px rgba(210, 140, 150, 0.06);
    }

    textarea {
      min-height: 64px;
      max-height: 220px;
      line-height: 1.6;
    }

    .form-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      .hint {
        color: #7b6a6f;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;

        kbd {
          background: rgba(245, 245, 245, 0.9);
          border-radius: 6px;
          padding: 2px 6px;
          border: 1px solid rgba(220, 220, 220, 0.9);
          font-size: 12px;
          box-shadow: inset 0 -2px 4px rgba(200, 200, 200, 0.03);
        }
      }

      button {
        padding: 10px 18px;
        background: linear-gradient(180deg, #c4e4ff 0%, #60aceb 100%);
        color: #fff;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 800;
        box-shadow: 0 10px 30px rgba(184, 58, 74, 0.14);
        transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
        background: linear-gradient(180deg, #f0f8ff 0%, #c4e4ff 100%);
        color: #fff;
      }

      button:not(:disabled):active {
        transform: translateY(1px);
      }
    }
  }

  /* ---------- 响应式：移动端收敛 ---------- */
  @media (max-width: 980px) {
    padding-top: 90px;

    .board-header {
      left: 12px;
      transform: none;
      width: calc(100% - 24px);
    }

    .message-list {
      padding: 18px 12px 220px;

      .message-list-inner {
        gap: 12px;
      }
    }

    .message-card {
      width: calc(100% - 28px);
      border-radius: 12px;
      padding: 12px;

      &::before {
        left: 0;
        top: 8px;
        bottom: 8px;
        width: 6px;
      }

      .name-avatar {
        width: 44px;
        height: 44px;
      }
    }

    .message-form {
      left: 12px;
      transform: none;
      width: calc(100% - 24px);
      bottom: 12px;
      padding: 12px;
    }
  }



  /* sr-only */
  .sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
}
</style>
