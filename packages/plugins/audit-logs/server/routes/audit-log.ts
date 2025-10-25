export default {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/audit-logs',
        handler: 'audit-log.find',
        config: {
          policies: [
            'plugin::users-permissions.isAuthenticated',
            'plugin::audit-logs.has-read-permission'
          ],
        },
      },
    ],
  };
  