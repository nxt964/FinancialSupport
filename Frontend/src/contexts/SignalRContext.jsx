import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const SignalRContext = createContext(null);

export const SignalRContextProvider = ({ children }) => {
  const hubConnectionRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7114/chartHub')
      .withAutomaticReconnect()
      .build();

    hubConnectionRef.current = connection;

    connection
      .start()
      .then(() => {
        console.log('✅ SignalR Connected');
        setIsConnected(true);
      })
      .catch((err) => {
        console.error('[SignalR] Connection failed:', err);
      });

    return () => {
      const cleanup = async () => {
        try {
          if (hubConnectionRef.current) {
            await hubConnectionRef.current.stop();
          }
        } catch (err) {
          console.warn('[Chart] Error during cleanup:', err);
        } finally {
          hubConnectionRef.current = null;
        }
      }

      setIsConnected(false);
      cleanup();
    };
  }, []);

  return (
    <SignalRContext.Provider value={{ connection: hubConnectionRef.current, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);