import { useState, useEffect } from 'react';

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

export const useValueVisibility = () => {
  const [isVisible, setIsVisible] = useState(() => getValueVisibility());

  useEffect(() => {
    const handleVisibilityChange = (event) => {
      if (event.detail && event.detail.visible !== undefined) {
        setIsVisible(event.detail.visible);
      }
    };

    window.addEventListener('valueVisibilityChanged', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('valueVisibilityChanged', handleVisibilityChange);
    };
  }, []);

  return { isVisible };
};