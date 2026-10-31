import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/index.css';
import UnifiedMarketing from '../../src/UnifiedMarketing';

createRoot(document.getElementById('root')!).render(<StrictMode><UnifiedMarketing /></StrictMode>);
