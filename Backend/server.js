import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import { setupSocket } from "./socket/index.js";
import userRoutes from "./routers/user.router.js";
import gameRoutes from "./routers/game.router.js";

const port = process.env.PORT || 8000;
const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:5173","http://localhost:5174","http://localhost:5175",], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/game", gameRoutes); 

// HTTP and  Socket server
const server = http.createServer(app);

pool.query("SELECT NOW()")
.then(()=>console.log("PostgerSQl Connected AWS RDC"))
.catch((err)=>console.error("DB Connection Failed",err.message))

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      ,"http://localhost:5175",
    ],
    credentials: true,
  },
});
setupSocket(io);
// Start server
server.listen(port, () => console.log(`Server running on ${port}`));