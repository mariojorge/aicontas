import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card';
import { Button } from '../UI/Button';
import { ConfirmModal } from '../UI/Modal';
import { applyCurrencyMask, handleCurrencyKeyDown, parseCurrency, formatCurrency } from '../../utils/maskUtils';
import { categoryService, creditCardService } from '../../services/api';

export const SimpleExpenseForm = ({ onSubmit, initialData, isLoading }) => {
  const [repetir, setRepetir] = useState(initialData?.repetir || 'nao');
  const [parcelas, setParcelas] = useState(initialData?.parcelas || 2);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [creditCards, setCreditCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const valorInputRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentRepetir = formData.get('repetir');
    
    // Parse do valor com máscara
    const valorFormatado = formData.get('valor');
    const valorNumerico = parseCurrency(valorFormatado);
    
    const cartaoId = formData.get('cartao_credito_id');
    
    const data = {
      descricao: formData.get('descricao'),
      valor: valorNumerico,
      situacao: 'aberto',
      categoria: formData.get('categoria'),
      data_pagamento: formData.get('data_pagamento'),
      repetir: currentRepetir,
      parcelas: currentRepetir === 'parcelado' ? parseInt(formData.get('parcelas')) : 1,
      parcela_atual: 1,
      cartao_credito_id: cartaoId && cartaoId !== '' ? parseInt(cartaoId) : null
    };
    
    // Se é edição e tem recorrência, perguntar se atualiza todos
    if (initialData && initialData.repetir && initialData.repetir !== 'nao') {
      console.log('🔄 Detectada edição com recorrência:', initialData.repetir);
      setPendingData(data);
      setShowUpdateModal(true);
      return;
    }
    
    onSubmit(data);
  };
  
  const handleUpdateAll = () => {
    console.log('✅ Atualizando todos os lançamentos abertos');
    onSubmit({ ...pendingData, updateAll: true });
    setShowUpdateModal(false);
    setPendingData(null);
  };
  
  const handleUpdateCurrent = () => {
    console.log('✅ Atualizando apenas este lançamento');
    onSubmit({ ...pendingData, updateAll: false });
    setShowUpdateModal(false);
    setPendingData(null);
  };

  const handleRepetirChange = (e) => {
    setRepetir(e.target.value);
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getAll({ tipo: 'despesa', ativo: 1 });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCreditCards = async () => {
    try {
      setLoadingCards(true);
      const response = await creditCardService.getAll({ ativo: 1 });
      setCreditCards(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCreditCards();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar Despesa' : 'Nova Despesa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <label>Descrição *</label>
              <input
                name="descricao"
                required
                placeholder="Ex: Supermercado"
                defaultValue={initialData?.descricao}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  minHeight: '44px'
                }}
              />
            </div>
            
            <div>
              <label>Valor *</label>
              <input
                ref={valorInputRef}
                name="valor"
                type="text"
                required
                placeholder="R$ 0,00"
                defaultValue={initialData?.valor ? formatCurrency(initialData.valor * 100) : ''}
                onInput={applyCurrencyMask}
                onKeyDown={handleCurrencyKeyDown}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  minHeight: '44px'
                }}
              />
            </div>
            
            <div>
              <label>Categoria *</label>
              <select
                name="categoria"
                required
                defaultValue={initialData?.categoria}
                disabled={loadingCategories}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  minHeight: '44px'
                }}
              >
                <option value="">
                  {loadingCategories ? 'Carregando...' : 'Selecione...'}
                </option>
                {categories.map(category => (
                  <option key={category.id} value={category.nome}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label>Cartão de Crédito (Opcional)</label>
              <select
                name="cartao_credito_id"
                defaultValue={initialData?.cartao_credito_id || ''}
                disabled={loadingCards}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  minHeight: '44px'
                }}
              >
                <option value="">
                  {loadingCards ? 'Carregando...' : 'Nenhum (À vista)'}
                </option>
                {creditCards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.nome} - {card.bandeira}
                  </option>
                ))}
              </select>
            </div>
            
            {!initialData && (
              <div>
                <label>Data de Pagamento *</label>
                <input
                  name="data_pagamento"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    minHeight: '44px'
                  }}
                />
              </div>
            )}
            
            {initialData && (
              <input
                name="data_pagamento"
                type="hidden"
                value={initialData.data_pagamento}
              />
            )}
            
            {!initialData && (
              <div>
                <label>Recorrência</label>
                <select
                  name="repetir"
                  value={repetir}
                  onChange={handleRepetirChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    minHeight: '44px'
                  }}
                >
                  <option value="nao">Sem recorrência</option>
                  <option value="fixo">Conta fixa (mensal)</option>
                  <option value="parcelado">Parcelado</option>
                </select>
              </div>
            )}
            
            {initialData && (
              <input
                name="repetir"
                type="hidden"
                value={initialData.repetir || 'nao'}
              />
            )}
            
            {!initialData && repetir === 'parcelado' && (
              <div>
                <label>Número de Parcelas *</label>
                <input
                  name="parcelas"
                  type="number"
                  min="2"
                  max="60"
                  defaultValue={parcelas}
                  onChange={(e) => setParcelas(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    minHeight: '44px'
                  }}
                />
              </div>
            )}
            
            {initialData && (
              <input
                name="parcelas"
                type="hidden"
                value={initialData.parcelas || 1}
              />
            )}
            
            {initialData && (
              <input
                name="parcela_atual"
                type="hidden"
                value={initialData.parcela_atual || 1}
              />
            )}
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Salvar')}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setPendingData(null);
        }}
        title="Atualizar Recorrência"
        description="Esta despesa faz parte de um grupo com recorrência. Como deseja proceder?"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          <Button 
            variant="primary" 
            onClick={handleUpdateAll}
            style={{ width: '100%' }}
          >
            Atualizar todos os lançamentos abertos
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleUpdateCurrent}
            style={{ width: '100%' }}
          >
            Atualizar apenas este lançamento
          </Button>
        </div>
      </ConfirmModal>
    </Card>
  );
};