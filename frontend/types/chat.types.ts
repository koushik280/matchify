/**
 * Chat related types
 */

export interface Message {
  _id: string;
  matchId: string;
  senderId: string;
  type: "text" | "voice" | "gif";
  content: string;
  readBy: string[];
  createdAt: string;
  deliveredAt: string;
}

export interface SendMessageData {
  matchId: string;
  type: "text" | "voice" | "gif";
  content: string;
}
