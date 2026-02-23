import { env } from '../config/env';
import { generateTurnCredentials } from '../utils/turnCredentialGenerator';

class WebRTCService {
  getIceServers(userId: string, callId: string) {
    const { username, credential } = generateTurnCredentials(userId, callId);

    return [
      {
        urls: [`stun:${env.TURN_PUBLIC_IP}:${env.TURN_PORT}`],
      },
      {
        urls: [
          `turn:${env.TURN_PUBLIC_IP}:${env.TURN_PORT}?transport=udp`,
          `turn:${env.TURN_PUBLIC_IP}:${env.TURN_PORT}?transport=tcp`,
        ],
        username,
        credential,
      },
    ];
  }
}

export const webRTCService = new WebRTCService();
