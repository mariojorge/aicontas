import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Tag, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Container, Section, Grid } from '../components/Layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { ConfirmModal } from '../components/UI/Modal';
import { categoryService } from '../services/api';

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

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  opacity: ${props => props.active ? 1 : 0.6};
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CategoryName = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const CategoryType = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => 
    props.type === 'receita' ? props.theme.colors.success + '20' :
    props.type === 'despesa' ? props.theme.colors.error + '20' :
    props.theme.colors.text + '10'
  };
  color: ${props => 
    props.type === 'receita' ? props.theme.colors.success :
    props.type === 'despesa' ? props.theme.colors.error :
    props.theme.colors.textSecondary
  };
`;

const CategoryActions = styled.div`
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
  grid-template-columns: 1fr auto auto;
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

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, receita, despesa
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'despesa'
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    if (filter === 'all') {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(categories.filter(cat => cat.tipo === filter));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
      } else {
        await categoryService.create(formData);
      }
      
      setFormData({ nome: '', tipo: 'despesa' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nome: category.nome,
      tipo: category.tipo
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ nome: '', tipo: 'despesa' });
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await categoryService.delete(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert(error.response?.data?.message || 'Erro ao excluir categoria');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await categoryService.toggleActive(category.id);
      fetchCategories();
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
    }
  };

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Carregando categorias...
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
          Gerenciar Categorias
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} />
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormContainer>
              <form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <Label>Nome da Categoria</Label>
                    <Input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Alimentação, Trabalho..."
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Tipo</Label>
                    <Select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      required
                    >
                      <option value="despesa">Despesa</option>
                      <option value="receita">Receita</option>
                    </Select>
                  </FormGroup>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button type="submit" variant="primary">
                      {editingCategory ? 'Atualizar' : 'Salvar'}
                    </Button>
                    {editingCategory && (
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

        <FilterContainer style={{ marginTop: '2rem' }} >
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            Todas
          </FilterButton>
          <FilterButton 
            active={filter === 'receita'} 
            onClick={() => setFilter('receita')}
          >
            Receitas
          </FilterButton>
          <FilterButton 
            active={filter === 'despesa'} 
            onClick={() => setFilter('despesa')}
          >
            Despesas
          </FilterButton>
        </FilterContainer>

        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={20} />
              Categorias ({filteredCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                {filter === 'all' ? 'Nenhuma categoria encontrada' : `Nenhuma categoria de ${filter} encontrada`}
              </div>
            ) : (
              <CategoryList>
                {filteredCategories.map(category => (
                  <CategoryItem key={category.id} active={category.ativo}>
                    <CategoryInfo>
                      <CategoryName>{category.nome}</CategoryName>
                      <CategoryType type={category.tipo}>
                        {category.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </CategoryType>
                      {category.usage_count > 0 && (
                        <CategoryType type="neutral">
                          {category.usage_count} lançamento{category.usage_count !== 1 ? 's' : ''}
                        </CategoryType>
                      )}
                    </CategoryInfo>
                    
                    <CategoryActions>
                      <ActionButton onClick={() => handleToggleActive(category)} className={category.ativo ? '' : 'success'}>
                        {category.ativo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </ActionButton>
                      <ActionButton onClick={() => handleEdit(category)}>
                        <Edit2 size={16} />
                      </ActionButton>
                      {category.usage_count === 0 && (
                        <ActionButton onClick={() => handleDelete(category)} className="danger">
                          <Trash2 size={16} />
                        </ActionButton>
                      )}
                    </CategoryActions>
                  </CategoryItem>
                ))}
              </CategoryList>
            )}
          </CardContent>
        </Card>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
          }}
          title="Excluir Categoria"
          description={`Tem certeza que deseja excluir a categoria "${categoryToDelete?.nome}"? Esta ação não pode ser desfeita.`}
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