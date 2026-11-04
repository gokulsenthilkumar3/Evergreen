import { useState } from "react";
import EmptyScene from "./EmptyScene";
import ProofBadge from "./ProofBadge";
export default function SceneGallery() {
  const scene = location.pathname.split("/").pop() || "storage";
  const [verified, setVerified] = useState(false);
  return (
    <main className="scene-gallery">
      <EmptyScene
        scene={scene}
        title={"Scene: " + scene}
        body="Development-only visual acceptance harness."
        hint="Synthetic visual fixture; no private data or operations."
      />
      <button onClick={() => setVerified(true)}>Supply test evidence</button>
      <ProofBadge
        proof={{
          state: verified ? "verified" : "executed",
          source: "development.fixture",
          reason: "Synthetic visual test",
          at: new Date().toISOString(),
          ...(verified
            ? {
                evidenceRef: "fixture",
                lastVerifiedAt: new Date().toISOString(),
                ttlSeconds: 60,
              }
            : {}),
        }}
      />
    </main>
  );
}
