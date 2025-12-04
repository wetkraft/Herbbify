"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ErrorContextType {
  showError: (title: string, description: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ title: "", description: "" });

  const showError = (title: string, description: string) => {
    setErrorInfo({ title, description });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorInfo.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorInfo.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={close}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ErrorContext.Provider>
  );
}
