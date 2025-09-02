import Constants, { ROLES } from '@/core/Constants';
import { RawUser } from '@/store/types';

class ACL {
  isAdmin(user?: RawUser | null) {
    if (user) {
      return user.is_super_admin;
    }

    return false;
  }

  isSuperAdmin(user?: RawUser | null) {
    return user?.is_super_admin;
  }

  isBetaTester(user?: RawUser | null) {
    return user?.role === 'testuser';
  }
}


export default new ACL();
