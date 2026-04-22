require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");                          
const { Server } = require("socket.io");               
const { setupSocket } = require("./socket/index");
const userRoutes = require("./routers/user.router");
const gameRoutes = require("./routers/game.router");  

const port = process.env.PORT || 8000;
const app = express();

app.use(cors({ origin: ["http://localhost:5173","http://localhost:5174","http://localhost:5175"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", userRoutes);
app.use("/api/game", gameRoutes); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error", err.message));

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      ,"http://localhost:5175"
    ],
    credentials: true,
  },
});
setupSocket(io);

server.listen(port, () => console.log(`Server running on ${port}`));