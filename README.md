# Confero

Confero is a real-time communication platform designed for low-latency video and voice interactions.

The project focuses on clean architecture, scalability, and practical real-world implementation of real-time systems using modern web technologies.

---

## Overview

Confero enables browser-based real-time audio and video communication with a clear separation of responsibilities across signaling, media transport, and background processing.

The codebase follows a **monorepo architecture**, keeping frontend and backend development unified while maintaining clear boundaries between concerns.

The goal is to build a system that is predictable under load, easy to reason about, and extensible for future features.

---

## Key Features

- Real-time video and audio communication
- WebSocket-based signaling layer
- WebRTC peer-to-peer media streaming
- Multi-user room support
- Asynchronous event handling
- Fast in-memory presence management
- Monorepo setup using pnpm workspaces

---

## Tech Stack

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

---

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)
![WebSocket](https://img.shields.io/badge/WebSockets-000000?style=for-the-badge)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge)

---

## Infrastructure & Tools

![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

## Architecture Overview

Client (Browser)
│
├── WebRTC (Media Streams)
│
├── WebSocket Signaling
│
└── REST APIs
│
├── Redis (Presence, ephemeral state)
├── RabbitMQ (Async events)
└── Core Services

This separation allows real-time media traffic to remain isolated from control and background processing logic.

---

## Design Principles

- Explicit over implicit behavior
- Clear separation of concerns
- Real-time paths kept minimal and fast
- Event-driven workflows for non-blocking operations
- Maintainability prioritized over shortcuts

---

## Monorepo Structure

- `apps/web` – Frontend (Next.js)
- `apps/server` – Backend services
- `packages/shared` – Shared types and utilities

Managed using **pnpm workspaces** for consistent dependency control.

---

## Status

**Active development**

Core real-time communication and signaling infrastructure is in place.  
Additional scalability, observability, and reliability improvements are ongoing.

---
