import http from "node:http";

import { app } from "./app.js";

import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";

import {
  connectElasticsearch,
  disconnectElasticsearch,
} from "./config/elasticsearch.js";

import {
  connectRedis,
  disconnectRedis,
} from "./config/redis.js";

import {
  connectSessionRedis,
  disconnectSessionRedis,
} from "./config/session.js";

import {
  reconcileEmailQueueOnStartup,
} from "./services/recovery/queue-reconciliation.service.js";

import {
  reconcileElasticsearchOnStartup,
} from "./services/recovery/elasticsearch-reconciliation.service.js";

import { env } from "./config/env.js";

let server: http.Server | undefined;
let shuttingDown = false;

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    console.log("✓ PostgreSQL connected");

    await connectRedis();

    console.log("✓ BullMQ Redis connected");

    await connectSessionRedis();

    console.log("✓ Session Redis connected");

    if (env.ELASTICSEARCH_ENABLED) {
      // Safe elasticsearch connection:
      await connectElasticsearch().catch((err) =>
        console.warn("Elasticsearch not available:", err.message)
      );
      console.log("✓ Elasticsearch checked");
    } else {
      console.log("ℹ Elasticsearch disabled (ELASTICSEARCH_ENABLED=false)");
    }

    await reconcileEmailQueueOnStartup();

    if (env.ELASTICSEARCH_ENABLED) {
      // Safe elasticsearch reconciliation:
      await reconcileElasticsearchOnStartup().catch((err) =>
        console.warn("Elasticsearch reconciliation skipped:", err.message)
      );
    }
    server = app.listen(env.PORT, () => {
      console.log(
        `✓ ReachInbox backend running on http://localhost:${env.PORT}`,
      );
    });

  } catch (error) {
    console.error(
      "Failed to start ReachInbox backend:",
      error,
    );

    await disconnectSessionRedis().catch(
      () => undefined,
    );

    await disconnectRedis().catch(
      () => undefined,
    );

    await disconnectElasticsearch().catch(
      () => undefined,
    );

    await disconnectDatabase().catch(
      () => undefined,
    );

    process.exit(1);
  }
}

async function shutdown(
  signal: string,
): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(
    `\nShutdown requested by ${signal}`,
  );

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      console.log("✓ HTTP server closed");
    }

    await disconnectSessionRedis();

    console.log("✓ Session Redis disconnected");

    await disconnectRedis();

    console.log("✓ BullMQ Redis disconnected");

    if (env.ELASTICSEARCH_ENABLED) {
      await disconnectElasticsearch().catch(() => undefined);
      console.log("✓ Elasticsearch disconnected");
    }

    await disconnectDatabase();

    console.log("✓ PostgreSQL disconnected");

    console.log(
      "✓ ReachInbox backend shut down",
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Backend shutdown failed:",
      error,
    );

    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();