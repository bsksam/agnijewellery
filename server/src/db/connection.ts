import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

// Standard Turso Environment Variables
const url = process.env.TURSO_DATABASE_URL || `file:${join(_dirname, '../../../jewel.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN || '';

export const db = createClient({
  url: url,
  authToken: authToken,
});

/**
 * Executes a query and returns all rows.
 * Equivalent to db.all() in better-sqlite3 but asynchronous.
 */
export const dbQuery = async (sql: string, params: any[] = []) => {
  const result = await db.execute({ sql, args: params });
  return result.rows;
};

/**
 * Executes a command and returns the last inserted row ID.
 * Equivalent to db.run() for INSERT/UPDATE.
 */
export const dbRun = async (sql: string, params: any[] = []) => {
  const result = await db.execute({ sql, args: params });
  return { id: Number(result.lastInsertRowid) };
};

/**
 * Executes a query and returns the first row.
 * Equivalent to db.get().
 */
export const dbGet = async (sql: string, params: any[] = []) => {
  const result = await db.execute({ sql, args: params });
  return result.rows[0];
};
