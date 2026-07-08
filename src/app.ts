import express from "express";
import authRoutes from "./routes/authRoutes";
import { TokenVerificationError } from "@restingowlorg/owltokenguard";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof TokenVerificationError) {
    return res.status(401).json({ error: "Unauthorized", detail: err.message });
  }
  return res.status(500).json({ error: "Internal Server Error" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 OwlTokenGuard Server running on http://localhost:${PORT}`);
});