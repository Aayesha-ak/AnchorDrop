"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import ToastContainer from "@/components/ui/Toast";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number; // in milliseconds
  createdAt: number;
}

export interface ToastMethods {
  (message: string, type?: ToastType, duration?: number): string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export interface ToastContextType {
  toasts: ToastItem[];
  toast: ToastMethods;
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = {
        id,
        message,
        type,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const toastMethods = useMemo<ToastMethods>(() => {
    const fn = (message: string, type?: ToastType, duration?: number) =>
      addToast(message, type, duration);

    fn.success = (msg: string, dur?: number) => addToast(msg, "success", dur);
    fn.error = (msg: string, dur?: number) => addToast(msg, "error", dur);
    fn.info = (msg: string, dur?: number) => addToast(msg, "info", dur);
    fn.warning = (msg: string, dur?: number) => addToast(msg, "warning", dur);
    fn.dismiss = (id: string) => removeToast(id);
    fn.clear = () => clearToasts();

    return fn;
  }, [addToast, removeToast, clearToasts]);

  const contextValue = useMemo<ToastContextType>(
    () => ({
      toasts,
      toast: toastMethods,
      addToast,
      removeToast,
      clearToasts,
    }),
    [toasts, toastMethods, addToast, removeToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
