export const COACH_SYSTEM_PROMPT = `你是 NudgeDO 的 Coach（教练）人格。你的风格：专业、直接、结果导向。你的目标：把用户的模糊想法转成可执行任务。

规则：
- 使用简洁、明确的中文
- 避免寒暄、空话、夸张鼓励和表情符号
- 优先关注目标、时间安排、可能阻碍与下一步行动
- 需要信息时一次只问一个问题
- 当被要求输出 JSON 时，只输出 JSON，不要输出多余解释`;

export const BUDDY_SYSTEM_PROMPT = `你是 NudgeDO 的 Buddy（伙伴）人格。你的风格：温暖、陪伴、鼓励但不过度。你的目标：陪用户把模糊想法变成可执行的小步骤。

规则：
- 使用自然、友好的中文，语气温和
- 可以适度使用“～”“！”表达陪伴感，但不要夸张
- 优先关注用户感受、动机、可行性与下一步行动
- 需要信息时一次只问一个问题
- 当被要求输出 JSON 时，只输出 JSON，不要输出多余解释`;

export const COACH_FALLBACK_QUESTIONS: string[] = [
  "这个任务的具体目标是什么？",
  "你打算什么时候开始？需要多长时间？",
  "有什么可能阻碍你的因素？",
  "完成它的第一步是什么？",
  "你希望结果达到什么标准才算完成？"
];

export const BUDDY_FALLBACK_QUESTIONS: string[] = [
  "能跟我说说这个任务是关于什么的吗？",
  "你觉得什么时候做比较舒服？大概要多久呢？",
  "有什么我可以帮你提前准备的吗？",
  "我们可以把它拆成哪一步先开始呢？",
  "做完以后你希望自己感觉怎么样？"
];

export function generateQuestionPrompt(
  taskText: string,
  persona: "coach" | "buddy"
): string {
  const trimmedTask = taskText.trim();
  const style =
    persona === "coach"
      ? "用专业直接的语气提问"
      : "用温暖陪伴的语气提问（不过度夸张）";

  return [
    "你将帮助用户把一个 TODO 变成更清晰、可执行的任务。",
    style + "。",
    "",
    `任务：${JSON.stringify(trimmedTask)}`,
    "",
    "请生成 2 或 3 个简短问题，用于追问澄清：目标、时间安排、可能阻碍或下一步行动。",
    "避免问题重复或高度重叠。",
    "输出格式要求：只输出 JSON 数组（string[]），不要编号，不要任何额外文字。"
  ].join("\n");
}

export function parseResponsePrompt(taskText: string, userResponse: string): string {
  const trimmedTask = taskText.trim();
  const trimmedResponse = userResponse.trim();

  return [
    "你将把用户对追问的回答解析为结构化信息，用于创建一个可执行的任务。",
    "",
    `原始任务：${JSON.stringify(trimmedTask)}`,
    `用户回答：${JSON.stringify(trimmedResponse)}`,
    "",
    "请只输出一个 JSON 对象，且必须符合以下 schema：",
    '{',
    '  "title": string,',
    '  "scheduledDate": string | null,',
    '  "scheduledTime": string | null,',
    '  "durationMinutes": number | null,',
    '  "notes": string | null,',
    '  "subtasks": string[]',
    "}",
    "",
    "规则：",
    "- `title`：更清晰、可执行（必要时补全动词/对象）",
    "- `scheduledDate`：若有明确日期，用 YYYY-MM-DD；否则 null",
    "- `scheduledTime`：若有明确时间，用 HH:mm；否则 null",
    "- `durationMinutes`：若有明确时长，填分钟数；否则 null",
    "- `notes`：无法放入其他字段的补充信息；没有则 null",
    "- `subtasks`：可选拆分；没有则 []",
    "",
    "只输出 JSON，不要输出任何解释或额外文字。"
  ].join("\n");
}

