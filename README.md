# Confero

Confero is a real-time skill-based video networking platform designed for low-latency video and voice interactions.

The project focuses on clean architecture, scalability, and practical real-world implementation of real-time systems using modern web technologies. Users create profiles with skill tags, enter a matchmaking queue, and are paired with someone who shares at least one skill — a live WebRTC video call begins automatically.

---

## Overview

Confero enables browser-based real-time audio and video communication with a clear separation of responsibilities across signaling, media transport, and background processing.

The codebase follows a **monorepo architecture**, keeping frontend and backend development unified while maintaining clear boundaries between concerns.

The goal is to build a system that is predictable under load, easy to reason about, and extensible for future features.

<br/>

![Landing](assets/screenshots/landing.png)

---

## Key Features

- Real-time video and audio communication via WebRTC P2P
- WebSocket-based signaling layer with Socket.IO
- Skill-intersection matchmaking backed by Redis queues
- Two-sided readiness gate — call only starts when both users accept
- Duplicate tab guard using Redis `SCARD` checks
- OTP + Google OAuth 2.0 authentication
- JWT HTTP-only cookies with refresh token rotation
- Asynchronous session recording via RabbitMQ
- Fast in-memory presence management
- Full admin dashboard with real-time analytics
- Monorepo setup using pnpm workspaces

<br/>

<table>
<tr>
<td width="50%">

![Match Found](assets/screenshots/match-found.png)

</td>
<td width="50%">

![Video Call](assets/screenshots/video-call.png)

</td>
</tr>
<tr>
<td align="center"><sub>Skill-based match flow</sub></td>
<td align="center"><sub>Live P2P video session</sub></td>
</tr>
</table>

---

## User Profiles

Every user has a full profile — custom banner, avatar, job title, LinkedIn, and a skill list that drives the entire matching system.

<table>
<tr>
<td width="33%">

![Profile](assets/screenshots/profile-1.png)

</td>
<td width="33%">

![Profile Edit](assets/screenshots/profile-edit.png)

</td>
<td width="33%">

![Profile 2](assets/screenshots/profile-2.png)

</td>
</tr>
<tr>
<td align="center"><sub>Profile with skill overview</sub></td>
<td align="center"><sub>Live banner update with toast confirmation</sub></td>
<td align="center"><sub>Full profile — personal info & expertise</sub></td>
</tr>
</table>

---

## Admin Panel

A full admin console gives platform operators real-time visibility — active socket connections, live call sessions, total video calls, match rate, call time distribution, and a searchable connection log.

<table>
<tr>
<td width="50%">

![Admin Dashboard](assets/screenshots/admin-dashboard.png)

</td>
<td width="50%">

![Call Sessions](assets/screenshots/call-sessions.png)

</td>
</tr>
<tr>
<td align="center"><sub>Platform intelligence dashboard</sub></td>
<td align="center"><sub>Live call session tracking</sub></td>
</tr>
</table>

<br/>

![Connections](assets/screenshots/connections.png)

<p align="center"><sub>Connection log — full history with participants, duration & status</sub></p>

---

## Tech Stack

### Frontend

![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge)

### Infrastructure & Tools

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

## Architecture Overview

```
Client (Browser)
│
├── WebRTC (Media Streams — direct P2P, no server touch)
│
├── WebSocket Signaling ──► Live Service ──► Redis (presence, queues, locks)
│                                │
│                                └── RabbitMQ ──► Auth Service (session recording)
│
└── REST APIs ──► API Gateway ──► Auth Service (users, auth, admin)
                  (rate limiting,
                   reverse proxy)
```

This separation allows real-time media traffic to remain fully isolated from control logic and background processing. A database write failure never interrupts a live call.

---

## Monorepo Structure

- `frontend` — Next.js 15 App Router, UI, socket client
- `live-service` — WebSocket server, matchmaking engine, WebRTC signaling
- `services/auth-service` — Users, auth, sessions, bans, admin APIs
- `gateway` — Reverse proxy, rate limiting per IP
- `packages/shared` — Shared types and utilities

Managed using **pnpm workspaces** for consistent dependency control.

---

## Design Principles

- Explicit over implicit behavior
- Clear separation of concerns — controllers thin, logic in services, data access in repositories
- Real-time paths kept minimal and fast
- Event-driven workflows for non-blocking operations
- Maintainability prioritized over shortcuts

---

## Status

**Active development.**

Core real-time communication and signaling infrastructure is fully operational and deployed on Azure. Additional scalability, observability, and reliability improvements are ongoing — including moving call state to Redis for horizontal scaling and establishing test coverage starting with the matching engine.
