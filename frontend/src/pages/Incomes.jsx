import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Container, Section, Flex } from '../components/Layout/Container';
import { Button } from '../components/UI/Button';
import { MonthSelector } from '../components/UI/MonthSelector';
import { ValueConfirmModal } from '../components/UI/ValueConfirmModal';
import { TotalsCards } from '../components/UI/TotalsCards';
import { SimpleIncomeForm as IncomeForm } from '../components/Forms/SimpleIncomeForm.jsx';
import { IncomeList } from '../components/Lists/IncomeList.jsx';
import { incomeService } from '../services/api';
import { saveSelectedMonth, getSelectedMonth } from '../utils/sessionStorage';

export const Incomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [totals, setTotals] = useState({ total_recebido: 0, total_aberto: 0, total_geral: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
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
  const [incomeToToggle, setIncomeToToggle] = useState(null);

  const fetchIncomes = async (month = selectedMonth, year = selectedYear) => {
    try {
      setIsLoading(true);
      const monthStr = (month + 1).toString().padStart(2, '0');
      const yearStr = year.toString();
      
      const filters = {
        mes: monthStr,
        ano: yearStr
      };
      
      // Buscar receitas e totais em paralelo
      const [incomesResponse, totalsResponse] = await Promise.all([
        incomeService.getAll(filters),
        incomeService.getTotalByMonth(monthStr, yearStr)
      ]);
      
      setIncomes(incomesResponse.data || []);
      setTotals(totalsResponse.data || { total_recebido: 0, total_aberto: 0, total_geral: 0 });
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      setIncomes([]);
      setTotals({ total_recebido: 0, total_aberto: 0, total_geral: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [selectedMonth, selectedYear]);
  
  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    saveSelectedMonth(month, year);
    fetchIncomes(month, year);
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      if (editingIncome) {
        await incomeService.update(editingIncome.id, data);
      } else {
        await incomeService.create(data);
      }
      
      await fetchIncomes();
      setShowForm(false);
      setEditingIncome(null);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await incomeService.delete(id);
        await fetchIncomes();
      } catch (error) {
        console.error('Erro ao excluir receita:', error);
        alert('Erro ao excluir receita. Tente novamente.');
      }
    }
  };

  const handleToggleStatus = (income) => {
    // Se está recebido, reabrir direto sem modal
    if (income.situacao === 'recebido') {
      handleConfirmToggleStatus(income.valor, income);
      return;
    }
    
    // Se está aberto, mostrar modal para confirmar recebimento
    setIncomeToToggle(income);
    setShowValueModal(true);
  };
  
  const handleConfirmToggleStatus = async (confirmedValue, targetIncome = incomeToToggle) => {
    if (!targetIncome) return;
    
    try {
      const newStatus = targetIncome.situacao === 'recebido' ? 'aberto' : 'recebido';
      const updateData = {
        situacao: newStatus,
        valor: confirmedValue
      };
      
      await incomeService.update(targetIncome.id, updateData);
      await fetchIncomes();
      setIncomeToToggle(null);
    } catch (error) {
      console.error('Erro ao alterar situação:', error);
      alert('Erro ao alterar situação. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIncome(null);
  };

  return (
    <Section>
      <Container>
        <Flex justify="space-between" align="center" style={{ marginBottom: '2rem' }}>
          <h1>Receitas</h1>
          {!showForm && (
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              Nova Receita
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
          <TotalsCards totals={totals} type="income" />
        )}

        {showForm ? (
          <div style={{ marginBottom: '2rem' }}>
            <IncomeForm
              onSubmit={handleSubmit}
              initialData={editingIncome}
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
          <IncomeList
            incomes={incomes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            isLoading={isLoading}
          />
        )}
        
        <ValueConfirmModal
          isOpen={showValueModal}
          onClose={() => {
            setShowValueModal(false);
            setIncomeToToggle(null);
          }}
          onConfirm={handleConfirmToggleStatus}
          title={incomeToToggle?.situacao === 'recebido' ? 'Reabrir Receita' : 'Confirmar Recebimento'}
          currentValue={incomeToToggle?.valor || 0}
          type="income"
        />
      </Container>
    </Section>
  );
};