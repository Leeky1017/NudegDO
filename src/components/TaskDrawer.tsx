import React from "react";
import type { Message } from "../llm/client";

export type ChatBubbleProps = {
  message: Message;
  personaName?: string;
  personaColor?: string;
};

export function ChatBubble({ message, personaName, personaColor }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) return null;

  return (
    <div className={`chat-bubble ${isUser ? "user" : "assistant"}`}>
      {!isUser && personaName && (
        <div className="bubble-avatar" style={{ backgroundColor: personaColor }}>
          {personaName[0]}
        </div>
      )}
      <div className={`bubble-content ${isUser ? "user" : "assistant"}`}>
        {message.content}
      </div>
    </div>
  );
}

export type TaskDrawerProps = {
  isOpen: boolean;
  chatHistory: Message[];
  personaName: string;
  personaColor: string;
  onClose: () => void;
};

export function TaskDrawer({
  isOpen,
  chatHistory,
  personaName,
  personaColor,
  onClose,
}: TaskDrawerProps) {
  if (!isOpen) return null;

  // Filter out system messages and internal prompts
  const displayMessages = chatHistory.filter(
    (msg) => msg.role !== "system" && !msg.content.includes("JSON")
  );

  return (
    <div className="task-drawer">
      <div className="drawer-header">
        <span className="drawer-title">对话记录</span>
        <button type="button" className="drawer-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="drawer-content">
        {displayMessages.length === 0 ? (
          <div className="drawer-empty">暂无对话记录</div>
        ) : (
          displayMessages.map((msg, i) => (
            <ChatBubble
              key={i}
              message={msg}
              personaName={personaName}
              personaColor={personaColor}
            />
          ))
        )}
      </div>
    </div>
  );
}
