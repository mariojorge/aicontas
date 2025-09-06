import React from 'react';
import styled from 'styled-components';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card';

const ChartContainer = styled.div`
  width: 100%;
  height: ${props => props.height || '180px'};
  margin: ${props => props.theme.spacing.xs} 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SummaryCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm};
  text-align: center;
`;

const SummaryLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const SummaryValue = styled.div`
  color: ${props => props.color || props.theme.colors.text};
  font-size: 1.1rem;
  font-weight: 600;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.75rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  background-color: ${props => props.color};
  border-radius: 2px;
`;

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
  pending: '#f59e0b',
  paid: '#3b82f6',
  received: '#10b981',
  chart: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '8px 12px'
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyCharts = ({ expenses = [], incomes = [], expenseCategories = [], incomeCategories = [] }) => {
  // Calcular totais
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.valor || 0), 0);
  const totalIncomes = incomes.reduce((sum, item) => sum + parseFloat(item.valor || 0), 0);
  const balance = totalIncomes - totalExpenses;
  
  // Calcular pagos/recebidos vs pendentes para o resumo
  const expensesPaid = expenses.filter(e => e.situacao === 'pago').reduce((sum, item) => sum + parseFloat(item.valor || 0), 0);

  // Dados para gráfico de pizza de despesas
  const expensePieData = expenseCategories.map((cat, index) => ({
    name: cat.categoria || 'Sem categoria',
    value: parseFloat(cat.total || 0),
    color: COLORS.chart[index % COLORS.chart.length]
  })).filter(item => item.value > 0);

  // Dados para gráfico de pizza de receitas
  const incomePieData = incomeCategories.map((cat, index) => ({
    name: cat.categoria || 'Sem categoria',
    value: parseFloat(cat.total || 0),
    color: COLORS.chart[index % COLORS.chart.length]
  })).filter(item => item.value > 0);


  // Dados para gráfico de categorias combinado
  const categoryMap = {};
  
  // Adicionar despesas
  expenseCategories.forEach(cat => {
    if (!categoryMap[cat.categoria]) {
      categoryMap[cat.categoria] = { categoria: cat.categoria, despesas: 0, receitas: 0 };
    }
    categoryMap[cat.categoria].despesas = parseFloat(cat.total || 0);
  });
  
  // Adicionar receitas
  incomeCategories.forEach(cat => {
    if (!categoryMap[cat.categoria]) {
      categoryMap[cat.categoria] = { categoria: cat.categoria, despesas: 0, receitas: 0 };
    }
    categoryMap[cat.categoria].receitas = parseFloat(cat.total || 0);
  });
  
  const categoryData = Object.values(categoryMap)
    .sort((a, b) => (b.despesas + b.receitas) - (a.despesas + a.receitas))
    .slice(0, 8); // Limitar a 8 categorias mais relevantes

  return (
    <>
      {/* Resumo Geral */}
      <SummaryGrid>
        <SummaryCard>
          <SummaryLabel>Total de Receitas</SummaryLabel>
          <SummaryValue color={COLORS.income}>{formatCurrency(totalIncomes)}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Total de Despesas</SummaryLabel>
          <SummaryValue color={COLORS.expense}>{formatCurrency(totalExpenses)}</SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Saldo do Mês</SummaryLabel>
          <SummaryValue color={balance >= 0 ? COLORS.income : COLORS.expense}>
            {formatCurrency(balance)}
          </SummaryValue>
        </SummaryCard>
        <SummaryCard>
          <SummaryLabel>Taxa de Pagamento</SummaryLabel>
          <SummaryValue color={COLORS.paid}>
            {totalExpenses > 0 ? Math.round((expensesPaid / totalExpenses) * 100) : 0}%
          </SummaryValue>
        </SummaryCard>
      </SummaryGrid>

      {/* Gráficos de Pizza */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {/* Gráficos de Pizza - Despesas */}
        {expensePieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height="150px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <LegendContainer>
                {expensePieData.slice(0, 4).map((item, index) => (
                  <LegendItem key={index}>
                    <LegendColor color={item.color} />
                    <span>{item.name}</span>
                  </LegendItem>
                ))}
              </LegendContainer>
            </CardContent>
          </Card>
        )}

        {/* Gráficos de Pizza - Receitas */}
        {incomePieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Receitas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height="150px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incomePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <LegendContainer>
                {incomePieData.slice(0, 4).map((item, index) => (
                  <LegendItem key={index}>
                    <LegendColor color={item.color} />
                    <span>{item.name}</span>
                  </LegendItem>
                ))}
              </LegendContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráfico de Categorias Comparativo - ocupando toda largura */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparativo por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height="340px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="categoria" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="receitas" fill={COLORS.income} name="Receitas" />
                  <Bar dataKey="despesas" fill={COLORS.expense} name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </>
  );
};