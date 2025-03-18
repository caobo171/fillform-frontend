import Constants, { ROLES } from '@/core/Constants';
import { RawUser, RawWeleClass } from '@/store/types';

class ACL {
  isAdmin(user?: RawUser | null) {
    if (user) {
      if (
        user.role == 'admin'
      ) {
        return true;
      }
    }

    return false;
  }

  isSuperAdmin(user?: RawUser | null) {
    return user?.is_super_admin;
  }
}

export default new ACL();
