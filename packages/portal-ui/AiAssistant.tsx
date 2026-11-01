import { useEffect, useId, useRef, useState } from "react";
import "./assistant.css";

type Message = { role: "user" | "assistant"; content: string };
type Props = {
  endpoint: string;
  title: string;
  purpose: string;
  prompts: string[];
  authorization?: () => string | undefined;
  compact?: boolean;
  embedded?: boolean;
  translate?: (text: string) => string;
  onBusyChange?: (busy: boolean) => void;
};
export default function AiAssistant({
  endpoint,
  title,
  purpose,
  prompts,
  authorization,
  compact = false,
  embedded = false,
  translate = (text) => text,
  onBusyChange,
}: Props) {
  const t = translate;
  const id = useId();
  const [open, setOpen] = useState(!compact);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "loading" | "ready" | "setup" | "unavailable"
  >("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const transcript = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  const headers = (): Record<string, string> => {
    const value = authorization?.();
    return value ? { Authorization: value } : {};
  };
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    void fetch(endpoint, {
      credentials: "same-origin",
      headers: headers(),
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { configured?: boolean };
        if (mounted.current)
          setStatus(data.configured === true ? "ready" : "setup");
      })
      .catch(() => {
        if (mounted.current) setStatus("unavailable");
      })
      .finally(() => clearTimeout(timer));
    return () => {
      mounted.current = false;
      controller.abort();
      request.current?.abort();
      clearTimeout(timer);
    };
    // Authorization is read when a request starts; it is never persisted here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);
  useEffect(() => {
    transcript.current?.scrollTo?.({
      top: messages.length || busy ? transcript.current.scrollHeight : 0,
      behavior: "auto",
    });
  }, [messages, busy]);
  useEffect(() => {
    if (compact && open) inputRef.current?.focus();
  }, [open, compact]);
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (request.current || !input.trim() || !consent || status !== "ready")
      return;
    const message = input.trim();
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 25000);
    setBusy(true);
    setError("");
    try {
      // Keep a bounded local transcript; no conversation is saved in browser storage.
      let history = messages.slice(-8);
      while (
        history.reduce(
          (sum, item) => sum + item.content.length,
          message.length,
        ) > 12000
      )
        history = history.slice(2);
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
      });
      const data = (await response.json()) as {
        answer?: string;
        message?: unknown;
      };
      if (!response.ok)
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "The assistant could not answer. Please retry.",
        );
      if (typeof data.answer !== "string" || !data.answer.trim())
        throw new Error(
          "The assistant returned an empty answer. Please retry.",
        );
      if (mounted.current) {
        setMessages(
          (previous) =>
            [
              ...previous,
              { role: "user", content: message },
              { role: "assistant", content: data.answer! },
            ].slice(-20) as Message[],
        );
        setInput("");
      }
    } catch (failure) {
      if (mounted.current)
        setError(
          failure instanceof Error && failure.name !== "AbortError"
            ? failure.message
            : "The request timed out or was stopped. Your question is still here.",
        );
    } finally {
      clearTimeout(timer);
      request.current = null;
      if (mounted.current) setBusy(false);
    }
  };
  const panel = (
    <section
      className={`eg-assistant ${compact ? "eg-assistant-floating" : ""} ${embedded ? "eg-assistant-embedded" : ""}`}
      aria-label={title}
    >
      {!embedded && <header className="eg-assistant-header">
        <div>
          <span className="eg-assistant-eyebrow">{t('EVERGREEN AI / GROQ')}</span>
          <h2>{title}</h2>
          <p>{purpose}</p>
        </div>
        {compact && (
          <button
            type="button"
            aria-label={t('Close assistant')}
            onClick={() => setOpen(false)}
          >
            {t('Close')}
          </button>
        )}
      </header>}
      <div className="eg-assistant-status" role="status">
        {t(status === "loading"
          ? "Checking connection..."
          : status === "ready"
            ? "Ready - guidance only"
            : status === "setup"
              ? "Setup needed: the owner must configure the server-side Groq key."
              : "Assistant unavailable. Check the API connection and refresh to retry.")}
      </div>
      <div
        className="eg-assistant-messages"
        ref={transcript}
        role="log"
        aria-label={t('Conversation')}
        aria-live="polite"
        aria-relevant="additions"
      >
        {!messages.length && (
          <div className="eg-assistant-welcome">
            <strong>{t('Where would you like to start?')}</strong>
            <p>{t('Ask a question or choose a starting point.')}</p>
            <div className="eg-assistant-prompts">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((item, index) => (
          <div
            key={index}
            className={`eg-assistant-message eg-assistant-${item.role}`}
          >
            <span>{item.role === "user" ? t('You') : title}</span>
            <p>{item.content}</p>
          </div>
        ))}
        {busy && <p role="status">{t('Thinking...')}</p>}
      </div>
      <form
        onSubmit={(event) => void send(event)}
        className="eg-assistant-form"
      >
        <label className="eg-assistant-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            disabled={busy}
          />
          {t('Send this conversation to Groq. Keep passwords, keys and personal data out of your messages.')}
        </label>
        <label htmlFor={`${id}-question`}>{t('Your question')}</label>
        <textarea
          ref={inputRef}
          id={`${id}-question`}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={2000}
          rows={3}
          disabled={busy}
          placeholder={t('Ask for a workflow, explanation or next step...')}
        />
        {error && (
          <p className="eg-assistant-error" role="alert">
            {t(error)}
          </p>
        )}
        <div className="eg-assistant-actions">
          <button
            type="button"
            disabled={busy || !messages.length}
            onClick={() => {
              setMessages([]);
              setError("");
            }}
          >
            {t('Clear conversation')}
          </button>
          {busy ? (
            <button type="button" onClick={() => request.current?.abort()}>
              {t('Stop')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!consent || !input.trim() || status !== "ready"}
            >
              {t('Send question')}
            </button>
          )}
        </div>
        <p className="eg-assistant-note">
          {t('AI guidance can be wrong. Verify before acting. This assistant cannot change records or execute operations.')}
        </p>
      </form>
    </section>
  );
  return compact ? (
    <div className="eg-assistant-dock">
      {open && panel}
      <button
        type="button"
        className="eg-assistant-launcher"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
      >
        {open ? t('Hide') : `${t('Ask')} ${title}`}
      </button>
    </div>
  ) : (
    panel
  );
}
