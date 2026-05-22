// backend/src/infrastructure/services.ts

import { sendEmail } from "./email.js";
import { jobQueue } from "./queue.js";
import { supabase } from "./supabase.js";

export const services = {
  email: sendEmail,
  queue: jobQueue,
  supabase,
};
