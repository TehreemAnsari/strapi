import type { Core } from '@strapi/strapi';

const parseDate = (s?: string) => (s ? new Date(s) : undefined);

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx) {
    const {
      contentType, userId, action, from, to,
      page = '1', pageSize = '25', sort = 'timestamp:desc'
    } = ctx.query as Record<string, string>;

    const filters: any = {};
    if (contentType) filters.contentType = contentType;
    if (userId) filters.userId = Number(userId);
    if (action) filters.action = action;

    const dateFrom = parseDate(from);
    const dateTo = parseDate(to);
    if (dateFrom || dateTo) {
      filters.timestamp = {};
      if (dateFrom) filters.timestamp.$gte = dateFrom.toISOString();
      if (dateTo)   filters.timestamp.$lte = dateTo.toISOString();
    }

    const [sortField, sortDir] = sort.split(':');
    const pagination = { page: Number(page), pageSize: Number(pageSize) };

    const result = await strapi.documents('plugin::audit-logs.audit-log').findMany({
      filters,
      sort: { [sortField]: sortDir?.toLowerCase() === 'asc' ? 'asc' : 'desc' },
      fields: ['id','contentType','documentId','action','timestamp','userId','username','changedFields'],
      populate: { user: { fields: ['id','username','email'] } },
      pagination,
    });

    ctx.body = result; // Strapi returns { results, pagination }
  },
});
