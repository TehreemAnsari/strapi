import type { Core } from '@strapi/strapi';
import { computeDiff } from './utils/diff';

const ACTIONS = new Set(['create','update','delete']);

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const pluginCfg = strapi.config.get('plugin.audit-logs.config', {
    enabled: true,
    excludeContentTypes: [],
    permission: { mode: 'user-flag', userFlagField: 'read_audit_logs', roleAllowlist: [] },
  });

  if (!pluginCfg.enabled) return;

  strapi.documents.use(async (context, next) => {
    // Only Content API calls:
    const reqCtx = strapi.requestContext.get?.();
    const isContentApi = !!reqCtx?.request?.url?.startsWith?.('/api/');
    if (!isContentApi) return next();

    const { uid, action, params } = context;
    if (!ACTIONS.has(action)) return next();
    if (pluginCfg.excludeContentTypes?.includes(uid)) return next();

    // Capture "before"
    let before: any = null;
    if (action === 'update' || action === 'delete') {
      if (params?.documentId) {
        before = await strapi.documents(uid).findOne({ documentId: params.documentId, populate: '*' });
      }
    }

    // Proceed with the actual write
    const result = await next();

    // Capture "after" & compute diff
    let after: any = null;
    if (action === 'create' || action === 'update') {
      const docId = action === 'create'
        ? result?.documentId
        : params?.documentId;

      if (docId) {
        after = await strapi.documents(uid).findOne({ documentId: docId, populate: '*' });
      }
    }

    const changedFields = computeDiff(before, after); // null-safe diff

    // Identify user (end-user via Users & Permissions)
    const user = reqCtx?.state?.user ?? null;

    // Persist audit record
    await strapi.documents('plugin::audit-logs.audit-log').create({
      data: {
        contentType: uid,
        documentId: (params?.documentId || result?.documentId || '').toString(),
        action,
        timestamp: new Date().toISOString(),
        user: user ? user.id : null,
        userId: user?.id ?? null,
        username: user?.username ?? user?.email ?? null,
        changedFields,
        before,
        after,
      },
      status: 'published',
    });

    return result;
  });
};
