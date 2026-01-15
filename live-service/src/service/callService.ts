import { CallState } from '../types/call';

type CallData = {
  callId: string;
  from: string;
  to: string;
  state: CallState;
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
    });
  },

  update(callId: string, nextState: CallState) {
    const call = calls.get(callId);
    if (!call) return;

    if (TERMINAL_STATES.includes(call.state)) {
      return;
    }
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
