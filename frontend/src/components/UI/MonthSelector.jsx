import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.card};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
    gap: ${props => props.theme.spacing.xs};
  }
`;

const MonthsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    gap: 2px;
  }
`;

const MonthButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.backgroundSecondary};
  color: ${props => props.isActive ? 'white' : props.theme.colors.text};
  font-size: 0.875rem;
  font-weight: ${props => props.isActive ? '600' : '500'};
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  min-width: 60px;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: ${props => props.isActive ? props.theme.colors.primaryHover : props.theme.colors.backgroundTertiary};
    border-color: ${props => props.isActive ? props.theme.colors.primaryHover : props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    font-size: 0.75rem;
    min-width: 45px;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.backgroundTertiary};
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 36px;
    height: 36px;
  }
`;

const YearIndicator = styled.div`
  text-align: center;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 4px 12px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.sm};
  display: inline-block;
`;


const monthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const monthNamesFull = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MonthSelector = ({ selectedMonth, selectedYear, onMonthChange }) => {
  const [currentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Gerar array com 5 meses: 2 anteriores, atual, 2 posteriores
  const getVisibleMonths = () => {
    const months = [];
    const baseDate = new Date(selectedYear, selectedMonth);
    
    for (let i = -2; i <= 2; i++) {
      const date = new Date(baseDate);
      date.setMonth(baseDate.getMonth() + i);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        isSelected: date.getMonth() === selectedMonth && date.getFullYear() === selectedYear,
        isCurrent: date.getMonth() === currentMonth && date.getFullYear() === currentYear,
        showYear: i === 0 || date.getFullYear() !== selectedYear
      });
    }
    
    return months;
  };

  const visibleMonths = getVisibleMonths();

  const handlePrevious = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1);
    onMonthChange(newDate.getMonth(), newDate.getFullYear());
  };

  const handleNext = () => {
    const newDate = new Date(selectedYear, selectedMonth + 1);
    onMonthChange(newDate.getMonth(), newDate.getFullYear());
  };

  const handleMonthClick = (month, year) => {
    onMonthChange(month, year);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <YearIndicator>{selectedYear}</YearIndicator>
      </div>
      
      <SelectorContainer>
        <NavButton onClick={handlePrevious}>
          <ChevronLeft size={20} />
        </NavButton>
        
        <MonthsContainer>
          {visibleMonths.map((monthData, index) => (
            <MonthButton
              key={`${monthData.year}-${monthData.month}`}
              isActive={monthData.isSelected}
              isCurrent={monthData.isCurrent}
              onClick={() => handleMonthClick(monthData.month, monthData.year)}
              title={`${monthNamesFull[monthData.month]} ${monthData.year}`}
            >
              {monthNames[monthData.month]}
            </MonthButton>
          ))}
        </MonthsContainer>
        
        <NavButton onClick={handleNext}>
          <ChevronRight size={20} />
        </NavButton>
      </SelectorContainer>
    </div>
  );
};