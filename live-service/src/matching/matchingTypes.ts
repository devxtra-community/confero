export type MatchState = 'IDLE' | 'SEARCHING' | 'MATCHED' | 'IN_CALL';

export interface MatchSession {
  sessionId: string;
  userA: string;
  userB: string;
  skill: string;
  createdAt: number;
}
