export type ChatStatusStage =
  | "understanding"
  | "keyword"
  | "search"
  | "prompt"
  | "answer"
  | "repair"
  | "completed"
  | "failed";

export interface ChatStatusData {
  stage: ChatStatusStage;
  message: string;
  progress: number;
  done: boolean;
  at: number;
}

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  if (progress < 0) return 0;
  if (progress > 100) return 100;
  return Math.round(progress);
}

export function createChatStatusData(params: {
  stage: ChatStatusStage;
  message: string;
  progress: number;
  done?: boolean;
}): ChatStatusData {
  return {
    stage: params.stage,
    message: params.message.trim() || "处理中",
    progress: clampProgress(params.progress),
    done: Boolean(params.done),
    at: Date.now(),
  };
}

export function isChatStatusData(value: unknown): value is ChatStatusData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<ChatStatusData>;
  if (typeof data.stage !== "string") return false;
  if (typeof data.message !== "string") return false;
  if (typeof data.progress !== "number" || !Number.isFinite(data.progress)) return false;
  if (typeof data.done !== "boolean") return false;
  if (typeof data.at !== "number" || !Number.isFinite(data.at)) return false;
  return true;
}
