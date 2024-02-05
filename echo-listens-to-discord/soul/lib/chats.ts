export const chats = (message: string | AsyncIterable<string>) => {
  return {
    action: "chats",
    content: message,
    name: "Echo",
  }
}