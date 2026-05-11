import { create } from "zustand";
import { Message } from "@/types/chat.types";

interface ChatState {
  messages: Record<string, Message[]>; // matchId -> messages
  addMessage: (matchId: string, message: Message) => void;
  setMessages: (matchId: string, messages: Message[]) => void;
  clearMessages: (matchId: string) => void;
  updateMessageReadStatus: (
    matchId: string,
    messageId: string,
    userId: string,
  ) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  addMessage: (matchId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message],
      },
    })),
  setMessages: (matchId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [matchId]: messages },
    })),
  clearMessages: (matchId) =>
    set((state) => {
      const { [matchId]: _, ...rest } = state.messages;
      return { messages: rest };
    }),
  updateMessageReadStatus: (matchId, messageId, userId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: state.messages[matchId]?.map((msg) =>
          msg._id === messageId && !msg.readBy.includes(userId)
            ? { ...msg, readBy: [...msg.readBy, userId] }
            : msg,
        ),
      },
    })),
}));
