"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import { checkUsername } from "@/lib/validation";

const STORAGE_KEY = "caspersource:username";

// A tiny external store over localStorage. `storage` events only fire in
// *other* tabs, so writes here also notify same-tab listeners manually —
// that's what lets useSyncExternalStore stay reactive without ever calling
// setState from inside an effect.
type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(callback: Listener) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function writeUsername(name: string | null) {
  try {
    if (name) window.localStorage.setItem(STORAGE_KEY, name);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable (private mode, etc.) — the name still works
    // for the current session via in-memory listeners.
  }
  emitChange();
}

interface UsernameContextValue {
  username: string | null;
  isPromptOpen: boolean;
  promptForUsername: () => void;
  closePrompt: () => void;
  setUsername: (name: string) => { ok: boolean; reason?: string };
  clearUsername: () => void;
}

const UsernameContext = createContext<UsernameContextValue | null>(null);

export function UsernameProvider({ children }: { children: React.ReactNode }) {
  const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const setUsername = useCallback((name: string) => {
    const result = checkUsername(name);
    if (!result.ok || !result.clean) {
      return { ok: false, reason: result.reason };
    }
    writeUsername(result.clean);
    setIsPromptOpen(false);
    return { ok: true };
  }, []);

  const clearUsername = useCallback(() => writeUsername(null), []);
  const promptForUsername = useCallback(() => setIsPromptOpen(true), []);
  const closePrompt = useCallback(() => setIsPromptOpen(false), []);

  return (
    <UsernameContext.Provider
      value={{
        username,
        isPromptOpen,
        promptForUsername,
        closePrompt,
        setUsername,
        clearUsername,
      }}
    >
      {children}
    </UsernameContext.Provider>
  );
}

export function useUsername() {
  const ctx = useContext(UsernameContext);
  if (!ctx) {
    throw new Error("useUsername must be used within a UsernameProvider");
  }
  return ctx;
}
