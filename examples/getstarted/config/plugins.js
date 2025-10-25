'use strict';

module.exports = () => ({
  graphql: {
    enabled: true,
    config: {
      endpoint: '/graphql',
      defaultLimit: 25,
      maxLimit: 100,
      apolloServer: {
        tracing: true,
      },
      v4CompatibilityMode: true,
    },
  },

  documentation: {
    config: {
      info: {
        version: '1.0.0',
      },
    },
  },

  myplugin: {
    enabled: true,
    resolve: `./src/plugins/local-plugin`, // From the root of the project
    config: {
      testConf: 3,
    },
  },

  // NOTE: set enabled:true to test with a pre-built plugin. Make sure to run yarn build in the plugin folder first
  todo: {
    enabled: false,
    resolve: `../plugins/todo-example`, // From the /examples/plugins folder
  },

  /**
   * 🔍 AUDIT LOGS PLUGIN CONFIGURATION
   * This enables and configures your new audit-logs plugin.
   */
  'audit-logs': {
    enabled: true,
    resolve: `../../packages/plugins/audit-logs`, // path from getstarted app to plugin package
    config: {
      enabled: true, // Global toggle (set false to disable logging)
      excludeContentTypes: [
        // 'plugin::users-permissions.user' // Uncomment to skip user changes
      ],
      permission: {
        mode: 'user-flag', // 'user-flag' or 'role-allowlist'
        userFlagField: 'read_audit_logs',
        roleAllowlist: ['super-admin'],
      },
    },
  },
});
