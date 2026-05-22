import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();
const app = express();
app.use(express.json());
// Supabase client (backend uses service role key)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
app.get("/", async (_req, res) => {
    res.send("EMS Backend running 🚀 with Supabase + ESM");
});
// Example route: list users from Supabase auth
app.get("/users", async (_req, res) => {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
