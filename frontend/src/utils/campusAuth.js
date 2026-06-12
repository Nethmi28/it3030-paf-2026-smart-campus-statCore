export const AUTH_STORAGE_KEYS = {
  token: 'token',
  role: 'role',
  name: 'name'
};

const SUPPORTED_ROLES = [
  'ROLE_STUDENT',
  'ROLE_TECHNICIAN',
  'ROLE_MANAGER',
  'ROLE_ADMIN'
];
const normalize = (value) => value.trim().toLowerCase();
const CAMPUS_ID_PATTERN = /^(st|tc|mg|ad)\d+$/i;
const CAMPUS_EMAIL_PATTERN = /^(st|tc|mg|ad)\d+@my\.cu\.lk$/i;

export function getDashboardPathForRole(role) {
  switch (role) {
    case 'ROLE_ADMIN':
      return '/dashboard/admin';
    case 'ROLE_MANAGER':
      return '/dashboard/manager';
    case 'ROLE_TECHNICIAN':
      return '/dashboard/tech';
    default:
      return '/dashboard/student';
  }
}

export function isSupportedCampusRole(role) {
  return SUPPORTED_ROLES.includes(role);
}

export function getStoredCampusUser() {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  const role = localStorage.getItem(AUTH_STORAGE_KEYS.role);
  const name = localStorage.getItem(AUTH_STORAGE_KEYS.name);

  if (!token || !name || !isSupportedCampusRole(role)) {
    return null;
  }

  return { token, role, name };
}

export function persistCampusUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, user.token);
  localStorage.setItem(AUTH_STORAGE_KEYS.role, user.role);
  localStorage.setItem(AUTH_STORAGE_KEYS.name, user.name);
}

export function clearStoredCampusUser() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.role);
  localStorage.removeItem(AUTH_STORAGE_KEYS.name);
}

export function resolveCampusLoginIdentifier(identifier) {
  const normalizedIdentifier = normalize(identifier);

  if (!normalizedIdentifier) {
    return {
      success: false,
      error: 'Enter your campus email or campus ID.'
    };
  }

  if (CAMPUS_EMAIL_PATTERN.test(normalizedIdentifier)) {
    return {
      success: true,
      campusId: normalizedIdentifier.split('@')[0],
      email: normalizedIdentifier
    };
  }

  if (CAMPUS_ID_PATTERN.test(normalizedIdentifier)) {
    return {
      success: true,
      campusId: normalizedIdentifier,
      email: `${normalizedIdentifier}@my.cu.lk`
    };
  }

  return {
    success: false,
    error: 'Use only your campus email like st23707290@my.cu.lk or campus ID like st23707290.'
  };
}

export function isCampusLoginIdentifier(identifier) {
  const normalizedIdentifier = normalize(identifier);
  return CAMPUS_ID_PATTERN.test(normalizedIdentifier) || CAMPUS_EMAIL_PATTERN.test(normalizedIdentifier);
}

export function getCampusLoginHint() {
  return 'Use your campus email like st23707290@my.cu.lk or campus ID like st23707290.';
}

export function getNormalizedCampusIdentifier(identifier) {
  const normalizedIdentifier = normalize(identifier);

  if (!normalizedIdentifier) {
    return {
      success: false,
      error: 'Enter your campus email or campus ID.'
    };
  }

  return resolveCampusLoginIdentifier(normalizedIdentifier);
}
