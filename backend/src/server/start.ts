// backend/src/start.ts
import app, { initializeApp } from "./server.js";
import { startAssignmentScheduler } from "../services/scheduler.js";

// ✅ THE BIGINT PATCH: This prevents the "Do not know how to serialize a BigInt" 500 error.
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await initializeApp();
    startAssignmentScheduler();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📂 Check registry at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();