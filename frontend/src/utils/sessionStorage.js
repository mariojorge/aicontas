// Utilitários para gerenciar dados de sessão

const SESSION_KEYS = {
  SELECTED_MONTH: 'finance_control_selected_month',
  SELECTED_YEAR: 'finance_control_selected_year'
};

export const saveSelectedMonth = (month, year) => {
  try {
    sessionStorage.setItem(SESSION_KEYS.SELECTED_MONTH, month.toString());
    sessionStorage.setItem(SESSION_KEYS.SELECTED_YEAR, year.toString());
  } catch (error) {
    console.warn('Erro ao salvar mês na sessão:', error);
  }
};

export const getSelectedMonth = () => {
  try {
    const savedMonth = sessionStorage.getItem(SESSION_KEYS.SELECTED_MONTH);
    const savedYear = sessionStorage.getItem(SESSION_KEYS.SELECTED_YEAR);
    
    if (savedMonth !== null && savedYear !== null) {
      return {
        month: parseInt(savedMonth, 10),
        year: parseInt(savedYear, 10)
      };
    }
  } catch (error) {
    console.warn('Erro ao recuperar mês da sessão:', error);
  }
  
  // Retornar mês atual como fallback
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear()
  };
};

export const clearSelectedMonth = () => {
  try {
    sessionStorage.removeItem(SESSION_KEYS.SELECTED_MONTH);
    sessionStorage.removeItem(SESSION_KEYS.SELECTED_YEAR);
  } catch (error) {
    console.warn('Erro ao limpar mês da sessão:', error);
  }
};