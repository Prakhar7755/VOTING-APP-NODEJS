import express from "express";
import { jwtAuthMiddleware } from "../utils/jwt.js";
import {
  handleAddACandidate,
  handleGetAllCandidates,
  handleGetSortedListOfCandidates,
  handleRemoveACandidate,
  handleUpdateCandidateInfo,
  handleVoting,
} from "../controllers/candidate.controller.js";

const router = express.Router();

// GET the list of all candidates
router.get("/", handleGetAllCandidates);

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, handleAddACandidate);

// PUT - Update an existing candidate
router.put("/:candidateID", jwtAuthMiddleware, handleUpdateCandidateInfo);

// DELETE - Remove a candidate
router.delete("/:candidateID", jwtAuthMiddleware, handleRemoveACandidate);

// GET - Get the list of candidates sorted by their vote counts
router.get("/vote/count", handleGetSortedListOfCandidates);

// POST - Vote for a specific candidate
router.post("/vote/:candidateID", jwtAuthMiddleware, handleVoting);

export default router;
