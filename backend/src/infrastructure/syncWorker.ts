// src/infrastructure/syncWorker.ts
import { loadConfig } from "../config/loaders/configLoader.js";
import { validateConfig } from "../config/loaders/configValidator.js";

const config = loadConfig();
validateConfig(config);
