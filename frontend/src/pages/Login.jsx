import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  transition: ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};
  pointer-events: none;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  background: ${props => props.theme.colors.error}10;
  border: 1px solid ${props => props.theme.colors.error}30;
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 0.75rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const ToggleMode = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  text-align: center;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (!formData.nome.trim()) {
          setError('Nome é obrigatório');
          return;
        }
        result = await register(formData.nome, formData.email, formData.password);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      nome: '',
      email: '',
      password: ''
    });
  };

  return (
    <LoginContainer>
      <div>
        <Title>💰 Finance Control</Title>
        <LoginCard>
          <CardHeader>
            <CardTitle>
              {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <Form onSubmit={handleSubmit}>
              {!isLogin && (
                <InputGroup>
                  <Label htmlFor="nome">Nome completo</Label>
                  <div style={{ position: 'relative' }}>
                    <InputIcon>
                      <User size={18} />
                    </InputIcon>
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="Digite seu nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                </InputGroup>
              )}

              <InputGroup>
                <Label htmlFor="email">E-mail</Label>
                <div style={{ position: 'relative' }}>
                  <InputIcon>
                    <Mail size={18} />
                  </InputIcon>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </InputGroup>

              <InputGroup>
                <Label htmlFor="password">Senha</Label>
                <div style={{ position: 'relative' }}>
                  <InputIcon>
                    <Lock size={18} />
                  </InputIcon>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </PasswordToggle>
                </div>
              </InputGroup>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar conta')}
              </Button>
            </Form>

            <ToggleMode type="button" onClick={toggleMode}>
              {isLogin 
                ? 'Não tem uma conta? Criar conta' 
                : 'Já tem uma conta? Fazer login'
              }
            </ToggleMode>
            
            {isLogin && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                background: '#f0f9ff', 
                border: '1px solid #e0f2fe', 
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: '#0369a1'
              }}>
                <strong>Conta demo:</strong><br />
                E-mail: admin@finance.com<br />
                Senha: 123456
              </div>
            )}
          </CardContent>
        </LoginCard>
      </div>
    </LoginContainer>
  );
};