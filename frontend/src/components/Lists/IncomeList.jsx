import React, { useState } from 'react';
import styled from 'styled-components';
import { Edit2, Trash2, Calendar, DollarSign, Tag, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardGrid } from '../UI/Card';
import { Button } from '../UI/Button';
import { PrivateValue } from '../UI/PrivateValue';
import { GroupItemsModal } from '../UI/GroupItemsModal';
import { incomeService } from '../../services/api';

const ListContainer = styled.div`
  width: 100%;
`;

const TableWrapper = styled.div`
  background: ${props => props.theme.colors.card};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: ${props => props.theme.colors.backgroundTertiary};
`;

const TableHeaderCell = styled.th`
  padding: ${props => props.theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TableRow = styled.tr`
  &:hover {
    background-color: ${props => props.theme.colors.backgroundTertiary};
  }
`;

const TableCell = styled.td`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
`;

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${props => props.status === 'recebido' ? props.theme.colors.success : props.theme.colors.warning};
  color: white;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  transition: ${props => props.theme.transitions.fast};
  min-height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme.colors.backgroundTertiary};
    color: ${props => props.theme.colors.text};
  }
`;

const MobileCardGrid = styled(CardGrid)`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: grid;
  }
`;

const MobileCard = styled(Card)`
  cursor: pointer;
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardLabel = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const CardValue = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Description = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ClickableDescription = styled.span`
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  color: ${props => props.clickable ? props.theme.colors.primary : props.theme.colors.text};
  
  &:hover {
    color: ${props => props.clickable ? props.theme.colors.primaryHover : props.theme.colors.text};
    text-decoration: ${props => props.clickable ? 'underline' : 'none'};
  }
`;

const Value = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.success};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.md};
`;

const MobileActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  color: ${props => props.theme.colors.textSecondary};

  &:hover {
    background: ${props => props.theme.colors.backgroundTertiary};
  }
