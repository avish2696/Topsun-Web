import { supabase } from '@/supabase';

/**
 * Audit Service - Helper functions for soft deletes and audit logging
 * 
 * Soft delete strategy:
 * - Instead of DELETE, set is_deleted = TRUE
 * - Maintains audit trail for compliance and recovery
 * - All queries exclude soft-deleted records by default
 * 
 * Tables supporting soft delete: addresses, orders, order_items
 * Audit trail stored in: audit_logs table
 */

export interface AuditEntry {
  id: string;
  tableName: string;
  recordId: string;
  userId?: string;
  action: 'create' | 'update' | 'delete' | 'soft_delete' | 'restore';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  createdAt: Date;
}

export interface DeletedRecord {
  id: string;
  tableName: string;
  recordId: string;
  userId: string;
  action: string;
  oldValues: Record<string, any>;
  createdAt: Date;
  daysAgo: number;
}

/**
 * Soft delete a record and log to audit trail
 * 
 * Updates: is_deleted = TRUE, deleted_reason = reason
 * Logs to audit_logs table with snapshot of old values
 * 
 * @param table Table name: 'addresses' | 'orders' | 'order_items'
 * @param recordId Record ID to soft delete
 * @param userId User ID performing deletion (for audit trail)
 * @param reason Optional reason for deletion
 */
export async function softDeleteRecord(
  table: 'addresses' | 'orders' | 'order_items',
  recordId: string,
  userId: string,
  reason?: string
): Promise<void> {
  try {
    console.log(`🗑️ Soft deleting ${table}.${recordId} (reason: ${reason || 'not specified'})`);

    // Fetch the record before deletion (for audit trail)
    const { data: record, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !record) {
      throw new Error(`Record not found or you do not have permission to delete it`);
    }

    // Soft delete by setting is_deleted = TRUE
    const updatePayload: any = {
      is_deleted: true,
      updated_at: new Date().toISOString(),
    };

    if (reason) {
      updatePayload.deleted_reason = reason;
    }

    const { error: deleteError } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('id', recordId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error(`❌ Failed to soft delete ${table}.${recordId}:`, deleteError.message);
      throw deleteError;
    }

    // Log to audit_logs table
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: table,
        record_id: recordId,
        user_id: userId,
        action: 'soft_delete',
        old_values: record,
        new_values: {
          is_deleted: true,
          deleted_reason: reason || null,
        },
      });

    if (auditError) {
      console.error(`⚠️ Audit log insertion failed (soft delete still completed):`, auditError.message);
      // Don't throw - soft delete already completed, just warn about audit log
    }

    console.log(`✅ Record soft deleted: ${table}.${recordId}`);
  } catch (err: any) {
    console.error(`❌ softDeleteRecord error:`, err.message);
    throw err;
  }
}

/**
 * Get soft-deleted records for a user (for recovery UI)
 * 
 * Returns audit log entries of soft-deleted records within N days
 * 
 * @param table Table name to search
 * @param userId User ID (scoped to user's data only)
 * @param withinDays Only show deletions within N days (default 30)
 * @returns Array of deleted records with audit metadata
 */
export async function getSoftDeletedRecords(
  table: string,
  userId: string,
  withinDays: number = 30
): Promise<DeletedRecord[]> {
  try {
    console.log(`🔍 Fetching soft-deleted ${table} records for user ${userId} (within ${withinDays} days)`);

    const nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - withinDays);

    // Query audit_logs for soft_delete actions
    const { data: auditEntries, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', table)
      .eq('user_id', userId)
      .eq('action', 'soft_delete')
      .gte('created_at', nDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`❌ Failed to fetch soft-deleted records:`, error.message);
      throw error;
    }

    // Transform to DeletedRecord format with days calculation
    const now = new Date();
    const deletedRecords: DeletedRecord[] = (auditEntries || []).map(entry => {
      const createdAt = new Date(entry.created_at);
      const daysAgo = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: entry.id,
        tableName: entry.table_name,
        recordId: entry.record_id,
        userId: entry.user_id,
        action: entry.action,
        oldValues: entry.old_values || {},
        createdAt,
        daysAgo,
      };
    });

    console.log(`✅ Found ${deletedRecords.length} soft-deleted records`);
    return deletedRecords;
  } catch (err: any) {
    console.error(`❌ getSoftDeletedRecords error:`, err.message);
    throw err;
  }
}

/**
 * Restore a soft-deleted record
 * 
 * Sets is_deleted = FALSE and logs restore action to audit trail
 * 
 * @param table Table name: 'addresses' | 'orders' | 'order_items'
 * @param recordId Record ID to restore
 * @param userId User ID performing restore
 * @returns Restored record
 */
