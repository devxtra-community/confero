**Confero**

Confero is a real-time communication platform designed for low-latency video and voice interactions.
The project emphasizes clean architecture, scalability, and practical real-world implementation using modern web technologies.

##Overview

Confero enables users to connect through browser-based real-time calls.
The system is built with a clear separation of responsibilities, ensuring that signaling, media handling, and background processing remain efficient and maintainable.

The repository follows a monorepo architecture, keeping frontend and backend development unified under a single codebase.

##Key Features

Real-time video and audio communication

WebSocket-based signaling

WebRTC peer-to-peer media streaming

Multi-user room support

Asynchronous event handling

Fast in-memory presence management

Monorepo setup using pnpm workspaces

##Tech Stack

**Frontend**

Next.js

React

TypeScript

Tailwind CSS

**Backend**

Node.js

Express

WebSocket / Socket.IO

WebRTC

##Infrastructure & Tools

Redis – caching and presence tracking

RabbitMQ – asynchronous task processing

pnpm – workspace and dependency management
