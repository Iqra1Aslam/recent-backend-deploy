"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dotenv = require("dotenv").config();
const { mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");
const Ably = require("ably");
const cors = require("cors");
const index_1 = __importDefault(require("./routes/testing_routes/index"));
const user_1 = __importDefault(require("./routes/user"));
const app = express();
// Setup Ably
const ably = new Ably.Rest(process.env.ABLY_API_KEY);
app.set("ably", ably);
// Database connect
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Database connected"))
    .catch((err) => console.log("Database not connected", err));
// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
// Routes
app.use("/coin", index_1.default);
app.use("/user", user_1.default);
// Test route
app.get("/", (req, res) => {
    res.send("Hello from backend with Ably!");
});
// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
