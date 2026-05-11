"use client";

import { useEffect, useState, useRef, useMemo } from "react"; // ✅ added useMemo
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { getSocket } from "@/lib/socket";
import api from "@/lib/axios";
import { Message } from "@/types/chat.types";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import type { Socket } from "socket.io-client";

interface TypingEventData {
  userId: string;
  matchId: string;
}

interface MessageReadEventData {
  messageId: string;
  userId: string;
}

interface SendMessageResponse {
  success?: boolean;
  error?: string;
  messageId?: string;
}

export default function ChatPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const { messages, addMessage, setMessages, updateMessageReadStatus } =
    useChatStore();
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const rawMatchId = params.matchId as string | undefined;
  const userId = user?._id;

  // ✅ FIX: Memoize currentMessages to prevent unnecessary re-renders
  const currentMessages = useMemo(() => {
    return rawMatchId ? messages[rawMatchId] || [] : [];
  }, [rawMatchId, messages]);

  const messagesLength = currentMessages.length;

  // 1. UI: Close emoji picker logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // 2. DATA: Load message history
  useEffect(() => {
    if (!rawMatchId) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${rawMatchId}`);
        setMessages(rawMatchId, res.data.messages);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchMessages();
  }, [rawMatchId, setMessages]);

  // 3. SOCKET: Setup listeners and Room Management
  const matchIdForSocket = rawMatchId;
  const userIdForSocket = userId;

  useEffect(() => {
    if (!user || !matchIdForSocket) return;

    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit("join_match_room", matchIdForSocket);
    };

    const handleDisconnect = () => setIsConnected(false);

    const handleReceiveMessage = (message: Message) => {
      if (message.matchId === matchIdForSocket) {
        addMessage(matchIdForSocket, message);
        if (message.senderId !== userIdForSocket && userIdForSocket) {
          socket.emit("mark_read", {
            matchId: matchIdForSocket,
            messageId: message._id,
          });
        }
      }
    };

    const handleTyping = (data: TypingEventData) => {
      if (
        data.userId !== userIdForSocket &&
        data.matchId === matchIdForSocket
      ) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = (data: TypingEventData) => {
      if (
        data.userId !== userIdForSocket &&
        data.matchId === matchIdForSocket
      ) {
        setOtherUserTyping(false);
      }
    };

    const handleMessageRead = (data: MessageReadEventData) => {
      if (matchIdForSocket) {
        updateMessageReadStatus(matchIdForSocket, data.messageId, data.userId);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);
    socket.on("message_read", handleMessageRead);

    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
      socket.off("message_read", handleMessageRead);
      if (matchIdForSocket) {
        socket.emit("leave_match_room", matchIdForSocket);
      }
    };
  }, [
    user,
    matchIdForSocket,
    userIdForSocket,
    addMessage,
    updateMessageReadStatus,
  ]);

  // 4. SYNC: Mark unread messages when chat opens
  useEffect(() => {
    if (!isConnected || !rawMatchId || !currentMessages.length || !userId)
      return;

    const unread = currentMessages.filter(
      (msg) => !msg.readBy.includes(userId) && msg.senderId !== userId,
    );

    unread.forEach((msg) => {
      socketRef.current?.emit("mark_read", {
        matchId: rawMatchId,
        messageId: msg._id,
      });
    });
  }, [
    isConnected,
    rawMatchId,
    currentMessages.length,
    userId,
    currentMessages,
  ]);

  // 5. UI: Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesLength]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socketRef.current || !rawMatchId) return;

    socketRef.current.emit("typing_start", { matchId: rawMatchId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing_stop", { matchId: rawMatchId });
    }, 1500);
  };

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !rawMatchId) return;

    socketRef.current.emit(
      "send_message",
      { matchId: rawMatchId, type: "text", content: input.trim() },
      (response: SendMessageResponse) => {
        if (response?.success) {
          setInput("");
          setShowEmojiPicker(false);
          socketRef.current?.emit("typing_stop", { matchId: rawMatchId });
        } else if (response?.error) {
          console.error("Send failed:", response.error);
        }
      },
    );
  };

  const onEmojiClick = (emojiObject: { emoji: string }) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  // Early returns
  if (!user) return <div className="p-8 text-center">Please log in...</div>;
  if (!rawMatchId)
    return <div className="p-8 text-center">Invalid chat room</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto">
      <GlassCard className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="text-xs text-muted-foreground mb-2 flex justify-between items-center">
          <span>{isConnected ? "🟢 Connected" : "🔴 Reconnecting..."}</span>
          {otherUserTyping && (
            <span className="text-primary animate-pulse">
              someone is typing...
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 p-2">
          {currentMessages.map((msg) => {
            const isOwn = msg.senderId === userId;
            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <p className="text-sm wrap-break-word">{msg.content}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] opacity-70">
                    <span>
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {isOwn &&
                      (msg.readBy.length > 1 ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10 relative">
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Smile className="h-5 w-5" />
          </button>

          <Input
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />

          <Button
            onClick={sendMessage}
            disabled={!isConnected || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-16 left-0 z-50"
            >
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
