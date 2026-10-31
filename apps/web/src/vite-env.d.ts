/// <reference types="vite/client" />
/// <reference types="@react-three/fiber" />
/// <reference types="@react-three/drei" />
/// <reference types="three" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Provider support number in international digits without "+", shown on licence notices. */
  readonly VITE_SUPPORT_PHONE?: string;
}
