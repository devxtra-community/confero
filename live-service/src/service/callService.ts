import { CallState } from '../types/call';

type CallData = {
  callId: string;
  from: string;
  to: string;
  state: CallState;
  fromReady: boolean;  // ← NEW
  toReady: boolean;    // ← NEW
};

const TERMINAL_STATES: CallState[] = ['FAILED', 'TIMEOUT', 'ENDED'];
const calls = new Map<string, CallData>();

export const callService = {
  create(callId: string, from: string, to: string) {
    calls.set(callId, {
      callId,
      from,
      to,
      state: 'INITIATING',
      fromReady: false,  // ← NEW
      toReady: false,    // ← NEW
    });
  },

  // ── NEW: mark one peer as camera-ready ──────────────────────
  markReady(callId: string, userId: string) {
    const call = calls.get(callId);
    if (!call) return;
    if (call.from === userId) call.fromReady = true;
    if (call.to === userId) call.toReady = true;
  },
  // ────────────────────────────────────────────────────────────

  update(callId: string, nextState: CallState) {
    const call = calls.get(callId);
    if (!call) return;
    if (TERMINAL_STATES.includes(call.state)) return;
    call.state = nextState;
  },

  get(callId: string) {
    return calls.get(callId);
  },

  getAll() {
    return calls;
  },

  remove(callId: string) {
    calls.delete(callId);
  },
};