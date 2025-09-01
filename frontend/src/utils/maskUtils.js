// Utilitários para máscaras de input

export const formatCurrency = (value) => {
  if (!value && value !== 0) return '';
  
  // Remove tudo que não é dígito
  const cleanValue = value.toString().replace(/\D/g, '');
  
  // Se vazio, retorna vazio
  if (!cleanValue) return '';
  
  // Converte para número e divide por 100 para ter centavos
  const numericValue = parseInt(cleanValue) / 100;
  
  // Formata como moeda brasileira
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

export const parseCurrency = (value) => {
  if (!value) return 0;
  
  // Remove símbolos da moeda e converte para número
  const cleanValue = value
    .replace('R$', '')
    .replace(/\./g, '') // Remove pontos de milhares
    .replace(',', '.') // Troca vírgula por ponto decimal
    .trim();
    
  return parseFloat(cleanValue) || 0;
};

export const applyCurrencyMask = (event) => {
  const input = event.target;
  const value = input.value;
  
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '');
  
  // Se vazio, limpa o campo
  if (!cleanValue) {
    input.value = '';
    return;
  }
  
  // Aplica a máscara
  input.value = formatCurrency(cleanValue);
};

export const handleCurrencyKeyDown = (event) => {
  // Permite: backspace, delete, tab, escape, enter
  if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
      // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true)) {
    return;
  }
  
  // Garante que é um número
  if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
    event.preventDefault();
  }
};