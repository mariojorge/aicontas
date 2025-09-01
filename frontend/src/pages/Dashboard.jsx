import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Container, Section, Grid } from '../components/Layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { MonthSelector } from '../components/UI/MonthSelector';
import { PrivateValue } from '../components/UI/PrivateValue';
import { expenseService, incomeService } from '../services/api';
import { saveSelectedMonth, getSelectedMonth } from '../utils/sessionStorage';

const StatsCard = styled(Card)`
  text-align: center;
`;

const StatsIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.md};
`;

const StatsValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
`;

const StatsLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;


const BalanceCard = styled(StatsCard)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  color: white;
  
  ${StatsValue} {
    color: white;
  }
  
  ${StatsLabel} {
    color: rgba(255, 255, 255, 0.8);
  }
`;

export const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = getSelectedMonth();
    return saved.month;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = getSelectedMonth();
    return saved.year;
  });
  const [stats, setStats] = useState({
    totalIncomes: 0,
    totalExpenses: 0,
    pendingIncomes: 0,
    pendingExpenses: 0,
    balance: 0
  });
  const [isLoading, setIsLoading] = useState(true);


  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const [expenseStats, incomeStats] = await Promise.all([
        expenseService.getTotalByMonth((selectedMonth + 1).toString().padStart(2, '0'), selectedYear),
        incomeService.getTotalByMonth((selectedMonth + 1).toString().padStart(2, '0'), selectedYear)
      ]);

      const totalIncomes = incomeStats.data?.total_recebido || 0;
      const totalExpenses = expenseStats.data?.total_pago || 0;
      const pendingIncomes = incomeStats.data?.total_aberto || 0;
      const pendingExpenses = expenseStats.data?.total_aberto || 0;
      const balance = totalIncomes - totalExpenses;

      setStats({
        totalIncomes,
        totalExpenses,
        pendingIncomes,
        pendingExpenses,
        balance
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    saveSelectedMonth(month, year);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };


  return (
    <Section>
      <Container>
        <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
          Dashboard Financeiro
        </h1>
        
        <MonthSelector 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={handleMonthChange}
        />

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Carregando estatísticas...
          </div>
        ) : (
          <Grid columns="repeat(auto-fit, minmax(250px, 1fr))">
            <BalanceCard>
              <CardContent>
                <StatsIcon color="white">
                  <DollarSign size={28} />
                </StatsIcon>
                <PrivateValue>
                  <StatsValue>{formatCurrency(stats.balance)}</StatsValue>
                </PrivateValue>
                <StatsLabel>Saldo do Mês</StatsLabel>
              </CardContent>
            </BalanceCard>

            <StatsCard>
              <CardContent>
                <StatsIcon color="#10b981">
                  <TrendingUp size={28} />
                </StatsIcon>
                <PrivateValue>
                  <StatsValue>{formatCurrency(stats.totalIncomes)}</StatsValue>
                </PrivateValue>
                <StatsLabel>Receitas Recebidas</StatsLabel>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent>
                <StatsIcon color="#ef4444">
                  <TrendingDown size={28} />
                </StatsIcon>
                <PrivateValue>
                  <StatsValue>{formatCurrency(stats.totalExpenses)}</StatsValue>
                </PrivateValue>
                <StatsLabel>Despesas Pagas</StatsLabel>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent>
                <StatsIcon color="#f59e0b">
                  <Calendar size={28} />
                </StatsIcon>
                <PrivateValue>
                  <StatsValue>{formatCurrency(stats.pendingIncomes)}</StatsValue>
                </PrivateValue>
                <StatsLabel>Receitas Pendentes</StatsLabel>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent>
                <StatsIcon color="#f59e0b">
                  <Calendar size={28} />
                </StatsIcon>
                <PrivateValue>
                  <StatsValue>{formatCurrency(stats.pendingExpenses)}</StatsValue>
                </PrivateValue>
                <StatsLabel>Despesas Pendentes</StatsLabel>
              </CardContent>
            </StatsCard>
          </Grid>
        )}
      </Container>
    </Section>
  );
};