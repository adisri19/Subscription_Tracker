import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_API_KEY, ARCJET_ENV } from "./env.js";

const isDevelopment = ARCJET_ENV === "development";
const rateLimitMode = "LIVE";
const rateLimitConfig = isDevelopment
  ? { refillRate: 1, interval: 10, capacity: 3 }
  : { refillRate: 5, interval: 10, capacity: 10 };

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: ARCJET_API_KEY,
  characteristics: ["ip.src"], // Default is "ip.src", but you can customize this to use any combination of fingerprints. See https://docs.arcjet.com/fingerprints
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: isDevelopment ? "DRY_RUN" : "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: isDevelopment ? "DRY_RUN" : "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: rateLimitMode,
      ...rateLimitConfig,
    }),
  ],
});
export default aj;
