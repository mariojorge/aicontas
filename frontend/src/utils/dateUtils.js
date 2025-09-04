/**
 * Formata uma data string (YYYY-MM-DD) para o formato brasileiro (DD/MM/YYYY)
 * evitando problemas de timezone
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {string} - Data no formato DD/MM/YYYY
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Parse manual da string para evitar timezone issues
  const [year, month, day] = dateString.split('-');
  
  // Retorna no formato brasileiro DD/MM/YYYY
  return `${day}/${month}/${year}`;
};

/**
 * Converte uma data no formato DD/MM/YYYY para YYYY-MM-DD
 * @param {string} brazilianDate - Data no formato DD/MM/YYYY
 * @returns {string} - Data no formato YYYY-MM-DD
 */
export const parseBrazilianDate = (brazilianDate) => {
  if (!brazilianDate) return '';
  
  const [day, month, year] = brazilianDate.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};