import { db } from '../db/connection.js';

export const logActivity = async (
  userId: string,
  userName: string,
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN',
  entityType: 'STOCK' | 'SALE' | 'CUSTOMER' | 'RATE' | 'SETTING',
  entityId: string,
  beforeData: any = null,
  afterData: any = null
) => {
  try {
    await db.execute({
      sql: `
        INSERT INTO activity_logs (user_id, user_name, action_type, entity_type, entity_id, before_data, after_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        userId,
        userName,
        actionType,
        entityType,
        entityId,
        beforeData ? JSON.stringify(beforeData) : null,
        afterData ? JSON.stringify(afterData) : null
      ]
    });
  } catch (err) {
    console.error('Audit Logging Failed:', err);
  }
};
