import register from './register';
import bootstrap from './bootstrap';

export default {
  register,
  bootstrap,
  contentTypes: {
    'audit-log': require('./content-types/audit-log'),
  },
};
