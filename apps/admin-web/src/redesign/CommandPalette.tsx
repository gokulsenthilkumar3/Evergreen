import { useEffect, useRef, useState } from "react";
import { AdminModal } from "../AdminModal";
type Remote = { id: string; label: string; type: string };
type Item = { id: string; label: string; group?: string; run: () => void };
export default function CommandPalette({
  items,
  onClose,
  apiBase,
  onRemote,
}: {
  items: Item[];
  apiBase?: string;
  onRemote?: (result: Remote) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const [remote, setRemote] = useState<Remote[]>([]),
    [observedAt, setObservedAt] = useState("");
  useEffect(() => {
    if (!apiBase || query.trim().length < 2) {
      setRemote([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`${apiBase}/control/search?q=${encodeURIComponent(query)}`, {
        credentials: "same-origin",
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (r) => {
          if (!r.ok) throw Error();
          const d = await r.json();
          if (!controller.signal.aborted) {
            setRemote(Array.isArray(d.results) ? d.results : []);
            setObservedAt(d.at || "");
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setRemote([]);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [apiBase, query]);
  const allItems = [
    ...items,
    ...remote
      .filter((r) => !items.some((i) => i.id === r.id))
      .map((r) => ({
        id: r.id,
        label: r.label,
        group: r.type,
        run: () => onRemote?.(r),
      })),
  ];
  const matches = allItems
    .filter((i) =>
      `${i.label} ${i.id} ${i.group}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 30);
  useEffect(() => {
    input.current?.focus();
  }, []);
  return (
    <AdminModal onClose={onClose}>
      <div
        className="command-palette modal-dialog-box"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelected((x) => Math.min(x + 1, matches.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelected((x) => Math.max(0, x - 1));
          }
          if (e.key === "Enter" && matches[selected]) {
            matches[selected].run();
            onClose();
          }
        }}
      >
        <h2 id="admin-modal-title" className="workspace-eyebrow">
          JUMP TO A MODULE OR RECORD
        </h2>
        <label htmlFor="command-input" className="sr-only">
          Search workspace
        </label>
        <input
          id="command-input"
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(0);
          }}
          placeholder="Search companies, records, diagnostics…"
        />
        <div className="palette-results">
          {matches.map((i, index) => (
            <button
              key={i.id}
              className={index === selected ? "selected" : ""}
              onClick={() => {
                i.run();
                onClose();
              }}
            >
              <span>{i.label}</span>
              <small>{i.group}</small>
            </button>
          ))}
          {!matches.length && <p>No matching results.</p>}
        </div>
        <footer>
          ↑ ↓ Navigate · Enter Open · Escape Close{" "}
          {observedAt &&
            ` · Server results ${new Date(observedAt).toLocaleTimeString()}`}
        </footer>
      </div>
    </AdminModal>
  );
}
