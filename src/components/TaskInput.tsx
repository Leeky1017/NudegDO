import React, { useState, useCallback, type KeyboardEvent, type ChangeEvent } from "react";

export type TaskInputProps = {
  onSubmit: (text: string, isNudge: boolean) => void;
  onNudgeToggle?: (active: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function TaskInput({
  onSubmit,
  onNudgeToggle,
  disabled = false,
  placeholder = "添加新任务...",
}: TaskInputProps) {
  const [text, setText] = useState("");
  const [nudgeActive, setNudgeActive] = useState(false);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const handleNudgeToggle = useCallback(() => {
    const next = !nudgeActive;
    setNudgeActive(next);
    onNudgeToggle?.(next);
  }, [nudgeActive, onNudgeToggle]);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed, nudgeActive);
    setText("");
    if (nudgeActive) {
      setNudgeActive(false);
      onNudgeToggle?.(false);
    }
  }, [text, nudgeActive, onSubmit, onNudgeToggle]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      // Ctrl+N to toggle Nudge
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        handleNudgeToggle();
      }
    },
    [handleSubmit, handleNudgeToggle]
  );

  return (
    <div className="task-input-container">
      <input
        type="text"
        className="task-input"
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        className={`nudge-button ${nudgeActive ? "active" : ""}`}
        onClick={handleNudgeToggle}
        disabled={disabled}
        aria-label="Toggle Nudge mode"
      >
        N
      </button>
      <button
        type="button"
        className="submit-button"
        onClick={handleSubmit}
        disabled={disabled || !text.trim()}
        aria-label="Add task"
      >
        +
      </button>
    </div>
  );
}
