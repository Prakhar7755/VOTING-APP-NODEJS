import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter.js";
import candidateRouter from "./routes/candidateRouter.js";
import connectDB from "./utils/connectDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;


connectDB(process.env.MONGODB_URI)

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json()); // req.body

// routes
app.use("/user", userRouter);
app.use("/candidates", candidateRouter);

app.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
});