export async function restoreDeletedRecord(
  table: string,
  recordId: string,
  userId: string
): Promise<Record<string, any>> {
  try {
    console.log(`♻️ Restoring ${table}.${recordId} for user ${userId}`);

    // Fetch the record before restore (for audit trail)
    const { data: record, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !record) {
      throw new Error('Record not found or you do not have permission to restore it');
    }

    // Restore by setting is_deleted = FALSE
    const { data: restoredRecord, error: restoreError } = await supabase
      .from(table)
      .update({
        is_deleted: false,
        deleted_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single();

    if (restoreError) {
      console.error(`❌ Failed to restore ${table}.${recordId}:`, restoreError.message);
      throw restoreError;
    }

    // Log restore action to audit_logs
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: table,
        record_id: recordId,
        user_id: userId,
        action: 'restore',
        old_values: record,
        new_values: restoredRecord,
      });

    if (auditError) {
      console.error(`⚠️ Audit log insertion failed (restore still completed):`, auditError.message);
      // Don't throw - restore already completed
    }

    console.log(`✅ Record restored: ${table}.${recordId}`);
    return restoredRecord;
  } catch (err: any) {
    console.error(`❌ restoreDeletedRecord error:`, err.message);
    throw err;
  }
}

/**
 * Get complete audit trail for a record
 * 
 * Shows chronological history of all changes (create, update, delete, restore)
 * Useful for debugging and compliance investigation
 * 
 * @param table Table name
 * @param recordId Record ID
 * @param userId User ID (scope to user's data)
 * @returns Array of audit entries in chronological order
 */
export async function getAuditTrail(
  table: string,
  recordId: string,
  userId: string
): Promise<AuditEntry[]> {
  try {
    console.log(`📋 Fetching audit trail for ${table}.${recordId}`);

    // Query audit_logs for all changes to this record
    const { data: entries, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', table)
      .eq('record_id', recordId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`❌ Failed to fetch audit trail:`, error.message);
      throw error;
    }

    // Transform to AuditEntry format
    const auditTrail: AuditEntry[] = (entries || []).map(entry => ({
      id: entry.id,
      tableName: entry.table_name,
      recordId: entry.record_id,
      userId: entry.user_id,
      action: entry.action,
      oldValues: entry.old_values,
      newValues: entry.new_values,
      createdAt: new Date(entry.created_at),
    }));

    console.log(`✅ Audit trail retrieved: ${auditTrail.length} entries`);
    return auditTrail;
  } catch (err: any) {
    console.error(`❌ getAuditTrail error:`, err.message);
    throw err;
  }
}

/**
 * Get summary statistics for soft-deleted records
 * 
 * Useful for admin dashboard and compliance reporting
 * 
 * @param table Optional - filter to specific table
 * @param userId Optional - filter to specific user
 * @returns Statistics object with counts and timelines
 */
export async function getDeletedRecordsStats(
  table?: string,
  userId?: string
): Promise<{ totalDeleted: number; byAction: Record<string, number>; oldestDeletion: Date | null }> {
  try {
    console.log(`📊 Fetching soft-delete statistics...`);

    let query = supabase.from('audit_logs').select('action, created_at', { count: 'exact' });

    if (table) {
      query = query.eq('table_name', table);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    query = query.eq('action', 'soft_delete');

    const { data: entries, error } = await query;

    if (error) {
      console.error(`❌ Failed to fetch delete statistics:`, error.message);
      throw error;
    }

    const byAction: Record<string, number> = {};
    let oldestDeletion: Date | null = null;

    (entries || []).forEach(entry => {
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;

      const entryDate = new Date(entry.created_at);
      if (!oldestDeletion || entryDate < oldestDeletion) {
        oldestDeletion = entryDate;
      }
    });

    const stats = {
      totalDeleted: entries?.length || 0,
      byAction,
      oldestDeletion,
    };

    console.log(`✅ Delete statistics retrieved:`, stats);
    return stats;
  } catch (err: any) {
    console.error(`❌ getDeletedRecordsStats error:`, err.message);
    throw err;
  }
}

/**
 * Permanently delete soft-deleted records older than N days
 * (Compliance cleanup - only run if required by policy)
 * 
 * @param table Table name
 * @param olderThanDays Delete records soft-deleted more than N days ago
 * @param userId Optional - only delete user's records
 * @returns Number of records permanently deleted
 */
export async function permanentlyDeleteOldSoftDeletes(
  table: string,
  olderThanDays: number = 30,
  userId?: string
): Promise<number> {
  try {
    console.log(`🔥 Permanently deleting soft-deleted ${table} records older than ${olderThanDays} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let query = supabase
      .from(table)
      .delete()
      .eq('is_deleted', true)
      .lt('updated_at', cutoffDate.toISOString());

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { count, error } = await query;

    if (error) {
      console.error(`❌ Failed to permanently delete soft-deleted records:`, error.message);
      throw error;
    }

    console.log(`✅ Permanently deleted ${count} soft-deleted records`);
    return count || 0;
  } catch (err: any) {
    console.error(`❌ permanentlyDeleteOldSoftDeletes error:`, err.message);
    throw err;
  }
}

/**
 * Export auditService as object for convenient usage
 * Usage: auditService.softDelete(...), auditService.getAuditTrail(...), etc.
 */
export const auditService = {
  softDelete: softDeleteRecord,
  getSoftDeleted: getSoftDeletedRecords,
  restore: restoreDeletedRecord,
  getAuditTrail,
  getStats: getDeletedRecordsStats,
  permanentlyDelete: permanentlyDeleteOldSoftDeletes,
};
