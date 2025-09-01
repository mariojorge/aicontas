import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BarChart3, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { Container, Section, Grid } from '../components/Layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { MonthSelector } from '../components/UI/MonthSelector';
import { PrivateValue } from '../components/UI/PrivateValue';
import { expenseService, incomeService } from '../services/api';
import { saveSelectedMonth, getSelectedMonth } from '../utils/sessionStorage';


const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    gap: ${props => props.theme.spacing.sm};
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${props => props.theme.colors.primary};
    cursor: pointer;
  }
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryName = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const CategoryValue = styled.span`
  font-weight: 600;
  color: ${props => props.type === 'expense' ? props.theme.colors.error : props.theme.colors.success};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
`;

export const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = getSelectedMonth();
    return saved.month;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = getSelectedMonth();
    return saved.year;
  });
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyPaid, setShowOnlyPaid] = useState(false);


  const fetchReports = async () => {
    try {
      setIsLoading(true);
      
      const expenseSituation = showOnlyPaid ? 'pago' : null;
      const incomeSituation = showOnlyPaid ? 'recebido' : null;
      
      const [expenseResponse, incomeResponse] = await Promise.all([
        expenseService.getByCategory((selectedMonth + 1).toString().padStart(2, '0'), selectedYear, expenseSituation),
        incomeService.getByCategory((selectedMonth + 1).toString().padStart(2, '0'), selectedYear, incomeSituation)
      ]);

      setExpenseCategories(expenseResponse.data || []);
      setIncomeCategories(incomeResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedYear, showOnlyPaid]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    saveSelectedMonth(month, year);
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Carregando relatórios...
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
          Relatórios Financeiros
        </h1>
        
        <FilterContainer>
          <MonthSelector 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
          
          <CheckboxContainer>
            <input
              type="checkbox"
              checked={showOnlyPaid}
              onChange={(e) => setShowOnlyPaid(e.target.checked)}
            />
            Exibir somente pagos/recebidos
          </CheckboxContainer>
        </FilterContainer>

        <Grid columns="repeat(auto-fit, minmax(400px, 1fr))">
          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingDown size={20} style={{ color: '#ef4444' }} />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenseCategories.length === 0 ? (
                <EmptyState>
                  <PieChart size={48} style={{ marginBottom: '1rem' }} />
                  <p>Nenhuma despesa encontrada para este mês</p>
                </EmptyState>
              ) : (
                expenseCategories.map((category, index) => (
                  <CategoryItem key={index}>
                    <CategoryName>{category.categoria}</CategoryName>
                    <PrivateValue>
                      <CategoryValue type="expense">
                        {formatCurrency(category.total)}
                      </CategoryValue>
                    </PrivateValue>
                  </CategoryItem>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} style={{ color: '#10b981' }} />
                Receitas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomeCategories.length === 0 ? (
                <EmptyState>
                  <BarChart3 size={48} style={{ marginBottom: '1rem' }} />
                  <p>Nenhuma receita encontrada para este mês</p>
                </EmptyState>
              ) : (
                incomeCategories.map((category, index) => (
                  <CategoryItem key={index}>
                    <CategoryName>{category.categoria}</CategoryName>
                    <PrivateValue>
                      <CategoryValue type="income">
                        {formatCurrency(category.total)}
                      </CategoryValue>
                    </PrivateValue>
                  </CategoryItem>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </Section>
  );
};