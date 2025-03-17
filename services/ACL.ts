import Constants, { ROLES } from '@/core/Constants';
import { RawUser, RawWeleClass } from '@/store/types';

class ACL {
  isAdmin(user?: RawUser | null) {
    if (user) {
      if (
        user.user_type.indexOf(Constants.ROLES.Admin) > -1 ||
        user.role == Constants.ROLES.Admin
      ) {
        return true;
      }
    }

    return false;
  }

  canPostPodcast(user?: RawUser) {
    return (
      this.isAdmin(user) || this.isContentCreator(user) || this.isTeacher(user)
    );
  }

  isContentCreator(user?: RawUser) {
    if (user) {
      if (
        user.user_type.indexOf(Constants.ROLES.ContentCreator) > -1 ||
        user.role == Constants.ROLES.ContentCreator
      ) {
        return true;
      }
    }

    return false;
  }

  isTeacher(user?: RawUser | null) {
    if (user) {
      if (
        user.user_type.indexOf(ROLES.Teacher) > -1 ||
        user.role === ROLES.Teacher
      ) {
        return true;
      }
    }

    return false;
  }

  isClassOwner(weleclass: RawWeleClass, user?: RawUser | null) {
    if (user) {
      if (weleclass.owner_id == user.id) {
        return true;
      }

      if (
        user.user_type.indexOf(Constants.ROLES.Admin) > -1 ||
        user.role == Constants.ROLES.Admin
      ) {
        return true;
      }
    }

    return false;
  }

  isSuperAdmin(user?: RawUser | null) {
    return user?.is_super_admin === true;
  }
}

export default new ACL();
