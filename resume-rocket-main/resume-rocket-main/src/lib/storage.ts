export const getStorageKey = (key: string) => {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.email) {
        return `${user.email}_${key}`;
      }
    } catch (e) {}
  }
  return key; // Default for guests
};

export const setStorageItem = (key: string, value: string) => {
  localStorage.setItem(getStorageKey(key), value);
};

export const getStorageItem = (key: string) => {
  return localStorage.getItem(getStorageKey(key));
};

export const removeStorageItem = (key: string) => {
  localStorage.removeItem(getStorageKey(key));
};
