// just events that can happend when a emit happen   eg: on.emit("disconnet",()=>{})

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  AUTH_SUCCESS: 'auth:success',
  AUTH_ERROR: 'auth:error',

  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',

  // call lifecycle events
  CALL_INITIATE: 'call:initiate',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPT: 'call:accept',
  CALL_ACCEPTED: 'call:accepted',
  CALL_REJECT: 'call:reject',
  CALL_TIMEOUT: 'call:timeout',
  CALL_END: 'call:end',

  // Matching events
  MATCH_START: 'match:start',
  MATCH_FOUND: 'match:found',
  MATCH_CANCEL: 'match:cancel',
  MATCH_TIMEOUT: 'match:timeout',

  // webrtc signaling events
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE: 'webrtc:ice',
  WEBRTC_ICE_FAILED: 'webrtc:ice-failed',
};
