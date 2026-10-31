import { useEffect, useState } from "react";
const read = (name: string, fallback: string) => {
  try {
    return localStorage.getItem(`evergreen-owner-${name}`) || fallback;
  } catch {
    return fallback;
  }
};
export default function WorkspacePreferences() {
  const [accent, setAccent] = useState(() => read("accent", "emerald"));
  const [density, setDensity] = useState(() => read("density", "comfortable"));
  const [motion, setMotion] = useState(() => read("motion", "system"));
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.ownerAccent = ["emerald", "sky", "violet"].includes(accent)
      ? accent
      : "emerald";
    root.dataset.ownerDensity =
      density === "compact" ? "compact" : "comfortable";
    root.dataset.ownerMotion = motion === "reduced" ? "reduced" : "system";
    try {
      for (const [name, value] of Object.entries({ accent, density, motion }))
        localStorage.setItem(`evergreen-owner-${name}`, value);
    } catch {
      /* Preferences remain available for this visit. */
    }
    return () => {
      delete root.dataset.ownerAccent;
      delete root.dataset.ownerDensity;
      delete root.dataset.ownerMotion;
    };
  }, [accent, density, motion]);
  return (
    <details className="owner-preferences">
      <summary>Workspace appearance</summary>
      <div>
        <label>
          Accent
          <select
            value={accent}
            onChange={(event) => setAccent(event.target.value)}
          >
            <option value="emerald">EverGreen</option>
            <option value="sky">Ocean</option>
            <option value="violet">Iris</option>
          </select>
        </label>
        <label>
          Density
          <select
            value={density}
            onChange={(event) => setDensity(event.target.value)}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>
        <label>
          Motion
          <select
            value={motion}
            onChange={(event) => setMotion(event.target.value)}
          >
            <option value="system">Follow device preference</option>
            <option value="reduced">Reduce motion</option>
          </select>
        </label>
      </div>
    </details>
  );
}
