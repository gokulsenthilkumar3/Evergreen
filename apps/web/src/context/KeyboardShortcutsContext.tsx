import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsContextType {
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (key: string) => void;
  showShortcuts: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
};

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shortcutsRef = React.useRef<Map<string, Shortcut>>(new Map());

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    const key = `${shortcut.ctrl ? 'ctrl+' : ''}${shortcut.alt ? 'alt+' : ''}${shortcut.shift ? 'shift+' : ''}${shortcut.key.toLowerCase()}`;
    shortcutsRef.current.set(key, shortcut);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current.delete(key.toLowerCase());
  }, []);

  const showShortcuts = useCallback(() => {
    const shortcuts = Array.from(shortcutsRef.current.values());
    const shortcutList = shortcuts.map(s => 
      `${s.ctrl ? 'Ctrl+' : ''}${s.alt ? 'Alt+' : ''}${s.shift ? 'Shift+' : ''}${s.key.toUpperCase()}: ${s.description}`
    ).join('\n');
    
    toast.info(
      <div>
        <strong>Keyboard Shortcuts</strong>
        <pre style={{ margin: '8px 0', fontSize: '12px' }}>{shortcutList}</pre>
      </div>,
      { duration: 5000 }
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.altKey ? 'alt+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`;
      const shortcut = shortcutsRef.current.get(key);
      
      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }

      // Show shortcuts on '?'
      if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        showShortcuts();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts]);

  return (
    <KeyboardShortcutsContext.Provider value={{ registerShortcut, unregisterShortcut, showShortcuts }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

// Hook for registering component-level shortcuts
export const useShortcut = (shortcut: Shortcut, deps: React.DependencyList = []) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcut(shortcut);
    return () => unregisterShortcut(shortcut.key);
  }, deps);
};
