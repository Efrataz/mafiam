import { roleRegistry, ROLES, TEAMS } from './roles/roleRegistry.js';
import { recordGameLog, saveGameSession } from './db.js';

export const PHASES = {
  LOBBY: 'LOBBY',
  NIGHT: 'NIGHT',
  DAY_DISCUSSION: 'DAY_DISCUSSION',
  DAY_VOTING: 'DAY_VOTING',
  VOTING_ENDED_PENDING_ADMIN_DECISION: 'VOTING_ENDED_PENDING_ADMIN_DECISION',
  GAME_OVER: 'GAME_OVER'
};

export const DEFAULT_PHASE_DURATION = 90;

export class GameRoom {
  constructor(code, hostSocketId, io = null) {
    this.code = code;
    this.status = PHASES.LOBBY;
    this.round = 1;
    this.hostSocketId = hostSocketId;
    this.players = new Map();
    this.winner = null;
    this.logs = [];
    this.eliminatedLastRound = null;
    this.dramaticAnnouncement = null;
    this.createdAt = new Date();
    this.io = io;

    // Room Configurations (Configurable by Admin)
    this.voteVisibility = 'VISIBLE'; // 'VISIBLE' | 'HIDDEN' | 'REVEAL_AFTER'
    this.revealRoleOnDeath = true;
    this.chatEnabled = true;
    this.mutedPlayerIds = new Set();
    this.chatMessages = [];

    // Voting Candidates for Admin Lynch Choice
    this.votingCandidates = [];

    // Automatic Phase Timer (90s)
    this.phaseTimeRemaining = DEFAULT_PHASE_DURATION;
    this.timerInterval = null;
  }

  setIo(io) {
    this.io = io;
  }

  updateConfig({ voteVisibility, revealRoleOnDeath, chatEnabled }) {
    if (voteVisibility !== undefined) this.voteVisibility = voteVisibility;
    if (revealRoleOnDeath !== undefined) this.revealRoleOnDeath = revealRoleOnDeath;
    if (chatEnabled !== undefined) this.chatEnabled = chatEnabled;
    this.addLog(this.status, 'CONFIG_UPDATE', `Room config updated: VoteVis=${this.voteVisibility}, RoleReveal=${this.revealRoleOnDeath}, Chat=${this.chatEnabled}`);
  }

  startPhaseTimer() {
    this.stopPhaseTimer();
    this.phaseTimeRemaining = DEFAULT_PHASE_DURATION;

    this.timerInterval = setInterval(() => {
      if (this.status === PHASES.LOBBY || this.status === PHASES.GAME_OVER || this.status === PHASES.VOTING_ENDED_PENDING_ADMIN_DECISION) {
        this.stopPhaseTimer();
        return;
      }

      this.phaseTimeRemaining -= 1;

      if (this.io) {
        this.broadcastStateUpdate();
      }

      if (this.phaseTimeRemaining <= 0) {
        this.addLog(this.status, 'TIMER_EXPIRED', `90-second phase timer expired. Auto-advancing phase...`);
        this.handleAutoPhaseTransition();
      }
    }, 1000);
  }

  stopPhaseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleAutoPhaseTransition() {
    if (this.status === PHASES.NIGHT) {
      this.resolveNightPhase();
    } else if (this.status === PHASES.DAY_DISCUSSION) {
      this.startDayVoting();
    } else if (this.status === PHASES.DAY_VOTING) {
      this.resolveDayVoting();
    }
  }

