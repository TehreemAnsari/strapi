import type { Core } from '@strapi/strapi';

export default (policyConfig, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state?.user;
    if (!user) return ctx.unauthorized();

    const cfg = strapi.config.get('plugin.audit-logs.config.permission', {
      mode: 'user-flag',
      userFlagField: 'read_audit_logs',
      roleAllowlist: [],
    });

    let allowed = false;

    if (cfg.mode === 'user-flag') {
      allowed = Boolean(user?.[cfg.userFlagField]);
    } else if (cfg.mode === 'role-allowlist') {
      const roleCode = user?.role?.type || user?.role?.name;
      allowed = roleCode ? cfg.roleAllowlist.includes(roleCode) : false;
    }

    if (!allowed) return ctx.forbidden('Missing permission: read_audit_logs');
    return next();
  };
};
