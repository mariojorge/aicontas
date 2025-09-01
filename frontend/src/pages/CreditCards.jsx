import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CreditCard as CreditCardIcon, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { Container, Section, Grid } from '../components/Layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ConfirmModal } from '../components/UI/Modal';
import { creditCardService } from '../services/api';

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
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.backgroundSecondary};
  }
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const CardItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  opacity: ${props => props.active ? 1 : 0.6};
`;

const CardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const CardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const CardName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
`;

const CardBrand = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.theme.colors.primary + '20'};
  color: ${props => props.theme.colors.primary};
`;

const BestDay = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: transparent;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
  
  &.danger:hover {
    background: ${props => props.theme.colors.error + '20'};
    color: ${props => props.theme.colors.error};
    border-color: ${props => props.theme.colors.error};
  }
  
  &.success:hover {
    background: ${props => props.theme.colors.success + '20'};
    color: ${props => props.theme.colors.success};
    border-color: ${props => props.theme.colors.success};
  }
`;

const FormContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FormGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
  grid-template-columns: 1fr 1fr auto auto;
  align-items: end;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  min-height: 44px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  min-height: 44px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const CreditCards = () => {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [editingCard, setEditingCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    bandeira: 'Visa',
    melhor_dia_compra: 1
  });

  const bandeiras = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outros'];

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const response = await creditCardService.getAll();
      setCards(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCards = () => {
    if (filter === 'all') {
      setFilteredCards(cards);
    } else if (filter === 'active') {
      setFilteredCards(cards.filter(card => card.ativo));
    } else {
      setFilteredCards(cards.filter(card => !card.ativo));
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [cards, filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        melhor_dia_compra: parseInt(formData.melhor_dia_compra)
      };

      if (editingCard) {
        await creditCardService.update(editingCard.id, dataToSubmit);
      } else {
        await creditCardService.create(dataToSubmit);
      }
      
      setFormData({ nome: '', bandeira: 'Visa', melhor_dia_compra: 1 });
      setEditingCard(null);
      fetchCards();
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      nome: card.nome,
      bandeira: card.bandeira,
      melhor_dia_compra: card.melhor_dia_compra
    });
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setFormData({ nome: '', bandeira: 'Visa', melhor_dia_compra: 1 });
  };

  const handleDelete = (card) => {
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await creditCardService.delete(cardToDelete.id);
      setShowDeleteModal(false);
      setCardToDelete(null);
      fetchCards();
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      alert(error.response?.data?.message || 'Erro ao excluir cartão');
    }
  };

  const handleToggleActive = async (card) => {
    try {
      await creditCardService.toggleActive(card.id);
      fetchCards();
    } catch (error) {
      console.error('Erro ao alterar status do cartão:', error);
    }
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Carregando cartões...
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
          Cartões de Crédito
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormContainer>
              <form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <Label>Nome do Cartão</Label>
                    <Input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Cartão Principal"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Bandeira</Label>
                    <Select
                      value={formData.bandeira}
                      onChange={(e) => setFormData({...formData, bandeira: e.target.value})}
                      required
                    >
                      {bandeiras.map(bandeira => (
                        <option key={bandeira} value={bandeira}>
                          {bandeira}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Melhor Dia para Compra</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.melhor_dia_compra}
                      onChange={(e) => setFormData({...formData, melhor_dia_compra: e.target.value})}
                      required
                    />
                  </FormGroup>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button type="submit" variant="primary">
                      {editingCard ? 'Atualizar' : 'Salvar'}
                    </Button>
                    {editingCard && (
                      <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </FormGrid>
              </form>
            </FormContainer>
          </CardContent>
        </Card>

        <FilterContainer style={{ marginTop: '2rem' }}>
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            Todos
          </FilterButton>
          <FilterButton 
            active={filter === 'active'} 
            onClick={() => setFilter('active')}
          >
            Ativos
          </FilterButton>
          <FilterButton 
            active={filter === 'inactive'} 
            onClick={() => setFilter('inactive')}
          >
            Inativos
          </FilterButton>
        </FilterContainer>

        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCardIcon size={20} />
              Cartões ({filteredCards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                {filter === 'all' ? 'Nenhum cartão encontrado' : `Nenhum cartão ${filter === 'active' ? 'ativo' : 'inativo'} encontrado`}
              </div>
            ) : (
              <CardList>
                {filteredCards.map(card => (
                  <CardItem key={card.id} active={card.ativo}>
                    <CardInfo>
                      <CreditCardIcon size={32} style={{ color: card.ativo ? '#3b82f6' : '#9ca3af' }} />
                      <CardDetails>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <CardName>{card.nome}</CardName>
                          <CardBrand>{card.bandeira}</CardBrand>
                        </div>
                        <BestDay>
                          <Calendar size={14} />
                          Melhor dia: {card.melhor_dia_compra}
                        </BestDay>
                      </CardDetails>
                    </CardInfo>
                    
                    <CardActions>
                      <ActionButton onClick={() => handleToggleActive(card)} className={card.ativo ? '' : 'success'}>
                        {card.ativo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </ActionButton>
                      <ActionButton onClick={() => handleEdit(card)}>
                        <Edit2 size={16} />
                      </ActionButton>
                      <ActionButton onClick={() => handleDelete(card)} className="danger">
                        <Trash2 size={16} />
                      </ActionButton>
                    </CardActions>
                  </CardItem>
                ))}
              </CardList>
            )}
          </CardContent>
        </Card>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCardToDelete(null);
          }}
          title="Excluir Cartão"
          description={`Tem certeza que deseja excluir o cartão "${cardToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        >
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowDeleteModal(false)}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              style={{ flex: 1 }}
            >
              Excluir
            </Button>
          </div>
        </ConfirmModal>
      </Container>
    </Section>
  );
};