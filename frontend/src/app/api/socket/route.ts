// app/api/socket/route.ts
import { Server } from 'socket.io';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import http from 'http'; // Import the 'http' module directly

let io: Server | null = null;
let httpServer: http.Server | null = null; // Store httpServer

export async function GET(req: NextRequest) {
  if (io) {
    console.log('Socket is already running');
    return new NextResponse("ok");
  }

  console.log('Socket is initializing');

  // Create the httpServer *explicitly* using the 'http' module.
  httpServer = http.createServer((request, response) => {
    // This handler is for *regular* HTTP requests, NOT WebSocket connections.
    // We need to handle these to prevent errors.  Next.js will handle routing.
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not Found');
  });

  io = new Server(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: "http://localhost:3000", // Ensure this is correct
      methods: ["GET", "POST"],
    },
  });

    const port = await new Promise<number>((resolve, reject) => {
        httpServer && httpServer.listen(() => { // Start listening
            const address = httpServer && httpServer.address();
            if (address && typeof address === 'object') {
                resolve(address.port);
            } else {
                reject(new Error("Could not get server address"));
            }
        });
        httpServer && httpServer.on('error', (err) => { //listen for httpServer error
            console.error("httpServer error:", err);
            reject(err);
        });
    }).catch(err => { //catch httpServer error
        console.error("Error starting httpServer:", err);
        return -1;
    });

    if(port === -1){
        return new NextResponse("Error initializing socket server", {status: 500});
    }

  console.log(`Socket.IO server listening on (internal) port ${port}`);

  io.on('connection', (socket) => {
    try {
      console.log('A user connected:', socket.id);

      socket.on('join', (userEmail: string) => {
        if (typeof userEmail === 'string' && userEmail.trim() !== '') {
          console.log(`User ${userEmail} joined`);
          socket.join(userEmail);
        } else {
          console.error('Invalid userEmail:', userEmail);
          socket.emit('join_error', 'Invalid user identifier.');
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    } catch (error) {
      console.error("Error in connection handler:", error);
      socket.emit('connection_error_details', 'An unexpected error occurred.');
    }
  });

  return new NextResponse("ok");
}

export const sendNotification = (userEmail: string, title: string, message: string) => {
  if (io) {
    console.log(`Sending notification to user ${userEmail}:`, { title, message });
    io.to(userEmail).emit('notification', { title, message });
  } else {
    console.error("Socket.IO server not initialized.");
  }
};