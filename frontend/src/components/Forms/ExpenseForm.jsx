import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import { Input } from '../UI/Input.jsx';
import { Button } from '../UI/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card';
import { Flex, Grid } from '../Layout/Container';

const FormGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const schema = yup.object().shape({
  descricao: yup.string().required('Descrição é obrigatória').min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  valor: yup.string().required('Valor é obrigatório'),
  situacao: yup.string().oneOf(['pago', 'aberto'], 'Situação deve ser "pago" ou "aberto"').required('Situação é obrigatória'),
  categoria: yup.string().required('Categoria é obrigatória'),
  data_pagamento: yup.string().required('Data de pagamento é obrigatória'),
  repetir: yup.string().oneOf(['nao', 'parcelado', 'fixo'], 'Repetir deve ser "não", "parcelado" ou "fixo"'),
  parcelas: yup.number().integer().positive().when('repetir', {
    is: 'parcelado',
    then: () => yup.number().required('Número de parcelas é obrigatório quando repetir é "parcelado"').min(2, 'Deve ter pelo menos 2 parcelas'),
    otherwise: () => yup.number()
  }),
});

const categoriaOptions = [
  { value: 'Alimentação', label: 'Alimentação' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Moradia', label: 'Moradia' },
  { value: 'Saúde', label: 'Saúde' },
  { value: 'Educação', label: 'Educação' },
  { value: 'Lazer', label: 'Lazer' },
  { value: 'Fixas', label: 'Contas Fixas' },
  { value: 'Outros', label: 'Outros' },
];

const situacaoOptions = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'pago', label: 'Pago' },
];

const repetirOptions = [
  { value: 'nao', label: 'Não' },
  { value: 'parcelado', label: 'Parcelado' },
  { value: 'fixo', label: 'Fixo' },
];

export const ExpenseForm = ({ onSubmit, initialData, isLoading }) => {
  const [showParcelas, setShowParcelas] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      repetir: 'nao',
      parcelas: 1,
    }
  });

  const repetir = watch('repetir');

  useEffect(() => {
    setShowParcelas(repetir === 'parcelado');
    if (repetir !== 'parcelado') {
      setValue('parcelas', 1);
    }
  }, [repetir, setValue]);

  const formatCurrency = (value) => {
    return value.replace(/\D/g, '').replace(/(\d)(\d{2})$/, '$1,$2');
  };

  const handleValueChange = (e) => {
    const formatted = formatCurrency(e.target.value);
    e.target.value = formatted;
  };

  const onFormSubmit = (data) => {
    // Converter valor de string para number
    const valorNumerico = parseFloat(data.valor.replace(',', '.'));
    
    onSubmit({
      ...data,
      valor: valorNumerico,
      data_pagamento: data.data_pagamento,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar Despesa' : 'Nova Despesa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <FormGrid gap="1rem">
            <Input
              label="Descrição *"
              placeholder="Ex: Supermercado, Gasolina..."
              {...register('descricao')}
              error={errors.descricao?.message}
            />
            
            <Input
              label="Valor *"
              placeholder="0,00"
              {...register('valor')}
              onChange={handleValueChange}
              error={errors.valor?.message}
            />
            
            <Input
              label="Situação *"
              type="select"
              options={situacaoOptions}
              {...register('situacao')}
              error={errors.situacao?.message}
            />
            
            <Input
              label="Data de Pagamento *"
              type="date"
              {...register('data_pagamento')}
              error={errors.data_pagamento?.message}
            />
            
            <Input
              label="Categoria *"
              type="select"
              options={categoriaOptions}
              {...register('categoria')}
              error={errors.categoria?.message}
            />
            
            <Input
              label="Repetir"
              type="select"
              options={repetirOptions}
              {...register('repetir')}
              error={errors.repetir?.message}
            />
            
            {showParcelas && (
              <Input
                label="Número de Parcelas *"
                type="number"
                min="2"
                max="60"
                {...register('parcelas')}
                error={errors.parcelas?.message}
              />
            )}
          </FormGrid>
          
          <Flex justify="flex-end" style={{ marginTop: '2rem' }}>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading}
              style={{ minWidth: '120px' }}
            >
              {isLoading ? 'Salvando...' : (initialData ? 'Atualizar' : 'Salvar')}
            </Button>
          </Flex>
        </form>
      </CardContent>
    </Card>
  );
};