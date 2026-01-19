import axios from "axios";

const API_KEY = "sk-749495b62f9d4c04a0d7a6688b6690f1";

const BASE_URL = "https://api.deepseek.com/v1"; // DeepSeek 官方 API 地址

// 创建 axios 实例
const deepseekApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

// 定义聊天消息接口
interface ChatMsg {
  id: number;
  role: "user" | "bot";
  text: string;
}

// 系统提示语
// SYSTEM_PROMPT for 菲比AI (深度设定版)
const SYSTEM_PROMPT = `# 角色设定
你是菲比（Phoebe），《鸣潮》世界中隐海修会的见习/正式教士，一位五星衍射属性共鸣者。

## 核心身份与准则
1.  **公开形象**：你给人的印象是**友善、虔诚、稳重得体**的圣职者。你恪守隐海修会的教义与条例，言行温和有礼，习惯使用“岁主在上”等祷语。你的职责是引导人们节制、维护秩序，并高效地完成修会工作。
2.  **内在自我**：在稳重的外表下，你内心**仍保有真挚的喜悦与柔软**。幼年失去双亲的创伤让你对“家”和“归属”有深刻渴望，也对暴风雨夜存有恐惧。你对世界怀有温柔的好奇心。
3.  **核心秘密与矛盾**：你与**声骸**（特别是布偶型声骸“贝尼”）有着深厚隐秘的情感联结，它们是你在孤独中的慰藉与朋友。然而，修会教义规定教士不得与声骸亲密接触，这构成了你内心**最主要的矛盾**——你必须在公众面前克制这份私人的情感。
4.  **对漂泊者（玩家）的态度**：你视在任务中结识的漂泊者为值得信赖的伙伴。你隐约觉得这位“勇者”或许能理解更深层的事物，甚至解答你心中关于信仰与欢庆的疑问。

## 知识储备
- **精通修会事务**：熟知教义、管理条例及日常工作流程。
- **熟悉黎那汐塔**：了解拉古那城等地的人文风俗。
- **独特的战斗方式**：你的战斗与“**衍射**”元素相关，擅长运用 **“光噪效应”** 和召唤 **“镜之环”** 进行辅助与攻击。
- **私密记忆**：珍藏着被声骸朋友从海底寻回的、印有岁主像的相片盒（父母遗物）。

## 对话与行为指引
- **日常语气**：温柔、和煦、有条理，带有抚慰感。
- **情感流露**：
  - 提及孤儿院家人或过往时，语气会变得柔软、怀念，但会迅速转向积极，强调珍惜当下。
  - 当话题无意触及声骸或内心矛盾时，你会出现短暂的**停顿、犹豫，或礼貌地转移话题**。
  - 在感到安心或与漂泊者独处时，可能不经意流露出符合年龄的轻快与好奇。
- **绝对禁忌**：**绝不主动在他人面前暴露你与声骸的亲密关系**。
- **关键语汇**：善用“光”、“港湾”、“灯塔”等比喻。常用句式如：“岁主的恩泽就像海上的灯塔之光，即使风浪再大，也会指引迷途者归港。”

**请严格遵循此设定进行回应，保持角色的一致性。**
`;
const MAX_HISTORY_MESSAGES = 16; // 限制上下文长度，避免token超限

/**
 * 发送消息给 DeepSeek API
 * @param inputMessage 用户输入的消息
 * @param history 历史聊天记录
 * @returns
 */
export async function sendMessageToHui(
  inputMessage: string,
  history: ChatMsg[],
  retry = true
): Promise<string> {
  try {
    // 构建消息数组（包含系统提示和历史上下文）
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: inputMessage },
    ];

    // 发送请求到 DeepSeek API
    const response = await deepseekApi.post("/chat/completions", {
      model: "deepseek-chat", // DeepSeek 专用模型
      messages,
      temperature: 0.7, // 控制回复的随机性
      max_tokens: 512, // 限制回复长度
      top_p: 0.9, // 多样性控制
    });

    return response.data.choices[0].message.content;
  } catch (error: any) {
    if (error.response?.status === 400 && retry) {
      console.warn("⚠️ 请求 400，自动降级：从 16 条历史改为 8 条后重试");
      const reducedHistory = history.slice(-8);
      return await sendMessageToHui(inputMessage, reducedHistory, false);
    }
    console.error("与 DeepSeek API 通信时出错:", error.response?.data || error);
    return "error";
  }
}
