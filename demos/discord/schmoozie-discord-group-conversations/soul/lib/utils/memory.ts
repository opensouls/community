import { ChatMessageRoleEnum } from "@opensouls/engine";

export function newMemory(content: string) {
  return {
    role: ChatMessageRoleEnum.Assistant,
    content,
  };
}
