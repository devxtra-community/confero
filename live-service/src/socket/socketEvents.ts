// just events that can happend when a emit happen   eg: on.emit("disconnet",()=>{})

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  AUTH_SUCCESS: 'auth:success',
  AUTH_ERROR: 'auth:error',

  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
};
