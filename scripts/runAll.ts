import { execSync } from "child_process";

async function startMaster() {
    console.log("🚀 [EMS 2026] Starting Full-Stack Orchestrator...");
    console.log("================================================");

    try {
        // STEP 1: BACKEND GENERATION (The Foundation)
        console.log("\n📡 STEP 1: Running Backend Generation...");
        execSync("ts-node-esm scripts/runBackendAll.ts", { stdio: "inherit" });
        console.log("✅ Backend synchronization complete.");

        // STEP 2: SETTLE PERIOD
        // Gives Windows/OS a moment to index the new files and release locks
        console.log("⏱️  Waiting for filesystem to settle...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        // STEP 3: FRONTEND GENERATION (The UI)
        // Now that folders and types exist, the Frontend can safely scan them
        console.log("\n🎨 STEP 2: Running Frontend Generation...");
        execSync("ts-node-esm scripts/runFrontendAll.ts", { stdio: "inherit" });
        console.log("✅ Frontend synchronization complete.");

        // STEP 4: DUAL WATCH MODE
        console.log("\n🔄 Entering Parallel Watch Mode (Full-Stack)...");
        console.log("------------------------------------------------");
        
        const concurrentlyCmd = `concurrently \
            -c "blue,magenta" \
            --prefix "[{name}]" \
            --names "BACKEND,FRONTEND" \
            --kill-others \
            "ts-node-esm scripts/runBackendAll.ts --watch" \
            "ts-node-esm scripts/runFrontendAll.ts --watch"`;

        execSync(concurrentlyCmd, { stdio: "inherit" });

    } catch (err) {
        console.error("\n❌ CRITICAL FAILURE during orchestration.");
        process.exit(1);
    }
}

startMaster();