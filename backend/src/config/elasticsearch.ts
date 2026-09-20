import { Client, type ClientOptions } from "@elastic/elasticsearch";
import { env } from "./env.js";

const clientOptions: ClientOptions = {
  node: env.ELASTICSEARCH_NODE,
};

if (env.ELASTICSEARCH_USERNAME && env.ELASTICSEARCH_PASSWORD) {
  clientOptions.auth = {
    username: env.ELASTICSEARCH_USERNAME,
    password: env.ELASTICSEARCH_PASSWORD,
  };
}

export const elasticsearch = new Client(clientOptions);

export async function connectElasticsearch(): Promise<void> {
  await elasticsearch.ping();
}

export async function disconnectElasticsearch(): Promise<void> {
  // The Elasticsearch client does not require an explicit disconnect
  // for this application lifecycle. This function exists to keep
  // dependency lifecycle handling consistent with PostgreSQL and Redis.
}