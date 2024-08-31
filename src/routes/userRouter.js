import express from "express";
import { jwtAuthMiddleware } from "../utils/jwt.js";
import {
  handleChangeUserPassword,
  handleGetUserInformation,
  handleUserLogin,
  handleUserSignUp,
} from "../controllers/user.controller.js";

const router = express.Router();

// POST route to add a person
router.post("/signup", handleUserSignUp);

router.post("/login", handleUserLogin);

router.get("/profile", jwtAuthMiddleware, handleGetUserInformation);

router.put("/profile/password", jwtAuthMiddleware, handleChangeUserPassword);

export default router;