  broadcastStateUpdate() {
    if (!this.io) return;
    
    // Broadcast public stream payload to TikTok Live view (/game/:code/live)
    this.io.to(`live_${this.code}`).emit('public_live_update', this.getPublicLiveState());

    // Broadcast individual player payloads to each player socket (/game/:code)
    for (const [socketId] of this.players.entries()) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('game_state_update', this.getPublicStateForPlayer(socketId));
      }
    }

    // Broadcast unmasked state to admin console (/admin/game/:code)
    this.io.to(`admin_${this.code}`).emit('admin_state_update', this.getAdminState());
  }

  generateUniquePlayerName(baseName) {
    let name = baseName.trim();
    let counter = 1;
    const existingNames = Array.from(this.players.values()).map(p => p.name.toLowerCase());
    while (existingNames.includes(name.toLowerCase())) {
      name = `${baseName} (${counter++})`;
    }
    return name;
  }

  addPlayer(socketId, name, isHost = false) {
    const sanitizedName = this.generateUniquePlayerName(name || 'Player');
    const player = {
      id: socketId,
      name: sanitizedName,
      role: null,
      isAlive: true,
      isHost,
      connected: true,
      voteTargetId: null,
      nightTargetId: null
    };
    this.players.set(socketId, player);
    this.addLog(PHASES.LOBBY, 'PLAYER_JOIN', `${player.name} joined the game lobby.`);
    return player;
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (!player) return null;

    if (this.status === PHASES.LOBBY) {
      this.players.delete(socketId);
      this.addLog(PHASES.LOBBY, 'PLAYER_LEAVE', `${player.name} left the lobby.`);
    } else {
      player.connected = false;
      this.addLog(this.status, 'PLAYER_DISCONNECT', `${player.name} disconnected.`);
    }
    return player;
  }

  addLog(phase, eventType, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      phase,
      eventType,
      message
    };
    this.logs.push(logEntry);
    recordGameLog(this.code, phase, eventType, message).catch(console.error);
  }

  // Chat Engine
  addChatMessage(senderSocketId, text) {
    if (!this.chatEnabled) throw new Error('Chat is currently disabled by admin.');
    if (this.mutedPlayerIds.has(senderSocketId)) throw new Error('You are muted by the admin.');

    const player = this.players.get(senderSocketId);
    const senderName = player ? player.name : 'Unknown';

    const messageObj = {
      id: Date.now() + Math.random().toString(),
      senderId: senderSocketId,
      senderName,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.chatMessages.push(messageObj);
    return messageObj;
  }

  deleteChatMessage(messageId) {
    this.chatMessages = this.chatMessages.filter(m => m.id !== messageId);
  }

  toggleMutePlayer(playerId) {
    if (this.mutedPlayerIds.has(playerId)) {
      this.mutedPlayerIds.delete(playerId);
    } else {
      this.mutedPlayerIds.add(playerId);
    }
  }

  startGame(customRoleList = null) {
    if (this.status !== PHASES.LOBBY) {
      throw new Error('Game has already started.');
    }

    const playerList = Array.from(this.players.values());
    if (playerList.length < 3) {
      throw new Error('At least 3 players are required to start a game.');
    }

    const rolePool = roleRegistry.generateRolePool(playerList.length, customRoleList);
    
    playerList.forEach((player, index) => {
      player.role = rolePool[index];
      player.isAlive = true;
      player.voteTargetId = null;
      player.nightTargetId = null;
    });

    this.status = PHASES.NIGHT;
    this.round = 1;
    this.winner = null;
    this.eliminatedLastRound = null;
    this.dramaticAnnouncement = null;
    
    this.addLog(PHASES.NIGHT, 'GAME_START', `Game started with ${playerList.length} players. Entering Night 1 (90s Timer).`);
    saveGameSession(this.code, this.status).catch(console.error);

    this.startPhaseTimer();
    return true;
  }

  submitVote(voterId, targetId) {
    if (this.status !== PHASES.DAY_VOTING) {
      throw new Error('Voting is only allowed during the Day Voting phase.');
    }

    const voter = this.players.get(voterId);
    if (!voter || !voter.isAlive) {
      throw new Error('Only living players are permitted to vote.');
    }

    if (voter.voteTargetId) {
      throw new Error('You have already submitted your vote.');
    }

    if (targetId) {
      const target = this.players.get(targetId);
      if (!target || !target.isAlive) {
        throw new Error('You can only vote for living players.');
      }
    }

    voter.voteTargetId = targetId || null;
    this.addLog(PHASES.DAY_VOTING, 'VOTE_SUBMITTED', `${voter.name} submitted their vote.`);
    return true;
  }

  submitNightAction(actorId, targetId, extraTargetId = null) {
    if (this.status !== PHASES.NIGHT) {
      throw new Error('Night actions are only allowed during the Night phase.');
    }

    const actor = this.players.get(actorId);
    if (!actor || !actor.isAlive) {
      throw new Error('Only living players can perform night actions.');
    }

    const roleDef = roleRegistry.getRole(actor.role);
    if (!roleDef.hasNightAction) {
      throw new Error('Your role does not have a night action.');
    }

    if (targetId) {
      const target = this.players.get(targetId);
      if (!target || !target.isAlive) {
        throw new Error('Target must be an alive player.');
      }
    }

    actor.nightTargetId = targetId || null;
    this.addLog(PHASES.NIGHT, 'NIGHT_ACTION', `${actor.name} (${actor.role}) selected a night target.`);

    if ((actor.role === 'SEER' || actor.role === 'DETECTIVE') && targetId) {
      const targetPlayer = this.players.get(targetId);
      const targetRoleDef = roleRegistry.getRole(targetPlayer.role);
      const isWolf = targetRoleDef.team === TEAMS.WEREWOLF && targetPlayer.role !== 'WOLFMAN';
      
      return {
        investigatedId: targetId,
        investigatedName: targetPlayer.name,
        result: isWolf ? 'WEREWOLF' : 'VILLAGER / NOT WEREWOLF'
      };
    }

    return null;
  }

  resolveNightPhase() {
    if (this.status !== PHASES.NIGHT) return;

    let wolfTargetId = null;
    let protectTargetId = null;

    const wolfVotes = new Map();
    for (const player of this.players.values()) {
      if (!player.isAlive) continue;

      const rDef = roleRegistry.getRole(player.role);
      if (rDef.team === TEAMS.WEREWOLF && player.nightTargetId) {
        wolfVotes.set(player.nightTargetId, (wolfVotes.get(player.nightTargetId) || 0) + 1);
      } else if ((player.role === 'DOCTOR' || player.role === 'GUARDIAN_ANGEL') && player.nightTargetId) {
        protectTargetId = player.nightTargetId;
      }
    }

    let maxVotes = 0;
    for (const [targetId, count] of wolfVotes.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        wolfTargetId = targetId;
      }
    }

    let eliminatedPlayer = null;

    if (wolfTargetId) {
      if (wolfTargetId === protectTargetId) {
        this.addLog(PHASES.NIGHT, 'NIGHT_RESOLVE', `The Doctor / Guardian Angel protected the target! No one died.`);
        this.dramaticAnnouncement = null;
      } else {
        const victim = this.players.get(wolfTargetId);
        if (victim) {
          if (victim.role === 'CURSED') {
            victim.role = 'WEREWOLF';
            this.addLog(PHASES.NIGHT, 'NIGHT_RESOLVE', `${victim.name} was attacked but turned into a Werewolf!`);
          } else {
            victim.isAlive = false;
            eliminatedPlayer = { id: victim.id, name: victim.name, role: victim.role };
            this.eliminatedLastRound = eliminatedPlayer;
            
            // Dramatic Public Death Announcement
            this.dramaticAnnouncement = {
              type: 'NIGHT_KILL',
              playerName: victim.name,
              message: `🌙 NIGHT HAS ENDED 💀 A PLAYER HAS BEEN KILLED`
            };

            this.addLog(PHASES.NIGHT, 'NIGHT_RESOLVE', `${victim.name} was eliminated during the night.`);
          }
        }
      }
    } else {
      this.dramaticAnnouncement = null;
      this.addLog(PHASES.NIGHT, 'NIGHT_RESOLVE', `Night passed peacefully. No target was attacked.`);
    }

    for (const player of this.players.values()) {
      player.nightTargetId = null;
    }

    if (this.checkWinCondition()) {
      this.stopPhaseTimer();
      return;
    }

    this.status = PHASES.DAY_DISCUSSION;
    this.startPhaseTimer();
  }

  startDayVoting() {
    if (this.status !== PHASES.DAY_DISCUSSION) return;
    this.status = PHASES.DAY_VOTING;
    this.dramaticAnnouncement = null;
    for (const p of this.players.values()) {
      p.voteTargetId = null;
    }
    this.addLog(PHASES.DAY_VOTING, 'PHASE_CHANGE', `Day Voting has begun (90s Timer). Players cast your votes!`);
    this.startPhaseTimer();
  }

  /**
   * Resolves Daytime Voting and compiles candidates for Admin Lynch Decision.
   */
  resolveDayVoting() {
    if (this.status !== PHASES.DAY_VOTING) return;

    const tallyMap = new Map();
    for (const p of this.players.values()) {
      if (p.isAlive && p.voteTargetId) {
        tallyMap.set(p.voteTargetId, (tallyMap.get(p.voteTargetId) || 0) + 1);
      }
    }

    // Build candidates list sorted by vote count
    this.votingCandidates = Array.from(tallyMap.entries()).map(([targetId, count]) => {
      const targetPlayer = this.players.get(targetId);
      return {
        id: targetId,
        name: targetPlayer ? targetPlayer.name : 'Unknown',
        voteCount: count
      };
    }).sort((a, b) => b.voteCount - a.voteCount);

    // Transition to VOTING_ENDED_PENDING_ADMIN_DECISION
    this.status = PHASES.VOTING_ENDED_PENDING_ADMIN_DECISION;
    this.stopPhaseTimer();
    this.addLog(PHASES.VOTING_ENDED_PENDING_ADMIN_DECISION, 'VOTE_COMPLETE', `Voting completed. Awaiting Admin Lynch Decision...`);
  }

  /**
   * ADMIN EXECUTES FINAL LYNCH CHOICE (Requirement 15)
   */
  executeAdminLynchChoice(targetId) {
    if (this.status !== PHASES.VOTING_ENDED_PENDING_ADMIN_DECISION && this.status !== PHASES.DAY_VOTING) {
      throw new Error('Admin Lynch Choice can only be executed after voting finishes.');
    }

    if (!targetId || targetId === 'NO_LYNCH') {
      this.eliminatedLastRound = null;
      this.dramaticAnnouncement = {
        type: 'NO_LYNCH',
        playerName: null,
        message: '⚖️ THE VILLAGE HAS DECIDED TO SPARE ALL SUSPECTS'
      };
      this.addLog(this.status, 'ADMIN_NO_LYNCH', `Admin decided NOT to lynch any player this round.`);
      this.advanceToNextRound();
      return null;
    }

    const target = this.players.get(targetId);
    if (!target || !target.isAlive) {
      throw new Error('Target player is not alive or invalid.');
    }

    // TANNER INSTANT WIN
    if (target.role === 'TANNER') {
      target.isAlive = false;
      this.status = PHASES.GAME_OVER;
      this.winner = 'TANNER';
      this.eliminatedLastRound = { id: target.id, name: target.name, role: target.role };
      this.dramaticAnnouncement = {
        type: 'LYNCH',
        playerName: target.name,
        role: target.role,
        message: `⚖️ THE VILLAGE HAS SPOKEN 💀 ${target.name.toUpperCase()} WAS LYNCHED (TANNER WIN!)`
      };
      this.addLog(PHASES.GAME_OVER, 'TANNER_WIN', `${target.name} (Tanner) was lynched and won the game!`);
      this.stopPhaseTimer();
      saveGameSession(this.code, this.status, this.winner).catch(console.error);
      return this.eliminatedLastRound;
    }

    target.isAlive = false;
    const eliminated = { id: target.id, name: target.name, role: target.role };
    this.eliminatedLastRound = eliminated;

    // Dramatic Lynch Announcement
    this.dramaticAnnouncement = {
      type: 'LYNCH',
      playerName: target.name,
      role: this.revealRoleOnDeath ? target.role : 'HIDDEN',
      message: `⚖️ THE VILLAGE HAS SPOKEN 💀 ${target.name.toUpperCase()} HAS BEEN LYNCHED`
    };

    this.addLog(this.status, 'ADMIN_LYNCH', `${target.name} was lynched by Admin decision.`);

    if (this.checkWinCondition()) {
      this.stopPhaseTimer();
      return eliminated;
    }

    this.advanceToNextRound();
    return eliminated;
  }

  advanceToNextRound() {
    this.round += 1;
    this.status = PHASES.NIGHT;
    for (const p of this.players.values()) {
      p.voteTargetId = null;
      p.nightTargetId = null;
    }
    this.addLog(PHASES.NIGHT, 'ROUND_ADVANCE', `Advancing to Round ${this.round} Night phase (90s Timer).`);
    this.startPhaseTimer();
  }

  checkWinCondition() {
    let aliveWolves = 0;
    let aliveVillagers = 0;
    let aliveSK = 0;

    for (const p of this.players.values()) {
      if (p.isAlive) {
        const rDef = roleRegistry.getRole(p.role);
        if (rDef.team === TEAMS.WEREWOLF) aliveWolves++;
        else if (p.role === 'SERIAL_KILLER') aliveSK++;
        else aliveVillagers++;
      }
    }

    if (aliveSK > 0 && aliveWolves === 0 && aliveVillagers <= 1) {
      this.status = PHASES.GAME_OVER;
      this.winner = 'SERIAL KILLER';
      this.addLog(PHASES.GAME_OVER, 'WIN_CONDITION', 'Serial Killer wins! Everyone else has been murdered.');
      this.stopPhaseTimer();
      saveGameSession(this.code, this.status, this.winner).catch(console.error);
      return true;
    }

    if (aliveWolves === 0 && aliveSK === 0) {
      this.status = PHASES.GAME_OVER;
      this.winner = TEAMS.VILLAGER;
      this.addLog(PHASES.GAME_OVER, 'WIN_CONDITION', 'Villagers win! All evil Werewolves have been eliminated.');
      this.stopPhaseTimer();
      saveGameSession(this.code, this.status, this.winner).catch(console.error);
      return true;
    }

    if (aliveWolves >= aliveVillagers + aliveSK) {
      this.status = PHASES.GAME_OVER;
      this.winner = TEAMS.WEREWOLF;
      this.addLog(PHASES.GAME_OVER, 'WIN_CONDITION', 'Werewolves win! The pack equals or outnumbers the village.');
      this.stopPhaseTimer();
      saveGameSession(this.code, this.status, this.winner).catch(console.error);
      return true;
    }

    return false;
  }

  /**
   * PUBLIC STREAM STATE FOR TIKTOK LIVE STREAM (/game/:code/live)
   * STRICT SECURITY: ZERO secret roles, ZERO private actions, ZERO admin controls!
   */
  getPublicLiveState() {
    const publicPlayerList = Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      isAlive: p.isAlive,
      connected: p.connected,
      // Public view NEVER gets unmasked roles during play!
      role: (this.status === PHASES.GAME_OVER) ? p.role : null
    }));

    // Vote tally visibility based on admin config
    let voteTally = {};
    if (this.voteVisibility === 'VISIBLE' || 
       (this.voteVisibility === 'REVEAL_AFTER' && (this.status === PHASES.VOTING_ENDED_PENDING_ADMIN_DECISION || this.status === PHASES.GAME_OVER))) {
      for (const p of this.players.values()) {
        if (p.isAlive && p.voteTargetId) {
          voteTally[p.voteTargetId] = (voteTally[p.voteTargetId] || 0) + 1;
        }
      }
    }

    return {
      code: this.code,
      status: this.status,
      round: this.round,
      winner: this.winner,
      phaseTimeRemaining: this.phaseTimeRemaining,
      players: publicPlayerList,
      voteTally,
      voteVisibility: this.voteVisibility,
      revealRoleOnDeath: this.revealRoleOnDeath,
      chatEnabled: this.chatEnabled,
      eliminatedLastRound: this.eliminatedLastRound,
      dramaticAnnouncement: this.dramaticAnnouncement,
      chatMessages: this.chatEnabled ? this.chatMessages.slice(-20) : []
    };
  }

  /**
   * PRIVATE PLAYER STATE (/game/:code)
   * Player sees ONLY their own private secret role and personal night prompt!
   */
  getPublicStateForPlayer(socketId) {
    const currentPlayer = this.players.get(socketId);
    const sanitizedPlayers = [];

    const isCurrentWolf = currentPlayer && roleRegistry.getRole(currentPlayer.role).team === TEAMS.WEREWOLF;

    for (const player of this.players.values()) {
      const isSelf = player.id === socketId;
      const isTeammateWolf = isCurrentWolf && roleRegistry.getRole(player.role).team === TEAMS.WEREWOLF;
      const isGameOver = this.status === PHASES.GAME_OVER;

      sanitizedPlayers.push({
        id: player.id,
        name: player.name,
        isAlive: player.isAlive,
        isHost: player.isHost,
        connected: player.connected,
        voteTargetId: player.voteTargetId,
        role: (isSelf || isTeammateWolf || isGameOver) ? player.role : null,
        roleDef: (isSelf || isTeammateWolf || isGameOver) ? roleRegistry.getRole(player.role) : null
      });
    }

    let voteTally = {};
    if (this.voteVisibility === 'VISIBLE' || 
       (this.voteVisibility === 'REVEAL_AFTER' && (this.status === PHASES.VOTING_ENDED_PENDING_ADMIN_DECISION || this.status === PHASES.GAME_OVER))) {
      for (const p of this.players.values()) {
        if (p.isAlive && p.voteTargetId) {
          voteTally[p.voteTargetId] = (voteTally[p.voteTargetId] || 0) + 1;
        }
      }
    }

    return {
      code: this.code,
      status: this.status,
      round: this.round,
      winner: this.winner,
      phaseTimeRemaining: this.phaseTimeRemaining,
      players: sanitizedPlayers,
      voteTally,
      voteVisibility: this.voteVisibility,
      revealRoleOnDeath: this.revealRoleOnDeath,
      chatEnabled: this.chatEnabled,
      eliminatedLastRound: this.eliminatedLastRound,
      dramaticAnnouncement: this.dramaticAnnouncement,
      chatMessages: this.chatEnabled ? this.chatMessages.slice(-30) : [],
      self: currentPlayer ? {
        id: currentPlayer.id,
        name: currentPlayer.name,
        role: currentPlayer.role,
        roleDef: roleRegistry.getRole(currentPlayer.role),
        isAlive: currentPlayer.isAlive,
        isHost: currentPlayer.isHost,
        voteTargetId: currentPlayer.voteTargetId,
        nightTargetId: currentPlayer.nightTargetId
      } : null
    };
  }

  /**
   * PRIVATE ADMIN STATE (/admin/game/:code)
   * Unmasked player roles, candidate lynch buttons, live vote breakdown & chat moderation tools.
   */
  getAdminState() {
    const playerList = Array.from(this.players.values()).map(p => ({
      ...p,
      roleDef: p.role ? roleRegistry.getRole(p.role) : null
    }));

    const voteTally = {};
    for (const p of this.players.values()) {
      if (p.isAlive && p.voteTargetId) {
        voteTally[p.voteTargetId] = (voteTally[p.voteTargetId] || 0) + 1;
      }
    }

    return {
      code: this.code,
      status: this.status,
      round: this.round,
      winner: this.winner,
      phaseTimeRemaining: this.phaseTimeRemaining,
      players: playerList,
      voteTally,
      votingCandidates: this.votingCandidates,
      voteVisibility: this.voteVisibility,
      revealRoleOnDeath: this.revealRoleOnDeath,
      chatEnabled: this.chatEnabled,
      mutedPlayerIds: Array.from(this.mutedPlayerIds),
      eliminatedLastRound: this.eliminatedLastRound,
      dramaticAnnouncement: this.dramaticAnnouncement,
      chatMessages: this.chatMessages,
      logs: this.logs,
      createdAt: this.createdAt
    };
  }
}

class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(hostSocketId, io = null) {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(code));

    const room = new GameRoom(code, hostSocketId, io);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase()) || null;
  }

  deleteRoom(code) {
    const room = this.getRoom(code);
    if (room) room.stopPhaseTimer();
    this.rooms.delete(code.toUpperCase());
  }
}

export const gameManager = new GameManager();
