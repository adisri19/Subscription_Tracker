import { Client as WorkflowClient } from "@upstash/workflow";
import { Redis } from "@upstash/redis";
import { QSTASH_TOKEN, QSTASH_URL, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from "./env.js";

export const workflowClient = new WorkflowClient({
    baseUrl: QSTASH_URL,
    token: QSTASH_TOKEN,
});

class InMemoryRedis {
    constructor() {
        this.store = new Map();
    }

    async get(key) {
        const item = this.store.get(key);
        if (!item) return null;
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async set(key, value, options = {}) {
        const item = { value: String(value) };
        if (options.ex) {
            item.expiresAt = Date.now() + options.ex * 1000;
        }
        this.store.set(key, item);
        return "OK";
    }

    async del(key) {
        return this.store.delete(key) ? 1 : 0;
    }
}

export const redis = (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: UPSTASH_REDIS_REST_URL,
        token: UPSTASH_REDIS_REST_TOKEN,
    })
    : new InMemoryRedis();

