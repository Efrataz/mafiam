import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [privateRole, setPrivateRole] = useState(null);
  const [investigationResult, setInvestigationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Determine backend server endpoint (Environment Variable or current origin)
    const backendUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
    
    console.log('[Socket] Connecting to backend server:', backendUrl);
    
    const newSocket = io(backendUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('game_state_update', (state) => {
      console.log('[Socket] Game state updated:', state);
      setGameState(state);
    });

    newSocket.on('private:role_assignment', (data) => {
      console.log('[Socket] Private role assigned securely:', data);
      setPrivateRole(data);
    });

    newSocket.on('private:investigation_result', (data) => {
      console.log('[Socket] Investigation result received:', data);
      setInvestigationResult(data);
    });

    newSocket.on('error_message', (data) => {
      console.error('[Socket Error]:', data.message);
      setErrorMessage(data.message);
      setTimeout(() => setErrorMessage(null), 5000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createGame = (hostName) => {
    if (!socket) return;
    setPrivateRole(null);
    setInvestigationResult(null);
    socket.emit('create_game', { hostName });
  };

  const joinGame = (gameCode, playerName) => {
    if (!socket) return;
    setPrivateRole(null);
    setInvestigationResult(null);
    socket.emit('join_game', { gameCode: gameCode.toUpperCase(), playerName });
  };

  const startGame = (gameCode) => {
    if (!socket) return;
    socket.emit('start_game', { gameCode });
  };

  const submitVote = (gameCode, targetId) => {
    if (!socket) return;
    socket.emit('submit_vote', { gameCode, targetId });
  };

  const submitNightAction = (gameCode, targetId, extraTargetId = null) => {
    if (!socket) return;
    socket.emit('submit_night_action', { gameCode, targetId, extraTargetId });
  };

  const sendHostAction = (gameCode, actionType, targetId = null) => {
    if (!socket) return;
    socket.emit('host_action', { gameCode, actionType, targetId });
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      gameState,
      privateRole,
      investigationResult,
      errorMessage,
      createGame,
      joinGame,
      startGame,
      submitVote,
      submitNightAction,
      sendHostAction,
      clearError: () => setErrorMessage(null)
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
