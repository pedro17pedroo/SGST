import { db } from "../../database/db";
import { eq, desc, sql } from "drizzle-orm";

/**
 * Utility function to get the last inserted record by ordering by a timestamp field
 * This replaces the MySQL-specific insertId functionality
 */
export async function getLastInserted<T>(
  table: any,
  whereCondition?: any,
  orderByField: any = 'createdAt'
): Promise<T> {
  const query = db.select().from(table);
  
  if (whereCondition) {
    query.where(whereCondition);
  }
  
  const result = await query.orderBy(desc(orderByField)).limit(1);
  return result[0] as T;
}

/**
 * Utility function to handle MySQL-compatible updates without .returning()
 * Returns the updated record by fetching it after the update
 */
export async function updateAndReturn<T>(
  table: any,
  id: string,
  updateData: any,
  idField: any = 'id'
): Promise<T> {
  await db.update(table).set(updateData).where(eq(idField, id));
  const result = await db.select().from(table).where(eq(idField, id)).limit(1);
  return result[0] as T;
}

/**
 * Utility function to create a record and return it
 * This replaces the pattern of insert + returning for MySQL compatibility
 */
export async function insertAndReturn<T>(
  table: any,
  insertData: any,
  whereCondition?: any,
  orderByField: any = 'createdAt'
): Promise<T> {
  await db.insert(table).values(insertData);
  return getLastInserted<T>(table, whereCondition, orderByField);
}

/**
 * Utility function to safely delete a record
 */
export async function safeDelete(
  table: any,
  id: string,
  idField: any = 'id'
): Promise<void> {
  await db.delete(table).where(eq(idField, id));
}

/**
 * Utility function to check if a record exists
 */
export async function recordExists(
  table: any,
  condition: any
): Promise<boolean> {
  const result = await db.select({ count: sql`count(*)` }).from(table).where(condition);
  return Number(result[0].count) > 0;
}

/**
 * Utility function to get a single record by condition
 */
export async function getSingleRecord<T>(
  query: any
): Promise<T | null> {
  const result = await query;
  return result as T | null;
}

/**
 * Utility function to get multiple records with optional limit
 */
export async function getMultipleRecords<T>(
  query: any,
  orderBy?: any,
  limit?: number
): Promise<T[]> {
  let finalQuery = query;
  
  if (orderBy) {
    finalQuery = finalQuery.orderBy(orderBy);
  }
  
  if (limit) {
    finalQuery = finalQuery.limit(limit);
  }
  
  return await finalQuery;
}