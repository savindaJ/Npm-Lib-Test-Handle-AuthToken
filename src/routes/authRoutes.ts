import { Router } from "express";
import { tokenManager } from "../config/tokenManager";
import { expressVerifyToken } from "@restingowlorg/owltokenguard";
import { minimumReauthAtBySub } from "../db/mockDb";

const router = Router();
const requireAccessToken = expressVerifyToken(tokenManager, { purpose: "access" });

// Login API
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password123") {
    try {
      const issued = await tokenManager.generateAccessToken(
        { sub: "user-123", role: "admin" },
        { reauthAt: Math.floor(Date.now() / 1000) }
      );

      return res.status(200).json({
        accessToken: issued.token,
        refreshToken: issued.refreshToken,
        expiresIn: 900
      });
    } catch (error) {
      return res.status(500).json({ error: "Token generation failed" });
    }
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "invalid_request" });
  }

  try {
    const result = await tokenManager.rotate(refresh_token);
    return res.status(200).json(result.oauth);
  } catch (error: any) {
    console.error("\n❌ [Server Log] Token Rotation Failed:", error.message || error);
    
    return res.status(401).json({ 
      error: "invalid_grant", 
      detail: error.message || "Unknown error" 
    });
  }
});

// Protected API
router.get("/dashboard", requireAccessToken, (req, res) => {
  return res.json({
    message: "Access granted to secure dashboard",
    user: req.auth?.payload.sub,
    role: req.auth?.payload.role
  });
});

// Force Re-auth Event (Security cut-off)
router.post("/security-event", requireAccessToken, async (req, res) => {
  const userId = req.auth?.payload.sub;
  if (userId) {
    minimumReauthAtBySub.set(userId as string, Math.floor(Date.now() / 1000));
    return res.json({ message: "Security cutoff updated. Re-authentication required." });
  }
  return res.status(400).json({ error: "User context not found" });
});

// Logout API
router.post("/logout", async (req, res) => {
  const { refresh_token } = req.body;
  try {
    await tokenManager.revokeToken(refresh_token, { purpose: "refresh" });
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(400).json({ error: "Logout failed" });
  }
});

export default router;