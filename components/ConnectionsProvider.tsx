import React, { createContext, useContext } from 'react';
import { useConnections } from '@/hooks/useConnections';

const ConnectionsContext = createContext<any>(null);

export const ConnectionsProvider = ({ children }: { children: React.ReactNode }) => {
  const connections = useConnections();
  return (
    <ConnectionsContext.Provider value={connections}>
      {children}
    </ConnectionsContext.Provider>
  );
};

export const useConnectionsContext = () => {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) throw new Error("useConnectionsContext must be used within a ConnectionsProvider");
  return ctx;
}; 