/**
 * Complete Werewolf & Mafia Role Registry System
 * Includes all 42 classic Werewolf Telegram & Mafia roles with team alignments,
 * night priorities, action prompts, and custom role selection.
 */

export const TEAMS = {
  WEREWOLF: 'WEREWOLF',
  VILLAGER: 'VILLAGER',
  CULT: 'CULT',
  NEUTRAL: 'NEUTRAL'
};

export const ROLES = {
  // --- WEREWOLF TEAM ---
  WEREWOLF: {
    id: 'WEREWOLF',
    name: 'Werewolf',
    team: TEAMS.WEREWOLF,
    emoji: '🐺',
    description: 'Eliminate villagers during the night with your pack.',
    icon: 'Skull',
    color: 'rose',
    hasNightAction: true,
    actionPriority: 10,
    actionPrompt: 'Choose a villager to hunt tonight.'
  },
  ALPHA_WOLF: {
    id: 'ALPHA_WOLF',
    name: 'Alpha Wolf',
    team: TEAMS.WEREWOLF,
    emoji: '⚡️',
    description: 'Lead the pack. Has a chance to turn a target into a Werewolf.',
    icon: 'Zap',
    color: 'rose',
    hasNightAction: true,
    actionPriority: 10,
    actionPrompt: 'Choose a target to attack or infect.'
  },
  WOLF_CUB: {
    id: 'WOLF_CUB',
    name: 'Wolf Cub',
    team: TEAMS.WEREWOLF,
    emoji: '🐶',
    description: 'If you die, the Werewolves get 2 kills the next night out of rage.',
    icon: 'HeartOff',
    color: 'rose',
    hasNightAction: true,
    actionPriority: 10,
    actionPrompt: 'Choose a target to hunt tonight.'
  },
  SNOW_WOLF: {
    id: 'SNOW_WOLF',
    name: 'Snow Wolf',
    team: TEAMS.WEREWOLF,
    emoji: '🐺☃️',
    description: 'Freeze a player at night, blocking their night action and vote.',
    icon: 'Snowflake',
    color: 'cyan',
    hasNightAction: true,
    actionPriority: 3,
    actionPrompt: 'Choose a player to freeze tonight.'
  },
  WOLFMAN: {
    id: 'WOLFMAN',
    name: 'WolfMan',
    team: TEAMS.WEREWOLF,
    emoji: '👱🌚',
    description: 'You are a Werewolf, but Seers and Detectives inspect you as a Villager.',
    icon: 'User',
    color: 'rose',
    hasNightAction: true,
    actionPriority: 10,
    actionPrompt: 'Choose a target to hunt tonight.'
  },
  SORCERER: {
    id: 'SORCERER',
    name: 'Sorcerer',
    team: TEAMS.WEREWOLF,
    emoji: '🔮',
    description: 'Search for the Seer each night to aid the Werewolves.',
    icon: 'Eye',
    color: 'purple',
    hasNightAction: true,
    actionPriority: 4,
    actionPrompt: 'Choose a player to inspect for Seer powers.'
  },

  // --- VILLAGER / TOWN TEAM ---
  VILLAGER: {
    id: 'VILLAGER',
    name: 'Villager',
    team: TEAMS.VILLAGER,
    emoji: '👱',
    description: 'Uncover evil roles through daytime discussion and voting.',
    icon: 'UserCheck',
    color: 'emerald',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  SEER: {
    id: 'SEER',
    name: 'Seer',
    team: TEAMS.VILLAGER,
    emoji: '👳',
    description: 'Gaze into your crystal ball each night to uncover a player\'s true role.',
    icon: 'Eye',
    color: 'amber',
    hasNightAction: true,
    actionPriority: 2,
    actionPrompt: 'Choose a player to divine their secret role.'
  },
  APPRENTICE_SEER: {
    id: 'APPRENTICE_SEER',
    name: 'Apprentice Seer',
    team: TEAMS.VILLAGER,
    emoji: '🙇',
    description: 'Learn from the Seer. If the Seer dies, you become the new Seer.',
    icon: 'GraduationCap',
    color: 'amber',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  GUARDIAN_ANGEL: {
    id: 'GUARDIAN_ANGEL',
    name: 'Guardian Angel',
    team: TEAMS.VILLAGER,
    emoji: '👼',
    description: 'Protect a player each night from dying.',
    icon: 'Shield',
    color: 'blue',
    hasNightAction: true,
    actionPriority: 5,
    actionPrompt: 'Choose a player to protect tonight.'
  },
  DOCTOR: {
    id: 'DOCTOR',
    name: 'Doctor',
    team: TEAMS.VILLAGER,
    emoji: '🩺',
    description: 'Save a player from night attack each night.',
    icon: 'Cross',
    color: 'emerald',
    hasNightAction: true,
    actionPriority: 5,
    actionPrompt: 'Choose a player to heal tonight.'
  },
  DETECTIVE: {
    id: 'DETECTIVE',
    name: 'Detective',
    team: TEAMS.VILLAGER,
    emoji: '🕵',
    description: 'Investigate a player each night to uncover their team alignment.',
    icon: 'Search',
    color: 'sky',
    hasNightAction: true,
    actionPriority: 2,
    actionPrompt: 'Choose a player to investigate tonight.'
  },
  BEHOLDER: {
    id: 'BEHOLDER',
    name: 'Beholder',
    team: TEAMS.VILLAGER,
    emoji: '👁',
    description: 'You are told who the real Seer is on Night 1.',
    icon: 'Eye',
    color: 'indigo',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  HARLOT: {
    id: 'HARLOT',
    name: 'Harlot',
    team: TEAMS.VILLAGER,
    emoji: '💋',
    description: 'Visit a player each night. If you visit a Werewolf or the Werewolf visits you, you die!',
    icon: 'Heart',
    color: 'pink',
    hasNightAction: true,
    actionPriority: 6,
    actionPrompt: 'Choose a player to visit tonight.'
  },
  GUNNER: {
    id: 'GUNNER',
    name: 'Gunner',
    team: TEAMS.VILLAGER,
    emoji: '🔫',
    description: 'You have 2 silver bullets to shoot suspects during daytime discussion.',
    icon: 'Crosshair',
    color: 'orange',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  CULTIST_HUNTER: {
    id: 'CULTIST_HUNTER',
    name: 'Cultist Hunter',
    team: TEAMS.VILLAGER,
    emoji: '💂',
    description: 'Hunts Cultists. Kills any Cultist visited at night.',
    icon: 'Target',
    color: 'red',
    hasNightAction: true,
    actionPriority: 7,
    actionPrompt: 'Choose a player to hunt tonight.'
  },
  MASON: {
    id: 'MASON',
    name: 'Mason',
    team: TEAMS.VILLAGER,
    emoji: '👷',
    description: 'Knows all other Masons in the game.',
    icon: 'Users',
    color: 'slate',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  HUNTER: {
    id: 'HUNTER',
    name: 'Hunter',
    team: TEAMS.VILLAGER,
    emoji: '🎯',
    description: 'If you die, you take one player down with you.',
    icon: 'Crosshair',
    color: 'amber',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  MAYOR: {
    id: 'MAYOR',
    name: 'Mayor',
    team: TEAMS.VILLAGER,
    emoji: '🎖',
    description: 'Your vote counts twice once you reveal your identity.',
    icon: 'Award',
    color: 'yellow',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  PRINCE: {
    id: 'PRINCE',
    name: 'Prince',
    team: TEAMS.VILLAGER,
    emoji: '👑',
    description: 'Cannot be lynched by village vote on the first attempt.',
    icon: 'Crown',
    color: 'yellow',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  BLACKSMITH: {
    id: 'BLACKSMITH',
    name: 'Blacksmith',
    team: TEAMS.VILLAGER,
    emoji: '⚒',
    description: 'Can spread silver dust once per game to prevent Werewolf kills.',
    icon: 'Hammer',
    color: 'gray',
    hasNightAction: true,
    actionPriority: 1,
    actionPrompt: 'Use silver dust tonight?'
  },
  SANDMAN: {
    id: 'SANDMAN',
    name: 'Sandman',
    team: TEAMS.VILLAGER,
    emoji: '💤',
    description: 'Can put everyone to sleep once per game, cancelling night actions.',
    icon: 'Moon',
    color: 'indigo',
    hasNightAction: true,
    actionPriority: 1,
    actionPrompt: 'Cast sleep spell tonight?'
  },
  ORACLE: {
    id: 'ORACLE',
    name: 'Oracle',
    team: TEAMS.VILLAGER,
    emoji: '🌀',
    description: 'Learns a role each night that is NOT present in the game.',
    icon: 'Compass',
    color: 'teal',
    hasNightAction: true,
    actionPriority: 8,
    actionPrompt: null
  },
  LYCAN: {
    id: 'LYCAN',
    name: 'Lycan',
    team: TEAMS.VILLAGER,
    emoji: '🐺🌝',
    description: 'You are on the Villager team, but Seers inspect you as a Werewolf!',
    icon: 'Moon',
    color: 'emerald',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  PACIFIST: {
    id: 'PACIFIST',
    name: 'Pacifist',
    team: TEAMS.VILLAGER,
    emoji: '☮️',
    description: 'Can reveal identity once to cancel daytime voting.',
    icon: 'ShieldCheck',
    color: 'emerald',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  WISE_ELDER: {
    id: 'WISE_ELDER',
    name: 'Wise Elder',
    team: TEAMS.VILLAGER,
    emoji: '📚',
    description: 'Survives the first Werewolf attack.',
    icon: 'BookOpen',
    color: 'blue',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  GRAVE_DIGGER: {
    id: 'GRAVE_DIGGER',
    name: 'Grave Digger',
    team: TEAMS.VILLAGER,
    emoji: '☠️',
    description: 'Inspects graves to learn exact roles of eliminated players.',
    icon: 'Skull',
    color: 'slate',
    hasNightAction: true,
    actionPriority: 8,
    actionPrompt: 'Choose a grave to dig up tonight.'
  },
  CHEMIST: {
    id: 'CHEMIST',
    name: 'Chemist',
    team: TEAMS.VILLAGER,
    emoji: '👨‍🔬',
    description: 'Mixes potions; can poison one player during the game.',
    icon: 'FlaskConical',
    color: 'purple',
    hasNightAction: true,
    actionPriority: 6,
    actionPrompt: 'Choose a player to poison tonight.'
  },
  AUGUR: {
    id: 'AUGUR',
    name: 'Augur',
    team: TEAMS.VILLAGER,
    emoji: '🦅',
    description: 'Learns how many evil players remain alive.',
    icon: 'Feather',
    color: 'amber',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },

  // --- NEUTRAL & SOLO ROLES ---
  SERIAL_KILLER: {
    id: 'SERIAL_KILLER',
    name: 'Serial Killer',
    team: TEAMS.NEUTRAL,
    emoji: '🔪',
    description: 'Solo objective: Eliminate everyone else. Immune to Werewolf kills!',
    icon: 'Flame',
    color: 'rose',
    hasNightAction: true,
    actionPriority: 9,
    actionPrompt: 'Choose a player to murder tonight.'
  },
  TANNER: {
    id: 'TANNER',
    name: 'Tanner',
    team: TEAMS.NEUTRAL,
    emoji: '👺',
    description: 'Solo objective: Get lynched by the village to win instantly!',
    icon: 'Smile',
    color: 'purple',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  ARSONIST: {
    id: 'ARSONIST',
    name: 'Arsonist',
    team: TEAMS.NEUTRAL,
    emoji: '🔥',
    description: 'Douse players in oil at night, then ignite all doused targets at once!',
    icon: 'Flame',
    color: 'orange',
    hasNightAction: true,
    actionPriority: 9,
    actionPrompt: 'Choose a player to douse or ignite doused targets.'
  },
  FOOL: {
    id: 'FOOL',
    name: 'Fool',
    team: TEAMS.NEUTRAL,
    emoji: '🃏',
    description: 'You believe you are the Seer, but your visions are completely random!',
    icon: 'Sparkles',
    color: 'amber',
    hasNightAction: true,
    actionPriority: 2,
    actionPrompt: 'Choose a player to divine.'
  },
  CULTIST: {
    id: 'CULTIST',
    name: 'Cultist',
    team: TEAMS.CULT,
    emoji: '👤',
    description: 'Convert players to the Cult each night. Cult wins when everyone is converted.',
    icon: 'Users',
    color: 'purple',
    hasNightAction: true,
    actionPriority: 8,
    actionPrompt: 'Choose a player to recruit into the Cult.'
  },
  WILD_CHILD: {
    id: 'WILD_CHILD',
    name: 'Wild Child',
    team: TEAMS.VILLAGER,
    emoji: '👶',
    description: 'Pick a role model on Night 1. If your model dies, you become a Werewolf!',
    icon: 'Baby',
    color: 'yellow',
    hasNightAction: true,
    actionPriority: 1,
    actionPrompt: 'Select your role model.'
  },
  CUPID: {
    id: 'CUPID',
    name: 'Cupid',
    team: TEAMS.NEUTRAL,
    emoji: '🏹',
    description: 'Choose 2 lovers on Night 1. If one lover dies, the other dies of grief.',
    icon: 'Heart',
    color: 'pink',
    hasNightAction: true,
    actionPriority: 1,
    actionPrompt: 'Select 2 players to bind in love.'
  },
  DOPPELGANGER: {
    id: 'DOPPELGANGER',
    name: 'Doppelgänger',
    team: TEAMS.NEUTRAL,
    emoji: '🎭',
    description: 'Select a player on Night 1. Inherit their role when they die.',
    icon: 'Copy',
    color: 'slate',
    hasNightAction: true,
    actionPriority: 1,
    actionPrompt: 'Select a target to mimic.'
  },
  DRUNK: {
    id: 'DRUNK',
    name: 'Drunk',
    team: TEAMS.VILLAGER,
    emoji: '🍻',
    description: 'If eaten by Werewolves, the pack is intoxicated and gets no kill next night!',
    icon: 'Beer',
    color: 'yellow',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  CURSED: {
    id: 'CURSED',
    name: 'Cursed',
    team: TEAMS.VILLAGER,
    emoji: '😾',
    description: 'Acts as Villager, but if attacked by Werewolves, turns into a Werewolf instead!',
    icon: 'Cat',
    color: 'purple',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  TRAITOR: {
    id: 'TRAITOR',
    name: 'Traitor',
    team: TEAMS.VILLAGER,
    emoji: '🖕',
    description: 'Acts as Villager. If all Werewolves die, you become a Werewolf!',
    icon: 'UserX',
    color: 'rose',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  CLUMSY: {
    id: 'CLUMSY',
    name: 'Clumsy Guy',
    team: TEAMS.VILLAGER,
    emoji: '🤕',
    description: '50% chance your vote lands on a random player during Day voting.',
    icon: 'HelpCircle',
    color: 'amber',
    hasNightAction: false,
    actionPriority: 0,
    actionPrompt: null
  },
  TROUBLEMAKER: {
    id: 'TROUBLEMAKER',
    name: 'Troublemaker',
    team: TEAMS.VILLAGER,
    emoji: '🤯',
    description: 'Swap the roles of 2 players on Night 1 without their knowledge.',
    icon: 'Shuffle',
    color: 'rose',
    hasNightAction: true,
    actionPriority: 1,
    actionPrompt: 'Select 2 players to swap roles.'
  },
  THIEF: {
    id: 'THIEF',
    name: 'Thief',
    team: TEAMS.NEUTRAL,
    emoji: '😈',
    description: 'Steal a role from unassigned role cards on Night 1.',
    icon: 'Key',
    color: 'purple',
    hasNightAction: true,
    actionPriority: 1,
    actionPrompt: 'Select a secret role card to steal.'
  },
  SNOW_WOLF_COMPANION: {
    id: 'SNOW_WOLF_COMPANION',
    name: 'Snow Wolf',
    team: TEAMS.WEREWOLF,
    emoji: '🐺☃️',
    description: 'Werewolf companion with freezing snow powers.',
    icon: 'Snowflake',
    color: 'cyan',
    hasNightAction: true,
    actionPriority: 10,
    actionPrompt: 'Choose a player to freeze tonight.'
  }
};

class RoleRegistry {
  constructor() {
    this.roles = new Map(Object.entries(ROLES));
  }

  registerRole(roleConfig) {
    if (!roleConfig.id || !roleConfig.name || !roleConfig.team) {
      throw new Error('Invalid role configuration: id, name, and team are required.');
    }
    this.roles.set(roleConfig.id, roleConfig);
  }

  getRole(roleId) {
    return this.roles.get(roleId) || ROLES.VILLAGER;
  }

  getAllRoles() {
    return Array.from(this.roles.values());
  }

  /**
   * Generates a balanced role pool for any player count (3 up to 35+ players).
   */
  generateRolePool(playerCount, customSelection = null) {
    if (customSelection && Array.isArray(customSelection) && customSelection.length === playerCount) {
      return [...customSelection];
    }

    const pool = [];
    
    // Balanced Werewolf count
    let wolfCount = 1;
    if (playerCount >= 6) wolfCount = 2;
    if (playerCount >= 10) wolfCount = 3;
    if (playerCount >= 15) wolfCount = 4;
    if (playerCount >= 20) wolfCount = 5;

    pool.push('WEREWOLF');
    if (wolfCount >= 2) pool.push('ALPHA_WOLF');
    if (wolfCount >= 3) pool.push('WOLF_CUB');
    if (wolfCount >= 4) pool.push('WOLFMAN');
    while (pool.filter(r => ROLES[r].team === TEAMS.WEREWOLF).length < wolfCount) {
      pool.push('WEREWOLF');
    }

    // Add key town roles
    if (playerCount >= 4) pool.push('SEER');
    if (playerCount >= 5) pool.push('DOCTOR');
    if (playerCount >= 6) pool.push('DETECTIVE');
    if (playerCount >= 7) pool.push('GUNNER');
    if (playerCount >= 8) pool.push('GUARDIAN_ANGEL');
    if (playerCount >= 9) pool.push('TANNER');
    if (playerCount >= 10) pool.push('SERIAL_KILLER');
    if (playerCount >= 12) pool.push('CULTIST');

    // Fill remaining slots with Villagers
    while (pool.length < playerCount) {
      pool.push('VILLAGER');
    }

    // Shuffle pool using Fisher-Yates
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool;
  }
}

export const roleRegistry = new RoleRegistry();