`;

export const IncomeList = ({ 
  incomes = [], 
  onEdit, 
  onDelete,
  onToggleStatus,
  isLoading 
}) => {
  const [groupModal, setGroupModal] = useState({ 
    isOpen: false, 
    groupData: null 
  });
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Parse manual da string para evitar timezone issues
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatRecorrencia = (income) => {
    if (income.repetir === 'fixo') {
      return 'Receita fixa';
    } else if (income.repetir === 'parcelado') {
      return `${income.parcela_atual || 1}/${income.parcelas || 1}`;
    }
    return 'Única';
  };

  const isGroupClickable = (income) => {
    return income.repetir === 'fixo' || income.repetir === 'parcelado';
  };

  const handleDescriptionClick = (income) => {
    if (isGroupClickable(income)) {
      setGroupModal({
        isOpen: true,
        groupData: income
      });
    }
  };

  const handleCloseGroupModal = () => {
    setGroupModal({
      isOpen: false,
      groupData: null
    });
  };

  const handleFetchGroup = async (descricao, repetir, groupId) => {
    try {
      // Preferir group_id se disponível
      if (groupId) {
        const response = await incomeService.getGroupById(groupId);
        return response.data;
      }
      // Fallback para método legado
      const response = await incomeService.getGroup(descricao, repetir);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <EmptyState>
        Carregando receitas...
      </EmptyState>
    );
  }

  if (incomes.length === 0) {
    return (
      <EmptyState>
        <DollarSign size={48} style={{ marginBottom: '1rem' }} />
        <h3>Nenhuma receita encontrada</h3>
        <p>Adicione sua primeira receita para começar o controle financeiro.</p>
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      {/* Tabela para Desktop */}
      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Descrição</TableHeaderCell>
              <TableHeaderCell>Valor</TableHeaderCell>
              <TableHeaderCell>Situação</TableHeaderCell>
              <TableHeaderCell>Categoria</TableHeaderCell>
              <TableHeaderCell>Data</TableHeaderCell>
              <TableHeaderCell>Recorrência</TableHeaderCell>
              <TableHeaderCell>Ações</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell>
                  <div>
                    <ClickableDescription 
                      clickable={isGroupClickable(income)}
                      onClick={() => handleDescriptionClick(income)}
                    >
                      <strong>{income.descricao}</strong>
                    </ClickableDescription>
                  </div>
                </TableCell>
                <TableCell>
                  <PrivateValue>
                    <Value>{formatCurrency(income.valor)}</Value>
                  </PrivateValue>
                </TableCell>
                <TableCell>
                  <StatusBadge status={income.situacao}>
                    {income.situacao === 'recebido' ? 'Recebido' : 'Aberto'}
                  </StatusBadge>
                </TableCell>
                <TableCell>{income.categoria}</TableCell>
                <TableCell>{formatDate(income.data_recebimento)}</TableCell>
                <TableCell>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    {formatRecorrencia(income)}
                  </span>
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    <ActionButton
                      onClick={() => onToggleStatus && onToggleStatus(income)}
                      title={income.situacao === 'recebido' ? 'Marcar como aberto' : 'Marcar como recebido'}
                    >
                      {income.situacao === 'recebido' ? <Circle size={16} /> : <CheckCircle size={16} />}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onEdit && onEdit(income)}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </ActionButton>
                    <ActionButton
                      onClick={() => onDelete && onDelete(income.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </ActionButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      {/* Cards para Mobile */}
      <MobileCardGrid>
        {incomes.map((income) => (
          <MobileCard key={income.id}>
            <CardContent>
              <Description>
                <ClickableDescription 
                  clickable={isGroupClickable(income)}
                  onClick={() => handleDescriptionClick(income)}
                >
                  {income.descricao}
                </ClickableDescription>
              </Description>
              
              <CardRow>
                <CardLabel>
                  <DollarSign size={16} />
                  Valor
                </CardLabel>
                <PrivateValue>
                  <Value>{formatCurrency(income.valor)}</Value>
                </PrivateValue>
              </CardRow>
              
              <CardRow>
                <CardLabel>Situação</CardLabel>
                <StatusBadge status={income.situacao}>
                  {income.situacao === 'recebido' ? 'Recebido' : 'Aberto'}
                </StatusBadge>
              </CardRow>
              
              <CardRow>
                <CardLabel>
                  <Tag size={16} />
                  Categoria
                </CardLabel>
                <CardValue>
                  {income.categoria}
                </CardValue>
              </CardRow>
              
              <CardRow>
                <CardLabel>
                  <Calendar size={16} />
                  Data
                </CardLabel>
                <CardValue>{formatDate(income.data_recebimento)}</CardValue>
              </CardRow>
              
              <CardRow>
                <CardLabel>Recorrência</CardLabel>
                <CardValue>{formatRecorrencia(income)}</CardValue>
              </CardRow>
              
              <MobileCardActions>
                <MobileActionButton
                  onClick={() => onToggleStatus && onToggleStatus(income)}
                  title={income.situacao === 'recebido' ? 'Marcar como aberto' : 'Marcar como recebido'}
                  style={{ color: income.situacao === 'recebido' ? '#64748b' : '#10b981' }}
                >
                  {income.situacao === 'recebido' ? <Circle size={18} /> : <CheckCircle size={18} />}
                </MobileActionButton>
                <MobileActionButton
                  onClick={() => onEdit && onEdit(income)}
                  title="Editar"
                >
                  <Edit2 size={18} />
                </MobileActionButton>
                <MobileActionButton
                  onClick={() => onDelete && onDelete(income.id)}
                  title="Excluir"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={18} />
                </MobileActionButton>
              </MobileCardActions>
            </CardContent>
          </MobileCard>
        ))}
      </MobileCardGrid>

      <GroupItemsModal
        isOpen={groupModal.isOpen}
        onClose={handleCloseGroupModal}
        groupData={groupModal.groupData}
        type="income"
        onFetchGroup={handleFetchGroup}
      />
    </ListContainer>
  );
};