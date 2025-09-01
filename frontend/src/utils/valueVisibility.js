const STORAGE_KEY = 'finance_values_visible';

export const getValueVisibility = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : true; // Por padrão, valores são visíveis
};

export const setValueVisibility = (visible) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
};

export const toggleValueVisibility = () => {
  const current = getValueVisibility();
  const newValue = !current;
  setValueVisibility(newValue);
  return newValue;
};