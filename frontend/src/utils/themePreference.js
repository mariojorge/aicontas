const THEME_KEY = 'finance_control_theme';

export const getThemePreference = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // Se não houver tema salvo, verificar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  } catch (error) {
    console.error('Erro ao recuperar preferência de tema:', error);
    return 'light';
  }
};

export const setThemePreference = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
    return true;
  } catch (error) {
    console.error('Erro ao salvar preferência de tema:', error);
    return false;
  }
};

export const toggleTheme = () => {
  const currentTheme = getThemePreference();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setThemePreference(newTheme);
  return newTheme;
};