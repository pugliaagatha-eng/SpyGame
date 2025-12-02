import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSocket, notifyRoomUpdate, broadcastToRoom } from "./websocket";
import { createRoomSchema, joinRoomSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupWebSocket(httpServer);

  app.post("/api/rooms", async (req, res) => {
    try {
      const parsed = createRoomSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid host name" });
      }

      const { room, playerId } = await storage.createRoom(parsed.data.hostName);
      return res.json({ room, playerId });
    } catch (error) {
      console.error("Error creating room:", error);
      return res.status(500).json({ error: "Failed to create room" });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const parsed = joinRoomSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid room code or player name" });
      }

      const result = await storage.joinRoom(parsed.data.code, parsed.data.playerName);
      if (!result) {
        return res.status(404).json({ error: "Room not found, full, or game already started" });
      }

      notifyRoomUpdate(result.room.id, result.room);

      return res.json(result);
    } catch (error) {
      console.error("Error joining room:", error);
      return res.status(500).json({ error: "Failed to join room" });
    }
  });

  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const room = await storage.getRoomByCode(req.params.code.toUpperCase());
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      return res.json(room);
    } catch (error) {
      console.error("Error getting room:", error);
      return res.status(500).json({ error: "Failed to get room" });
    }
  });

  app.post("/api/rooms/:roomId/start", async (req, res) => {
    try {
      const room = await storage.startGame(req.params.roomId);
      if (!room) {
        return res.status(400).json({ error: "Cannot start game" });
      }
      return res.json(room);
    } catch (error) {
      console.error("Error starting game:", error);
      return res.status(500).json({ error: "Failed to start game" });
    }
  });

  app.post("/api/rooms/:roomId/kick", async (req, res) => {
    try {
      const { hostId, playerIdToKick } = req.body;
      const room = await storage.kickPlayer(req.params.roomId, hostId, playerIdToKick);
      
      if (!room) {
        return res.status(404).json({ error: "Room not found or host not authorized" });
      }

      // Enviar mensagem específica de player_kicked
      broadcastToRoom(room.id, { type: 'player_kicked', payload: room });
      
      return res.json({ room });
    } catch (error) {
      console.error("Error kicking player:", error);
      return res.status(500).json({ error: "Failed to kick player" });
    }
  });

  app.post("/api/rooms/:roomId/leave", async (req, res) => {
    try {
      const { playerId } = req.body;
      const room = await storage.leaveRoom(req.params.roomId, playerId);
      return res.json({ room });
    } catch (error) {
      console.error("Error leaving room:", error);
      return res.status(500).json({ error: "Failed to leave room" });
    }
  });

  app.post("/api/reconnect", async (req, res) => {
    try {
      const { roomId, playerId } = req.body;
      if (!roomId || !playerId) {
        return res.status(400).json({ error: "Missing roomId or playerId" });
      }

      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found in room" });
      }

      if (room.status === 'game_over') {
        return res.status(410).json({ error: "Game has ended" });
      }

      return res.json({ room, playerId });
    } catch (error) {
      console.error("Error reconnecting:", error);
      return res.status(500).json({ error: "Failed to reconnect" });
    }
  });

  return httpServer;
}
