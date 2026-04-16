export const CAMPUS_ACCOUNTS = [
  {
    role: 'ROLE_STUDENT',
    title: 'Student Portal',
    subtitle: 'Students use the `st` prefix with their campus identifier.',
    username: 'st.cu2354675',
    password: 'ST@2026',
    email: 'cu2354675@fcu.lk',
    backendPassword: 'password123',
    name: 'Student Center',
    accent: '#2563eb',
    surface: '#eff6ff'
  },
  {
    role: 'ROLE_TECHNICIAN',
    title: 'Technician Portal',
    subtitle: 'Technicians use the `tc` prefix with their service name.',
    username: 'tc.saman',
    password: 'TC@2026',
    email: 'tcsaman@fcu.lk',
    backendPassword: 'password123',
    name: 'Technician Saman',
    accent: '#d97706',
    surface: '#fff7ed'
  },
  {
    role: 'ROLE_MANAGER',
    title: 'Manager Portal',
    subtitle: 'Managers use the `mg` prefix for campus operations access.',
    username: 'mg.ghettiarchhi',
    password: 'MG@2026',
    email: 'mghettiarchhi@fcu.lk',
    backendPassword: 'password123',
    name: 'Manager Ghettiarchhi',
    accent: '#059669',
    surface: '#ecfdf5'
  },
  {
    role: 'ROLE_ADMIN',
    title: 'System Admin',
    subtitle: 'Admins use the `ad` prefix for platform administration.',
    username: 'ad.campus',
    password: 'AD@2026',
    email: 'test@campus.edu',
    backendPassword: 'password123',
    name: 'System Admin',
    accent: '#7c3aed',
    surface: '#f5f3ff'
  }
];

export const AUTH_STORAGE_KEYS = {
  token: 'token',
  role: 'role',
  name: 'name'
};

const SUPPORTED_ROLES = CAMPUS_ACCOUNTS.map((account) => account.role);
const normalize = (value) => value.trim().toLowerCase();

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

export function resolveCampusCredentials(username, password) {
  const account = CAMPUS_ACCOUNTS.find(
    (entry) => entry.username === normalize(username)
  );

  if (!account) {
    return {
      success: false,
      error: 'Use one of the assigned campus usernames shown below.'
    };
  }

  if (password !== account.password) {
    return {
      success: false,
      error: 'Incorrect password for that campus account.'
    };
  }

  return {
    success: true,
    account
  };
}
