import User from "../models/user.model.js";
import Candidate from "../models/candidate.model.js";

// Check if a user has an admin role
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (!user) return false;
    return user.role === "admin";
  } catch (e) {
    console.error("CAN'T CHECK FOR ADMIN", e);
    return false;
  }
};

// Handle request to get all candidates
const handleGetAllCandidates = async (req, res) => {
  try {
    // Retrieve all candidates, excluding _id
    const candidatesList = await Candidate.find({}, "name party -_id");
    res.status(200).json({ candidatesList });
  } catch (err) {
    console.error("ERROR WHILE FETCHING THE CANDIDATE LIST", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle request to add a new candidate
const handleAddACandidate = async (req, res) => {
  try {
    // Check if the user is an admin
    if (!(await checkAdminRole(req.user.id))) {
      return res
        .status(403)
        .json({ message: "User does not have admin role to add candidates" });
    }

    // Create and save the new candidate
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();

    res.status(200).json({ response });
  } catch (err) {
    console.error("FAILED TO ADD CANDIDATE", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle request to update candidate information
const handleUpdateCandidateInfo = async (req, res) => {
  try {
    // Check if the user is an admin
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({
        message: "User does not have admin role to update candidates",
      });
    }

    // Update candidate information
    const candidateID = req.params.candidateID;
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      { new: true, runValidators: true }
    );

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.status(200).json(response);
  } catch (err) {
    console.error("FAILED TO UPDATE CANDIDATE", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle request to remove a candidate
const handleRemoveACandidate = async (req, res) => {
  try {
    // Check if the user is an admin
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    // Remove the candidate
    const candidateID = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.status(200).json(response);
  } catch (err) {
    console.error("ERROR WHILE DELETING THE CANDIDATE FROM LIST", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle request to get a sorted list of candidates based on vote count
const handleGetSortedListOfCandidates = async (req, res) => {
  try {
    // Sort candidates by vote count in descending order
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    // Map to only include party and vote count
    const voteRecord = candidates.map((data) => ({
      party: data.party,
      count: data.voteCount,
    }));

    res.status(200).json(voteRecord);
  } catch (err) {
    console.error("ERROR WHILE FETCHING CANDIDATE LIST", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Handle request to record a vote for a candidate
const handleVoting = async (req, res) => {
  const candidateID = req.params.candidateID;
  const userID = req.user.id;

  try {
    // Find candidate and user
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is an admin or has already voted
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin is not allowed to vote" });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }

    // Record vote and update counts
    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (err) {
    console.error("ERROR WHILE RECORDING VOTE", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  handleGetAllCandidates,
  handleAddACandidate,
  handleUpdateCandidateInfo,
  handleRemoveACandidate,
  handleGetSortedListOfCandidates,
  handleVoting,
};
