const express = require("express");
const Interview = require("../models/Interview");

const router = express.Router();

router.get("/:token", async (req, res, next) => {
  try {
    const token = String(req.params.token || "").trim();
    if (!token || token.length < 20) return res.status(400).json({ message: "Invalid token." });

    const interview = await Interview.findOne({ shareToken: token }).select(
      "jobRole status overallScore avgEyeContact avgFillerWords avgPace avgConfidence createdAt questions sharedAt"
    );
    if (!interview) return res.status(404).json({ message: "Shared report not found." });

    if (interview.status !== "completed") {
      return res.status(409).json({ message: "This report is not available yet." });
    }

    res.json(interview);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

