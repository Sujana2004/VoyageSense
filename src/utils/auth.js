export const getUser = () => {
  const user = localStorage.getItem('user');
  
  // Check if user exists and is not "undefined" or "null" string
  if (!user || user === 'undefined' || user === 'null') {
    return null;
  }
  
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user'); // Clean up invalid data
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setAuth = (token, user) => {
  // Validate inputs before storing
  if (token && user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    console.error('Invalid token or user data');
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'ADMIN';
};