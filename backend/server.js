const Answer = require("./models/Answer");
const express = require("express"); // used to create backend server and APIs
const mongoose = require("mongoose"); // used to connect Node.js with MongoDB database
const cors = require("cors"); // allows frontend and backend communication
const http = require("http"); // creates server for socket connection
const { Server } = require("socket.io"); // used for real-time communication

const User = require("./models/User");
const Session = require("./models/Session");
const Question = require("./models/Question");

const app = express();
app.use(cors()); // allows frontend requests.
app.use(express.json()); // converts frontend JSON data into JavaScript object

const server = http.createServer(app);

/* HTTP server is created because Socket.IO needs server connection.
Socket.IO enables real-time features. */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// This setup is used for live communication between teacher and student


const MONGO_URI = "mongodb://127.0.0.1:27017/vi-slides-dev";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


//  API ROUTES 

//  Auth (FIXED: role update)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, name, role } = req.body;

    // Email validation
    if (!email) return res.status(400).json({ error: "Email is required" });

    /* Searches MongoDB database for same email.
Prevents duplicate users. */
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name, role });
    } else {
      //  update existing user
      user.name = name;
      user.role = role;
    }

    await user.save();

    // Backend sends logged-in user data back to frontend
    res.json({ user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create session
app.post("/api/sessions", async (req, res) => {
  try {
    const { teacherId } = req.body;

    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const session = new Session({
      code: sessionCode,
      teacherId,
      isActive: true,
    });

    await session.save();

    res.json({ session });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Join session
app.post("/api/sessions/join", async (req, res) => {
  try {
    const { code } = req.body;

    const session = await Session.findOne({ code, isActive: true });

    if (!session) {
      return res.status(404).json({ error: "Session not found or inactive" });
    }

    res.json({ session });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get questions
app.get("/api/sessions/:sessionId/questions", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const questions = await Question.find({ sessionId })
      .populate("studentId", "name");

    res.json({ questions });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= SOCKET.IO =================

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("joinSession", (sessionCode) => {
    socket.join(sessionCode);
    console.log(`Socket ${socket.id} joined ${sessionCode}`);
  });

  // ✅ Student sends question
  socket.on("newQuestion", async (data) => {
    try {
      const question = new Question({
        sessionId: data.sessionId,
        studentId: data.studentId,
        text: data.text,
      });

      await question.save();

      const populatedQuestion = await question.populate("studentId", "name");

      io.to(data.sessionCode).emit("newQuestion", populatedQuestion);

    } catch (error) {
      console.error("Error saving question:", error);
    }
  });


  // Teacher sends answer (FIXED: linked to question)
  socket.on("newAnswer", async (data) => {
    try {
      const { sessionCode, questionId, answer } = data;

      const newAnswer = new Answer({
        sessionCode,
        questionId, // 🔥 LINK
        answer,
      });

      await newAnswer.save();

      // send to all students
      io.to(sessionCode).emit("newAnswer", newAnswer);

    } catch (error) {
      console.error("Error saving answer:", error);
    }
  });


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
