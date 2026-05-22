// backend/src/infrastructure/queue.ts

import { Queue } from "bullmq";

export const jobQueue = new Queue("jobs", {
  connection: { host: "localhost", port: 6379 },
});

export async function enqueueJob(name: string, data: any) {
  await jobQueue.add(name, data);
}
