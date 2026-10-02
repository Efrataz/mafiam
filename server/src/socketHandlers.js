import { gameManager, PHASES } from './gameEngine.js';
import { generatePlayerToken, verifyPlayerToken, verifyAdminToken } from './auth.js';

export const setupSocketHandlers = (io) => {
  const broadcastGameState = (gameRoom) => {
    if (!gameRoom) return;

    // TikTok Live Stream view broadcast (/game/:code/live)
    io.to(`live_${gameRoom.code}`).emit('public_live_update', gameRoom.getPublicLiveState());

    // Individual player updates (/game/:code)
    for (const [socketId] of gameRoom.players.entries()) {
      const playerSocket = io.sockets.sockets.get(socketId);
      if (playerSocket) {
        playerSocket.emit('game_state_update', gameRoom.getPublicStateForPlayer(socketId));
      }
    }

    // Admin console update (/admin/game/:code)
    io.to(`admin_${gameRoom.code}`).emit('admin_state_update', gameRoom.getAdminState());
  };

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    /**
     * Join Public TikTok Live Stream View (/game/:code/live)
     */
    socket.on('join_public_live', ({ gameCode }) => {
      const room = gameManager.getRoom(gameCode);
      if (!room) {
        return socket.emit('error_message', { message: 'Game room not found.' });
      }

      socket.join(`live_${room.code}`);
      socket.emit('public_live_update', room.getPublicLiveState());
    });

    /**
     * Create new game lobby
     */
    socket.on('create_game', ({ hostName }) => {
      try {
        const room = gameManager.createRoom(socket.id, io);
        const hostPlayer = room.addPlayer(socket.id, hostName || 'Host', true);
        
        socket.join(room.code);
        socket.join(`admin_${room.code}`);

        const token = generatePlayerToken(room.code, socket.id);
        
        socket.emit('game_created', {
          gameCode: room.code,
          player: hostPlayer,
          token,
          state: room.getPublicStateForPlayer(socket.id)
        });

        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    /**
     * Player joins existing game room
     */
    socket.on('join_game', ({ gameCode, playerName }) => {
      try {
        const room = gameManager.getRoom(gameCode);
        if (!room) {
          return socket.emit('error_message', { message: 'Game room not found. Check your 6-digit code.' });
        }

        if (room.status !== PHASES.LOBBY) {
          return socket.emit('error_message', { message: 'Game is already in progress.' });
        }

        const player = room.addPlayer(socket.id, playerName, false);
        socket.join(room.code);

        const token = generatePlayerToken(room.code, socket.id);

        socket.emit('game_joined', {
          gameCode: room.code,
          player,
          token,
          state: room.getPublicStateForPlayer(socket.id)
        });

        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    /**
     * Join Admin Console (/admin/game/:code)
     */
    socket.on('join_admin_dashboard', ({ gameCode, adminToken }) => {
      const room = gameManager.getRoom(gameCode);
      if (!room) {
        return socket.emit('error_message', { message: 'Game room not found.' });
      }

      if (adminToken) {
        const admin = verifyAdminToken(adminToken);
        if (!admin) {
          return socket.emit('error_message', { message: 'Unauthorized admin token.' });
        }
      }

      socket.join(`admin_${room.code}`);
      socket.emit('admin_state_update', room.getAdminState());
    });

    /**
     * Admin/Host starts the game
     */
    socket.on('start_game', ({ gameCode }) => {
      try {
        const room = gameManager.getRoom(gameCode);
        if (!room) return socket.emit('error_message', { message: 'Room not found.' });

        const player = room.players.get(socket.id);
        if (!player || !player.isHost) {
          return socket.emit('error_message', { message: 'Only the room Host can start the game.' });
        }

        room.startGame();

        for (const [sId, p] of room.players.entries()) {
          const clientSocket = io.sockets.sockets.get(sId);
          if (clientSocket) {
            clientSocket.emit('private:role_assignment', {
              role: p.role,
              roleDef: p.roleDef
            });
          }
        }

        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    /**
     * Submit Day Vote
     */
    socket.on('submit_vote', ({ gameCode, targetId }) => {
      try {
        const room = gameManager.getRoom(gameCode);
        if (!room) return socket.emit('error_message', { message: 'Room not found.' });

        room.submitVote(socket.id, targetId);
        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    /**
     * Submit Night Action
     */
    socket.on('submit_night_action', ({ gameCode, targetId, extraTargetId }) => {
      try {
        const room = gameManager.getRoom(gameCode);
        if (!room) return socket.emit('error_message', { message: 'Room not found.' });

        const result = room.submitNightAction(socket.id, targetId, extraTargetId);
        
        if (result) {
          socket.emit('private:investigation_result', result);
        }

        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    /**
     * Send Real-Time Chat Message
     */
    socket.on('send_chat_message', ({ gameCode, text }) => {
      try {
        const room = gameManager.getRoom(gameCode);
        if (!room) return;

        room.addChatMessage(socket.id, text);
        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    /**
     * ADMIN LYNCH DECISION (Requirement 15)
     */
    socket.on('admin_lynch_decision', ({ gameCode, targetId }) => {
      try {
        const room = gameManager.getRoom(gameCode);
        if (!room) return socket.emit('error_message', { message: 'Room not found.' });

        room.executeAdminLynchChoice(targetId);
        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    /**
     * ADMIN UPDATE CONFIGURATION (Requirement 13 & 20)
     */
    socket.on('admin_update_config', ({ gameCode, config }) => {
      try {
        const room = gameManager.getRoom(gameCode);
        if (!room) return;

        room.updateConfig(config);
        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    /**
     * ADMIN CHAT MODERATION
     */
    socket.on('admin_delete_chat_message', ({ gameCode, messageId }) => {
      const room = gameManager.getRoom(gameCode);
      if (!room) return;
      room.deleteChatMessage(messageId);
      broadcastGameState(room);
    });

    socket.on('admin_mute_player', ({ gameCode, playerId }) => {
      const room = gameManager.getRoom(gameCode);
      if (!room) return;
      room.toggleMutePlayer(playerId);
      broadcastGameState(room);
    });

    /**
     * Host phase override actions
     */
    socket.on('host_action', ({ gameCode, actionType, targetId }) => {
      try {
        const room = gameManager.getRoom(gameCode);
        if (!room) return socket.emit('error_message', { message: 'Room not found.' });

        const player = room.players.get(socket.id);
        const isHost = player && player.isHost;
        const isAdminInRoom = socket.rooms.has(`admin_${room.code}`);

        if (!isHost && !isAdminInRoom) {
          return socket.emit('error_message', { message: 'Unauthorized host action.' });
        }

        switch (actionType) {
          case 'RESOLVE_NIGHT':
            room.resolveNightPhase();
            break;
          case 'START_DAY_VOTING':
            room.startDayVoting();
            break;
          case 'RESOLVE_DAY_VOTING':
            room.resolveDayVoting();
            break;
          case 'EXECUTE_LYNCH':
            room.executeAdminLynchChoice(targetId);
            break;
          case 'RESTART_GAME':
            room.stopPhaseTimer();
            room.status = PHASES.LOBBY;
            room.winner = null;
            for (const p of room.players.values()) {
              p.isAlive = true;
              p.role = null;
              p.voteTargetId = null;
              p.nightTargetId = null;
            }
            break;
          default:
            throw new Error('Unknown host action');
        }

        broadcastGameState(room);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      for (const room of gameManager.rooms.values()) {
        if (room.players.has(socket.id)) {
          room.removePlayer(socket.id);
          broadcastGameState(room);
        }
      }
    });
  });
};
