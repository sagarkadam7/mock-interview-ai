const User = require("../models/User");

function currentMonthKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getMonthlyInterviewLimitForPlan(plan) {
  if (plan === "pro" || plan === "team") return Infinity;
  return Number(process.env.FREE_PLAN_MONTHLY_INTERVIEW_LIMIT) || 3;
}

async function assertCanCreateInterview(req, res, next) {
  try {
    const monthKey = currentMonthKey();
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Not authorized." });

    const fresh = await User.findById(userId).select("plan usage");
    if (!fresh) return res.status(401).json({ message: "User not found." });

    const limit = getMonthlyInterviewLimitForPlan(fresh.plan || "free");
    if (limit === Infinity) return next();

    const current = fresh.usage?.monthKey === monthKey ? fresh.usage?.interviewsCreated || 0 : 0;
    if (current >= limit) {
      return res.status(402).json({
        message: `Free plan limit reached (${limit} interviews / month). Upgrade to Pro for unlimited sessions.`,
        code: "PLAN_LIMIT_REACHED",
        limit,
        monthKey,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

async function bumpMonthlyInterviewUsage(userId) {
  const monthKey = currentMonthKey();
  const fresh = await User.findById(userId).select("plan usage");
  if (!fresh) throw new Error("User not found.");

  const limit = getMonthlyInterviewLimitForPlan(fresh.plan || "free");

  const update = {};
  if (!fresh.usage || fresh.usage.monthKey !== monthKey) {
    update["usage.monthKey"] = monthKey;
    update["usage.interviewsCreated"] = 0;
  }

  const query = { _id: userId };
  if (limit !== Infinity) {
    query.$or = [{ "usage.monthKey": { $ne: monthKey } }, { "usage.interviewsCreated": { $lt: limit } }];
  }

  const bumped = await User.findOneAndUpdate(
    query,
    { $set: { ...update }, $inc: { "usage.interviewsCreated": 1 } },
    { new: true, projection: "-password" }
  );

  if (!bumped) {
    const hardLimit = getMonthlyInterviewLimitForPlan(fresh.plan || "free");
    const err = new Error(`Free plan limit reached (${hardLimit} interviews / month). Upgrade to Pro for unlimited sessions.`);
    err.status = 402;
    err.code = "PLAN_LIMIT_REACHED";
    throw err;
  }

  return bumped;
}

module.exports = { assertCanCreateInterview, bumpMonthlyInterviewUsage, currentMonthKey, getMonthlyInterviewLimitForPlan };

