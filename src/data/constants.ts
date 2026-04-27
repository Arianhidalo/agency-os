import { Category, Priority, SabotageCategory, TimeBlock } from '../types';

export const CATEGORIES: Category[] = ['Fitness', 'Business', 'Health', 'Learning', 'Deep Work', 'Personal', 'Other'];
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
export const TIME_BLOCKS: TimeBlock[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

export const SABOTAGE_PROFILES: Record<SabotageCategory, { description: string; examples: string[] }> = {
  'The Negotiator': {
    description: 'This voice makes delay sound logical. It tells you tomorrow will be better.',
    examples: ['I’ll do it later.', 'I need better conditions.', 'It’s not efficient to start now.', 'I deserve a break.'],
  },
  'The Assassin': {
    description: 'This voice attacks your identity. It uses shame to make you stop moving.',
    examples: ['Who do you think you are?', 'You always fail.', 'You’re not built for this.', 'People will laugh.'],
  },
  'The Seducer': {
    description: 'This voice offers comfort, dopamine and escape.',
    examples: ['Just check your phone.', 'One more episode.', 'You need comfort food.', 'You deserve to relax.'],
  },
  'The Nihilist': {
    description: 'This voice questions the meaning of the mission.',
    examples: ['None of this matters.', 'Why suffer?', 'Discipline is making me miserable.', 'Average is enough.'],
  },
  'The Arsonist': {
    description: 'This voice turns one small slip into total collapse.',
    examples: ['The day is ruined.', 'You broke the streak.', 'Might as well quit everything today.', 'Start again tomorrow.'],
  },
  Other: {
    description: 'Use this when the failure pattern does not fit the known profiles.',
    examples: ['External event', 'Unexpected emergency', 'Custom pattern'],
  },
};

export const STRATEGIC_PHRASES = [
  'Your job is not to feel ready. Your job is to execute.',
  'A slip is an event, not an identity.',
  'Name the enemy. Break the spell.',
  'Change the tire. Keep driving.',
  'Execute the next correct action.',
];
