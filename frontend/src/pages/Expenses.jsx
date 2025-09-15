import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Container, Section, Flex } from '../components/Layout/Container';
import { Button } from '../components/UI/Button';
import { MonthSelector } from '../components/UI/MonthSelector';
import { ValueConfirmModal } from '../components/UI/ValueConfirmModal';
import { TotalsCards } from '../components/UI/TotalsCards';
import { SimpleExpenseForm as ExpenseForm } from '../components/Forms/SimpleExpenseForm.jsx';
import { ExpenseList } from '../components/Lists/ExpenseList.jsx';
import { expenseService } from '../services/api';
import { saveSelectedMonth, getSelectedMonth } from '../utils/sessionStorage';

export const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({ total_pago: 0, total_aberto: 0, total_geral: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [preservedData, setPreservedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para o filtro de mês
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = getSelectedMonth();
    return saved.month;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = getSelectedMonth();
    return saved.year;
  });
  
  // Estados para o modal de confirmação de valor
  const [showValueModal, setShowValueModal] = useState(false);
  const [expenseToToggle, setExpenseToToggle] = useState(null);

  const fetchExpenses = async (month = selectedMonth, year = selectedYear) => {
    try {
      setIsLoading(true);
      const monthStr = (month + 1).toString().padStart(2, '0');
      const yearStr = year.toString();
      
      const filters = {
        mes: monthStr,
        ano: yearStr
      };
      
      // Buscar despesas e totais em paralelo
      const [expensesResponse, totalsResponse] = await Promise.all([
        expenseService.getAll(filters),
        expenseService.getTotalByMonth(monthStr, yearStr)
      ]);
      
      setExpenses(expensesResponse.data || []);
      setTotals(totalsResponse.data || { total_pago: 0, total_aberto: 0, total_geral: 0 });
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      setExpenses([]);
      setTotals({ total_pago: 0, total_aberto: 0, total_geral: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedYear]);
  
  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    saveSelectedMonth(month, year);
    fetchExpenses(month, year);
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const { saveAndNew, ...submitData } = data;

      if (editingExpense) {
        await expenseService.update(editingExpense.id, submitData);
      } else {
        await expenseService.create(submitData);
      }

      await fetchExpenses();

      if (saveAndNew && !editingExpense) {
        // Mostrar alerta de sucesso
        alert('💾 Despesa salva com sucesso! Iniciando novo lançamento...');

        // Preservar dados para novo lançamento
        setPreservedData({
          data_pagamento: data.data_pagamento,
          categoria: data.categoria,
          cartao_credito_id: data.cartao_credito_id,
          repetir: 'nao',
          parcelas: 2
        });
      } else {
        if (!editingExpense) {
          alert('✅ Despesa salva com sucesso!');
        } else {
          alert('✅ Despesa atualizada com sucesso!');
        }
        setShowForm(false);
        setEditingExpense(null);
        setPreservedData(null);
      }
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao salvar despesa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await expenseService.delete(id);
        await fetchExpenses();
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        alert('Erro ao excluir despesa. Tente novamente.');
      }
    }
  };

  const handleToggleStatus = (expense) => {
    // Se está pago, reabrir direto sem modal
    if (expense.situacao === 'pago') {
      handleConfirmToggleStatus(expense.valor, expense);
      return;
    }
    
    // Se está aberto, mostrar modal para confirmar pagamento
    setExpenseToToggle(expense);
    setShowValueModal(true);
  };
  
  const handleConfirmToggleStatus = async (confirmedValue, targetExpense = expenseToToggle) => {
    if (!targetExpense) return;
    
    try {
      const newStatus = targetExpense.situacao === 'pago' ? 'aberto' : 'pago';
      const updateData = {
        situacao: newStatus,
        valor: confirmedValue
      };
      
      await expenseService.update(targetExpense.id, updateData);
      await fetchExpenses();
      setExpenseToToggle(null);
    } catch (error) {
      console.error('Erro ao alterar situação:', error);
      alert('Erro ao alterar situação. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    setPreservedData(null);
  };

  return (
    <Section>
      <Container>
        <Flex justify="space-between" align="center" style={{ marginBottom: '2rem' }}>
          <h1>Despesas</h1>
          {!showForm && (
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              Nova Despesa
            </Button>
          )}
        </Flex>
        
        {!showForm && (
          <MonthSelector 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
        )}

        {!showForm && (
          <TotalsCards totals={totals} type="expense" />
        )}

        {showForm ? (
          <div style={{ marginBottom: '2rem' }}>
            <ExpenseForm
              onSubmit={handleSubmit}
              initialData={editingExpense}
              preservedData={preservedData}
              isLoading={isSubmitting}
            />
            <Flex justify="flex-end" style={{ marginTop: '1rem' }}>
              <Button
                variant="secondary"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </Flex>
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onRefresh={fetchExpenses}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            isLoading={isLoading}
          />
        )}
        
        <ValueConfirmModal
          isOpen={showValueModal}
          onClose={() => {
            setShowValueModal(false);
            setExpenseToToggle(null);
          }}
          onConfirm={handleConfirmToggleStatus}
          title={expenseToToggle?.situacao === 'pago' ? 'Reabrir Despesa' : 'Confirmar Pagamento'}
          currentValue={expenseToToggle?.valor || 0}
          type="expense"
        />
      </Container>
    </Section>
  );
};