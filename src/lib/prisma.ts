// Re-export from the main db configuration
export {
  prisma,
  checkDatabaseHealth,
  closeDatabaseConnection,
  connectWithRetry,
} from "./db";
