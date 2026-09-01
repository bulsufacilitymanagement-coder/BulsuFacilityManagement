"use client";

import React, { createContext, useContext } from "react";
import { UserProfile } from "./types";

type UserContextType = {
  user: UserProfile | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  user,
  children,
}: {
  user: UserProfile | null;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}
