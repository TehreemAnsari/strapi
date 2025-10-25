import type { Core } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.log.info('[audit-logs] Plugin loaded successfully ✅');
  // OPTIONAL: Add indices for common filters if using Postgres/MySQL.
  try {
    const client = strapi.db?.connection?.client?.config?.client;
    if (!client || client === 'sqlite') return;

    const knex = strapi.db.connection;
    // defensive create indexes if not exist (syntax varies per DB)
    if (client.includes('pg')) {
      await knex.raw(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_ct') THEN
            CREATE INDEX idx_audit_logs_ct ON audit_logs ("contentType");
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_user') THEN
            CREATE INDEX idx_audit_logs_user ON audit_logs ("userId");
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_action') THEN
            CREATE INDEX idx_audit_logs_action ON audit_logs ("action");
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_ts') THEN
            CREATE INDEX idx_audit_logs_ts ON audit_logs ("timestamp");
          END IF;
        END$$;
      `);
    }
  } catch (e) {
    strapi.log.warn(`[audit-logs] index creation skipped: ${e.message}`);
  }
};
