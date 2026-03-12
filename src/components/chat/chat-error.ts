export interface ChatErrorInfo {
  message: string;
  detail?: string;
  isRateLimit: boolean;
}

export function parseChatErrorInfo(error: Error | undefined): ChatErrorInfo | null {
  if (!error) return null;
  const msg = error.message ?? "";

  if (msg.includes("请求太频繁") || msg.includes("请求次数过多") || msg.includes("今日对话次数")) {
    return { message: msg, isRateLimit: true };
  }
  if (msg.includes("429") || msg.includes("rate")) {
    return { message: "请求太频繁，请稍后再试", isRateLimit: true };
  }

  try {
    const parsed = JSON.parse(msg) as { error?: string; detail?: string };
    if (parsed.error) {
      return {
        message: parsed.error,
        detail: parsed.detail,
        isRateLimit: false,
      };
    }
  } catch {
    // ignore JSON parse failure
  }

  if (msg.includes("认证") || msg.includes("401") || msg.includes("403")) {
    return { message: "AI 服务认证出了问题，博主正在处理中", isRateLimit: false };
  }
  if (msg.includes("超时") || msg.includes("timeout")) {
    return { message: "AI 思考太久了，请稍后再试一次", isRateLimit: false };
  }
  if (msg.includes("不可用") || msg.includes("503")) {
    return { message: "AI 服务暂时不在线，请稍后再来", isRateLimit: false };
  }

  return {
    message: "抱歉，我这边出了点状况，请稍后再试",
    detail: msg.length > 0 && msg.length < 200 ? msg : undefined,
    isRateLimit: false,
  };
}
