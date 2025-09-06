import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DollarSign, Plus, Edit2, Trash2, Calendar, TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { Container, Section } from '../components/Layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ConfirmModal } from '../components/UI/Modal';
import { investmentTransactionService, investmentAssetService } from '../services/api';

const FilterContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.backgroundTertiary};
  }
`;

const FilterSelect = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: white;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;
  min-width: 180px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TransactionsList = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
`;

const TransactionItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto auto auto;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: white;
  gap: ${props => props.theme.spacing.md};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const TypeIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch(props.type) {
      case 'compra': return `${props.theme.colors.error}20`;
      case 'venda': return `${props.theme.colors.success}20`;
      case 'dividendos': return `${props.theme.colors.primary}20`;
      default: return `${props.theme.colors.error}20`;
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'compra': return props.theme.colors.error;
      case 'venda': return props.theme.colors.success;
      case 'dividendos': return props.theme.colors.primary;
      default: return props.theme.colors.error;
    }
  }};
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const AssetName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const TransactionDetails = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ValueInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
`;

const TotalValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => {
    switch(props.type) {
      case 'compra': return props.theme.colors.error;
      case 'venda': return props.theme.colors.success;
      case 'dividendos': return props.theme.colors.primary;
      default: return props.theme.colors.error;
    }
  }};
`;

const UnitValue = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ActionButton = styled.button`
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

  &:hover {
    background: ${props => props.theme.colors.backgroundTertiary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormField = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CalculatedTotal = styled.div`
  margin-top: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.backgroundTertiary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.lg};
`;

export const InvestmentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, transaction: null });
  
  const [formData, setFormData] = useState({
    asset_id: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'compra',
    quantidade: '',
    valor_unitario: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchAssets();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (filter !== 'all') {
      filtered = filtered.filter(transaction => transaction.tipo === filter);
    }

    if (assetFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.asset_id === parseInt(assetFilter));
    }

    setFilteredTransactions(filtered);
  }, [transactions, filter, assetFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await investmentTransactionService.getAll();
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await investmentAssetService.getAll({ ativo: 1 });
      setAssets(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
    }
  };

  const openModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        asset_id: transaction.asset_id,
        data: transaction.data.split('T')[0],
        tipo: transaction.tipo,
        quantidade: transaction.quantidade,
        valor_unitario: transaction.valor_unitario
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        asset_id: '',
        data: new Date().toISOString().split('T')[0],
        tipo: 'compra',
        quantidade: '',
        valor_unitario: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTransaction) {
        await investmentTransactionService.update(editingTransaction.id, formData);
      } else {
        await investmentTransactionService.create(formData);
      }
      
      closeModal();
      fetchTransactions();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleDelete = async (transaction) => {
    setConfirmModal({ show: true, transaction });
  };

  const confirmDelete = async () => {
    try {
      await investmentTransactionService.delete(confirmModal.transaction.id);
      setConfirmModal({ show: false, transaction: null });
      fetchTransactions();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateTotal = () => {
    const quantidade = parseFloat(formData.quantidade) || 0;
    const valorUnitario = parseFloat(formData.valor_unitario) || 0;
    return quantidade * valorUnitario;
  };

  const getAssetName = (assetId) => {
    const asset = assets.find(a => a.id === parseInt(assetId));
    return asset ? asset.nome : 'Ativo não encontrado';
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'compra': return <TrendingDown size={20} />;
      case 'venda': return <TrendingUp size={20} />;
      case 'dividendos': return <Coins size={20} />;
      default: return <TrendingDown size={20} />;
    }
  };

  const getTransactionSign = (type) => {
    switch(type) {
      case 'compra': return '-';
      case 'venda': return '+';
      case 'dividendos': return '+';
      default: return '-';
    }
  };

  return (
    <Section>
      <Container>
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={24} />
              Transações de Investimento
            </CardTitle>
            <Button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} />
              Nova Transação
            </Button>
          </CardHeader>
          
          <CardContent>
            <FilterContainer>
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                Todas
              </FilterButton>
              <FilterButton
                active={filter === 'compra'}
                onClick={() => setFilter('compra')}
              >
                Compras
              </FilterButton>
              <FilterButton
                active={filter === 'venda'}
                onClick={() => setFilter('venda')}
              >
                Vendas
              </FilterButton>
              <FilterButton
                active={filter === 'dividendos'}
                onClick={() => setFilter('dividendos')}
              >
                Dividendos
              </FilterButton>
              <FilterSelect
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
              >
                <option value="all">Todos os Ativos</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.nome}
                  </option>
                ))}
              </FilterSelect>
            </FilterContainer>

            {isLoading ? (
              <EmptyState>Carregando transações...</EmptyState>
            ) : filteredTransactions.length === 0 ? (
              <EmptyState>
                <DollarSign size={48} style={{ marginBottom: '1rem' }} />
                <p>Nenhuma transação encontrada</p>
              </EmptyState>
            ) : (
              <TransactionsList>
                {filteredTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id}>
                    <TypeIcon type={transaction.tipo}>
                      {getTransactionIcon(transaction.tipo)}
                    </TypeIcon>
                    
                    <TransactionInfo>
                      <AssetName>{transaction.asset_name}</AssetName>
                      <TransactionDetails>
                        {formatDate(transaction.data)} • {transaction.quantidade} {transaction.quantidade > 1 ? 'unidades' : 'unidade'}
                      </TransactionDetails>
                    </TransactionInfo>
                    
                    <ValueInfo>
                      <TotalValue type={transaction.tipo}>
                        {getTransactionSign(transaction.tipo)} {formatCurrency(transaction.valor_total)}
                      </TotalValue>
                      <UnitValue>
                        {formatCurrency(transaction.valor_unitario)} por unidade
                      </UnitValue>
                    </ValueInfo>
                    
                    <ActionButton
                      onClick={() => openModal(transaction)}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </ActionButton>
                    
                    <ActionButton
                      onClick={() => handleDelete(transaction)}
                      title="Excluir"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={18} />
                    </ActionButton>
                  </TransactionItem>
                ))}
              </TransactionsList>
            )}
          </CardContent>
        </Card>

        {showModal && (
          <Modal onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <ModalContent>
              <h2>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h2>
              
              <form onSubmit={handleSubmit}>
                <FormField>
                  <Label htmlFor="asset_id">Ativo *</Label>
                  <Select
                    id="asset_id"
                    value={formData.asset_id}
                    onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione um ativo</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.nome}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField>
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  >
                    <option value="compra">Compra</option>
                    <option value="venda">Venda</option>
                    <option value="dividendos">Dividendos</option>
                  </Select>
                </FormField>

                <FormField>
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="valor_unitario">Valor Unitário *</Label>
                  <Input
                    id="valor_unitario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_unitario}
                    onChange={(e) => setFormData({ ...formData, valor_unitario: e.target.value })}
                    required
                  />
                  
                  {formData.quantidade && formData.valor_unitario && (
                    <CalculatedTotal>
                      Valor Total: {formatCurrency(calculateTotal())}
                    </CalculatedTotal>
                  )}
                </FormField>

                <ModalActions>
                  <Button type="button" onClick={closeModal} style={{ background: '#6b7280' }}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTransaction ? 'Salvar' : 'Criar'}
                  </Button>
                </ModalActions>
              </form>
            </ModalContent>
          </Modal>
        )}

        <ConfirmModal
          show={confirmModal.show}
          title="Confirmar Exclusão"
          message={`Deseja excluir esta transação de ${confirmModal.transaction?.asset_name}?`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmModal({ show: false, transaction: null })}
        />
      </Container>
    </Section>
  );
};