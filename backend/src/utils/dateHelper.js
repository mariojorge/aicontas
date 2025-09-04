/**
 * Helper para lidar com datas evitando problemas de timezone
 */

/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto Date local
 * evitando problemas de timezone
 * @param {string} dateString - Data no formato YYYY-MM-DD
 * @returns {Date} - Objeto Date com hora configurada para meio-dia
 */
function parseLocalDate(dateString) {
  if (!dateString) return null;
  
  // Se já for um objeto Date, retorna ele mesmo
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Parse manual da string para evitar timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  // Criar data com hora ao meio-dia para evitar problemas de DST
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Formata uma data para string no formato YYYY-MM-DD
 * @param {Date} date - Objeto Date
 * @returns {string} - Data no formato YYYY-MM-DD
 */
function formatDateToString(date) {
  if (!date) return null;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

module.exports = {
  parseLocalDate,
  formatDateToString
};