import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { Container, Section, Grid } from '../components/Layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ConfirmModal } from '../components/UI/Modal';
import { investmentAssetService } from '../services/api';

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

const AssetsList = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
`;

const AssetItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto auto;
  align-items: center;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: white;
  gap: ${props => props.theme.spacing.sm};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.sm};
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const AssetInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const AssetName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const AssetType = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  font-weight: 500;
`;

const AssetSetor = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
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
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, asset: null });
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'acao',
    setor: '',
    descricao: '',
    ativo: true
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    let filtered = assets;

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
  }, [assets, filter, searchTerm]);

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

  const openModal = (asset = null) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        nome: asset.nome,
        tipo: asset.tipo,
        setor: asset.setor || '',
        descricao: asset.descricao || '',
        ativo: asset.ativo
      });
    } else {
      setEditingAsset(null);
      setFormData({
        nome: '',
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
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
    }
  };

  const handleToggleActive = async (asset) => {
    try {
      await investmentAssetService.toggleActive(asset.id);
      fetchAssets();
    } catch (error) {
      console.error('Erro ao alterar status do ativo:', error);
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
            </FilterContainer>

            {isLoading ? (
              <EmptyState>Carregando ativos...</EmptyState>
            ) : filteredAssets.length === 0 ? (
              <EmptyState>
                <TrendingUp size={48} style={{ marginBottom: '1rem' }} />
                <p>Nenhum ativo de investimento encontrado</p>
              </EmptyState>
            ) : (
              <AssetsList>
                {filteredAssets.map((asset) => (
                  <AssetItem key={asset.id}>
                    <AssetInfo>
                      <AssetName>{asset.nome}</AssetName>
                      <AssetType>{getTypeLabel(asset.tipo)}</AssetType>
                      {asset.setor && <AssetSetor>{asset.setor}</AssetSetor>}
                    </AssetInfo>
                    
                    <StatusBadge active={asset.ativo}>
                      {asset.ativo ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                    
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
                  </AssetItem>
                ))}
              </AssetsList>
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
          show={confirmModal.show}
          title="Confirmar Exclusão"
          message={`Deseja excluir o ativo "${confirmModal.asset?.nome}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmModal({ show: false, asset: null })}
        />
      </Container>
    </Section>
  );
};