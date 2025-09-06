import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, RefreshCw } from 'lucide-react';
import { Container, Section, Grid } from '../components/Layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ConfirmModal } from '../components/UI/Modal';
import { investmentAssetService, investmentTransactionService, quotationService } from '../services/api';
import { PrivateValue } from '../components/UI/PrivateValue';

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

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  padding-left: 2.5rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  width: 1rem;
  height: 1rem;
`;

const SpinningIcon = styled(RefreshCw)`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  animation: ${props => props.isSpinning ? 'spin 1s linear infinite' : 'none'};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${props => props.theme.spacing.md};
  background: white;
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.sm};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  
  &.text-right {
    text-align: right;
  }
  
  &.actions {
    width: 120px;
    text-align: center;
  }
`;

const Tr = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.backgroundTertiary};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const Td = styled.td`
  padding: ${props => props.theme.spacing.md};
  vertical-align: middle;
  font-size: 0.875rem;
  
  &.text-right {
    text-align: right;
  }
  
  &.actions {
    text-align: center;
  }
`;

const AssetNameCell = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2px;
`;

const AssetDetails = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ValueCell = styled.span`
  font-weight: 500;
  color: ${props => {
    if (props.value > 0) return props.theme.colors.success;
    if (props.value < 0) return props.theme.colors.error;
    return props.theme.colors.text;
  }};
`;

const MobileCard = styled.div`
  display: none;
  background: white;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: block;
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const MobileCardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
  
  > div:nth-child(n+5) {
    grid-column: 1 / -1;
  }
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
`;

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.active ? props.theme.colors.success : props.theme.colors.textSecondary};
  color: white;
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

