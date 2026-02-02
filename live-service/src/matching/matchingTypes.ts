export const MATCH_STATE = {
  IDLE: 'IDLE',
  SEARCHING: 'SEARCHING',
  MATCHED: 'MATCHED',
} as const;

export interface MatchSession {
  sessionId: string;
  userA: string;
  userB: string;
  skill: string;
  createdAt: number;
}
