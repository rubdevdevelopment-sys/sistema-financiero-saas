process.env.ENV_FILE = ".env.staging";
process.env.JWT_SECRET ??= "fitness-local-staging-jwt-secret";

await import("../src/server.js");