const Textarea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.lg};
`;

export const InvestmentAssets = () => {
  const [assets, setAssets] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingQuotes, setIsUpdatingQuotes] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, asset: null });
  
  const [formData, setFormData] = useState({
    nome: '',
    ticker: '',
    tipo: 'acao',
    setor: '',
    descricao: '',
    ativo: true
  });

  useEffect(() => {
    fetchAssets();
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    let filtered = getCombinedData();

    // Filtro por tipo
    if (filter !== 'all') {
      filtered = filtered.filter(asset => asset.tipo === filter);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.setor && asset.setor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredAssets(filtered);
  }, [assets, portfolioData, filter, searchTerm]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await investmentAssetService.getAll();
      setAssets(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPortfolioData = async () => {
    try {
      const response = await investmentTransactionService.getPortfolio();
      setPortfolioData(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de portfolio:', error);
    }
  };

  const openModal = (asset = null) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        nome: asset.nome,
        ticker: asset.ticker || '',
        tipo: asset.tipo,
        setor: asset.setor || '',
        descricao: asset.descricao || '',
        ativo: asset.ativo
      });
    } else {
      setEditingAsset(null);
      setFormData({
        nome: '',
        ticker: '',
        tipo: 'acao',
        setor: '',
        descricao: '',
        ativo: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAsset(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAsset) {
        await investmentAssetService.update(editingAsset.id, formData);
      } else {
        await investmentAssetService.create(formData);
      }
      
      closeModal();
      fetchAssets();
      fetchPortfolioData();
    } catch (error) {
      console.error('Erro ao salvar ativo:', error);
    }
  };

  const handleDelete = async (asset) => {
    setConfirmModal({ show: true, asset });
  };

  const confirmDelete = async () => {
    try {
      await investmentAssetService.delete(confirmModal.asset.id);
      setConfirmModal({ show: false, asset: null });
      fetchAssets();
      fetchPortfolioData();
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
    }
  };

  const handleToggleActive = async (asset) => {
    try {
      await investmentAssetService.toggleActive(asset.id);
      fetchAssets();
      fetchPortfolioData();
    } catch (error) {
      console.error('Erro ao alterar status do ativo:', error);
    }
  };

  const handleUpdateQuotes = async () => {
    setIsUpdatingQuotes(true);
    try {
      console.log('Iniciando atualização manual de cotações...');
      const result = await quotationService.updateAll();
      console.log('Resultado da atualização:', result);
      
      // Atualizar dados após sucesso
      await fetchAssets();
      await fetchPortfolioData();
      
      // Feedback visual de sucesso (pode adicionar toast aqui no futuro)
      alert(`Cotações atualizadas: ${result.updated || 0} ativos atualizados`);
    } catch (error) {
      console.error('Erro ao atualizar cotações:', error);
      alert('Erro ao atualizar cotações. Tente novamente.');
    } finally {
      setIsUpdatingQuotes(false);
    }
  };

  const getTypeLabel = (tipo) => {
    const types = {
      acao: 'Ações',
      fii: 'FIIs',
      fundo: 'Fundos',
      renda_fixa: 'Renda Fixa',
      etf: 'ETFs'
    };
    return types[tipo] || tipo;
  };

  const getCombinedData = () => {
    return assets.map(asset => {
      const portfolio = portfolioData.find(p => p.id === asset.id) || {};
      return {
        ...asset,
        quantidade_atual: portfolio.quantidade_atual || 0,
        preco_medio: portfolio.preco_medio || 0,
        valor_investido: portfolio.valor_investido || 0,
        dividendos_recebidos: portfolio.dividendos_recebidos || 0,
        total_compras: portfolio.total_compras || 0,
        total_vendas: portfolio.total_vendas || 0
      };
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value || 0);
  };


  const combinedData = getCombinedData();

  return (
    <Section>
      <Container>
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={24} />
              Ativos de Investimento
            </CardTitle>
            <Button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} />
              Novo Ativo
            </Button>
          </CardHeader>
          
          <CardContent>
            <FilterContainer>
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                Todos
              </FilterButton>
              <FilterButton
                active={filter === 'acao'}
                onClick={() => setFilter('acao')}
              >
                Ações
              </FilterButton>
              <FilterButton
                active={filter === 'fii'}
                onClick={() => setFilter('fii')}
              >
                FIIs
              </FilterButton>
              <FilterButton
                active={filter === 'fundo'}
                onClick={() => setFilter('fundo')}
              >
                Fundos
              </FilterButton>
              <FilterButton
                active={filter === 'renda_fixa'}
                onClick={() => setFilter('renda_fixa')}
              >
                Renda Fixa
              </FilterButton>
              <FilterButton
                active={filter === 'etf'}
                onClick={() => setFilter('etf')}
              >
                ETFs
              </FilterButton>
              
              <SearchContainer>
                <SearchIcon />
                <SearchInput
                  type="text"
                  placeholder="Buscar ativos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchContainer>
              
              <Button
                onClick={handleUpdateQuotes}
                disabled={isUpdatingQuotes}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  minWidth: '160px',
                  justifyContent: 'center'
                }}
              >
                <SpinningIcon size={16} isSpinning={isUpdatingQuotes} />
                {isUpdatingQuotes ? 'Atualizando...' : 'Atualizar Cotações'}
              </Button>
            </FilterContainer>

            {isLoading ? (
              <EmptyState>Carregando ativos...</EmptyState>
            ) : filteredAssets.length === 0 ? (
              <EmptyState>
                <TrendingUp size={48} style={{ marginBottom: '1rem' }} />
                <p>Nenhum ativo de investimento encontrado</p>
              </EmptyState>
            ) : (
              <>
                {/* Tabela para Desktop */}
                <Table>
                  <thead>
                    <tr>
                      <Th>Ativo</Th>
                      <Th className="text-right">Qtd. Atual</Th>
                      <Th className="text-right">Preço Médio</Th>
                      <Th className="text-right">Preço Atual</Th>
                      <Th className="text-right">Patrimônio</Th>
                      <Th className="text-right">Variação do Dia</Th>
                      <Th className="text-right">Variação Total</Th>
                      <Th className="text-right">Valor Investido</Th>
                      <Th className="text-right">Dividendos</Th>
                      <Th>Status</Th>
                      <Th className="actions">Ações</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <Tr key={asset.id}>
                        <Td>
                          <AssetNameCell>{asset.nome}</AssetNameCell>
                          <AssetDetails>
                            {getTypeLabel(asset.tipo)} 
                            {asset.setor && ` • ${asset.setor}`}
                          </AssetDetails>
                        </Td>
                        <Td className="text-right">
                          {formatNumber(asset.quantidade_atual, 6)}
                        </Td>
                        <Td className="text-right">
                          <ValueCell value={asset.preco_medio}>
                            {formatCurrency(asset.preco_medio)}
                          </ValueCell>
                        </Td>
                        <Td className="text-right">
                          {asset.preco_atual ? (
                            <ValueCell value={asset.preco_atual}>
                              {formatCurrency(asset.preco_atual)}
                            </ValueCell>
                          ) : (
                            <span style={{color: '#9ca3af', fontSize: '0.75rem'}}>
                              {asset.ticker ? 'Sem cotação' : 'Sem ticker'}
                            </span>
                          )}
                        </Td>
                        <Td className="text-right">
                          {asset.preco_atual && asset.quantidade_atual ? (
                            <ValueCell value={asset.preco_atual * asset.quantidade_atual}>
                              <PrivateValue>
                                {formatCurrency(asset.preco_atual * asset.quantidade_atual)}
                              </PrivateValue>
                            </ValueCell>
                          ) : (
                            <span style={{color: '#9ca3af', fontSize: '0.75rem'}}>−</span>
                          )}
                        </Td>
                        <Td className="text-right">
                          {asset.variacao_percentual !== null && asset.variacao_percentual !== undefined ? (
                            <ValueCell value={asset.variacao_percentual}>
                              {asset.variacao_percentual > 0 ? '▲' : asset.variacao_percentual < 0 ? '▼' : '−'} {asset.variacao_percentual.toFixed(2)}%
                            </ValueCell>
                          ) : (
                            <span style={{color: '#9ca3af', fontSize: '0.75rem'}}>−</span>
                          )}
                        </Td>
                        <Td className="text-right">
                          {asset.preco_atual && asset.quantidade_atual && asset.valor_investido ? (() => {
                            const patrimonio = asset.preco_atual * asset.quantidade_atual;
                            const variacaoTotal = patrimonio - asset.valor_investido;
                            const variacaoPercentual = (variacaoTotal / asset.valor_investido) * 100;
                            const symbol = variacaoPercentual > 0 ? '▲' : variacaoPercentual < 0 ? '▼' : '−';
                            return (
                              <ValueCell value={variacaoPercentual}>
                                {symbol} <PrivateValue>{formatCurrency(variacaoTotal)}</PrivateValue> ({variacaoPercentual.toFixed(2)}%)
                              </ValueCell>
                            );
                          })() : (
                            <span style={{color: '#9ca3af', fontSize: '0.75rem'}}>−</span>
                          )}
                        </Td>
                        <Td className="text-right">
                          <ValueCell value={asset.valor_investido}>
                            <PrivateValue>
                              {formatCurrency(asset.valor_investido)}
                            </PrivateValue>
                          </ValueCell>
                        </Td>
                        <Td className="text-right">
                          <ValueCell value={asset.dividendos_recebidos}>
                            <PrivateValue>
                              {formatCurrency(asset.dividendos_recebidos)}
                            </PrivateValue>
                          </ValueCell>
                        </Td>
                        <Td>
                          <StatusBadge active={asset.ativo}>
                            {asset.ativo ? 'Ativo' : 'Inativo'}
                          </StatusBadge>
                        </Td>
                        <Td className="actions">
                          <ActionButton
                            onClick={() => handleToggleActive(asset)}
                            title={asset.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {asset.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </ActionButton>
                          <ActionButton
                            onClick={() => openModal(asset)}
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleDelete(asset)}
                            title="Excluir"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={18} />
                          </ActionButton>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>

                {/* Cards para Mobile */}
                {filteredAssets.map((asset) => (
                  <MobileCard key={`mobile-${asset.id}`}>
                    <MobileCardHeader>
                      <div>
                        <AssetNameCell>{asset.nome}</AssetNameCell>
                        <AssetDetails>
                          {getTypeLabel(asset.tipo)}
                          {asset.setor && ` • ${asset.setor}`}
                        </AssetDetails>
                      </div>
                      <StatusBadge active={asset.ativo}>
                        {asset.ativo ? 'Ativo' : 'Inativo'}
                      </StatusBadge>
                    </MobileCardHeader>
                    
                    <MobileCardContent>
                      <div>
                        <strong>Qtd. Atual:</strong><br />
                        {formatNumber(asset.quantidade_atual, 6)}
                      </div>
                      <div>
                        <strong>Preço Médio:</strong><br />
                        <ValueCell value={asset.preco_medio}>
                          {formatCurrency(asset.preco_medio)}
                        </ValueCell>
                      </div>
                      <div>
                        <strong>Preço Atual:</strong><br />
                        {asset.preco_atual ? (
                          <ValueCell value={asset.preco_atual}>
                            {formatCurrency(asset.preco_atual)}
                          </ValueCell>
                        ) : (
                          <span style={{color: '#9ca3af', fontSize: '0.875rem'}}>
                            {asset.ticker ? 'Sem cotação' : 'Sem ticker'}
                          </span>
                        )}
                      </div>
                      <div>
                        <strong>Patrimônio:</strong><br />
                        {asset.preco_atual && asset.quantidade_atual ? (
                          <ValueCell value={asset.preco_atual * asset.quantidade_atual}>
                            <PrivateValue>
                              {formatCurrency(asset.preco_atual * asset.quantidade_atual)}
                            </PrivateValue>
                          </ValueCell>
                        ) : (
                          <span style={{color: '#9ca3af', fontSize: '0.875rem'}}>−</span>
                        )}
                      </div>
                      <div>
                        <strong>Variação do Dia:</strong><br />
                        {asset.variacao_percentual !== null && asset.variacao_percentual !== undefined ? (
                          <ValueCell value={asset.variacao_percentual}>
                            {asset.variacao_percentual > 0 ? '▲' : asset.variacao_percentual < 0 ? '▼' : '−'} {asset.variacao_percentual.toFixed(2)}%
                          </ValueCell>
                        ) : (
                          <span style={{color: '#9ca3af', fontSize: '0.875rem'}}>−</span>
                        )}
                      </div>
                      <div>
                        <strong>Variação Total:</strong><br />
                        {asset.preco_atual && asset.quantidade_atual && asset.valor_investido ? (() => {
                          const patrimonio = asset.preco_atual * asset.quantidade_atual;
                          const variacaoTotal = patrimonio - asset.valor_investido;
                          const variacaoPercentual = (variacaoTotal / asset.valor_investido) * 100;
                          const symbol = variacaoPercentual > 0 ? '▲' : variacaoPercentual < 0 ? '▼' : '−';
                          return (
                            <ValueCell value={variacaoPercentual}>
                              {symbol} <PrivateValue>{formatCurrency(variacaoTotal)}</PrivateValue> ({variacaoPercentual.toFixed(2)}%)
                            </ValueCell>
                          );
                        })() : (
                          <span style={{color: '#9ca3af', fontSize: '0.875rem'}}>−</span>
                        )}
                      </div>
                      <div>
                        <strong>Valor Investido:</strong><br />
                        <ValueCell value={asset.valor_investido}>
                          <PrivateValue>
                            {formatCurrency(asset.valor_investido)}
                          </PrivateValue>
                        </ValueCell>
                      </div>
                      <div>
                        <strong>Dividendos:</strong><br />
                        <ValueCell value={asset.dividendos_recebidos}>
                          <PrivateValue>
                            {formatCurrency(asset.dividendos_recebidos)}
                          </PrivateValue>
                        </ValueCell>
                      </div>
                    </MobileCardContent>
                    
                    <MobileCardActions>
                      <ActionButton
                        onClick={() => handleToggleActive(asset)}
                        title={asset.ativo ? 'Desativar' : 'Ativar'}
                      >
                        {asset.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </ActionButton>
                      <ActionButton
                        onClick={() => openModal(asset)}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDelete(asset)}
                        title="Excluir"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </ActionButton>
                    </MobileCardActions>
                  </MobileCard>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {showModal && (
          <Modal onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <ModalContent>
              <h2>{editingAsset ? 'Editar Ativo' : 'Novo Ativo'}</h2>
              
              <form onSubmit={handleSubmit}>
                <FormField>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="ticker">
                    Ticker 
                    {(formData.tipo === 'acao' || formData.tipo === 'fii' || formData.tipo === 'etf') && ' *'}
                  </Label>
                  <Input
                    id="ticker"
                    type="text"
                    placeholder="Ex: PETR4, IVVB11, VISC11"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    required={formData.tipo === 'acao' || formData.tipo === 'fii' || formData.tipo === 'etf'}
                    style={{
                      textTransform: 'uppercase'
                    }}
                  />
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    {(formData.tipo === 'acao' || formData.tipo === 'fii' || formData.tipo === 'etf') 
                      ? 'Código necessário para cotações automáticas (ex: PETR4, IVVB11)'
                      : 'Deixe em branco para Renda Fixa e Fundos'
                    }
                  </div>
                </FormField>

                <FormField>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  >
                    <option value="acao">Ações</option>
                    <option value="fii">FIIs</option>
                    <option value="fundo">Fundos</option>
                    <option value="renda_fixa">Renda Fixa</option>
                    <option value="etf">ETFs</option>
                  </Select>
                </FormField>

                <FormField>
                  <Label htmlFor="setor">Setor</Label>
                  <Input
                    id="setor"
                    type="text"
                    value={formData.setor}
                    onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                  />
                </FormField>

                <FormField>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </FormField>

                <ModalActions>
                  <Button type="button" onClick={closeModal} style={{ background: '#6b7280' }}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingAsset ? 'Salvar' : 'Criar'}
                  </Button>
                </ModalActions>
              </form>
            </ModalContent>
          </Modal>
        )}

        <ConfirmModal
          isOpen={confirmModal.show}
          onClose={() => setConfirmModal({ show: false, asset: null })}
          title="Confirmar Exclusão"
          description={`Deseja excluir o ativo "${confirmModal.asset?.nome}"?`}
          onConfirm={confirmDelete}
          confirmText="Excluir"
          cancelText="Cancelar"
          confirmVariant="primary"
        />
      </Container>
    </Section>
  );
};