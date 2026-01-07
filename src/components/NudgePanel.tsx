import React, { useState, useCallback, type ChangeEvent } from "react";

export type NudgePanelProps = {
  taskText: string;
  questions: string[];
  personaName: string;
  personaColor: string;
  isLoading?: boolean;
  onSubmit: (response: string) => void;
  onCancel: () => void;
};

export function NudgePanel({
  taskText,
  questions,
  personaName,
  personaColor,
  isLoading = false,
  onSubmit,
  onCancel,
}: NudgePanelProps) {
  const [response, setResponse] = useState("");

  const handleResponseChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (response.trim()) {
      onSubmit(response.trim());
    }
  }, [response, onSubmit]);

  return (
    <div className="nudge-panel">
      <div className="nudge-header">
        <div className="persona-badge" style={{ backgroundColor: personaColor }}>
          {personaName}
        </div>
        <div className="task-preview">{taskText}</div>
      </div>

      <div className="nudge-questions">
        {questions.map((q, i) => (
          <div key={i} className="question-item" style={{ animationDelay: `${i * 0.15}s` }}>
            <span className="question-badge" style={{ backgroundColor: personaColor }}>
              {i + 1}
            </span>
            <span className="question-text">{q}</span>
          </div>
        ))}
      </div>

      <textarea
        className="nudge-response"
        value={response}
        onChange={handleResponseChange}
        placeholder="在这里回答问题..."
        disabled={isLoading}
        rows={3}
      />

      <div className="nudge-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          disabled={isLoading}
        >
          取消
        </button>
        <button
          type="button"
          className="confirm-button"
          onClick={handleSubmit}
          disabled={isLoading || !response.trim()}
        >
          {isLoading ? "处理中..." : "确认并创建"}
        </button>
      </div>
    </div>
  );
}
