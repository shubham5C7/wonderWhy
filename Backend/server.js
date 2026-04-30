require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");                          
const { Server } = require("socket.io");               
const { setupSocket } = require("./socket/index");
const userRoutes = require("./routers/user.router");
const gameRoutes = require("./routers/game.router"); 
const { pool } = require("./config/db");

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
.then(() => console.log("PostgreSQL Connected to AWS RDS"))
.catch((err)=>console.error("DB Connection Failed",err.message))

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  },
});
setupSocket(io);
// Start server
server.listen(port, () => console.log(`Server running on ${port}`));