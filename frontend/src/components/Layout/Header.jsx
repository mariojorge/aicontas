import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, DollarSign, Eye, EyeOff, LogOut, User } from 'lucide-react';
import { Container } from './Container';
import { getValueVisibility, toggleValueVisibility } from '../../utils/valueVisibility';
import { useAuth } from '../../contexts/AuthContext';

const HeaderContainer = styled.header`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  box-shadow: ${props => props.theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: ${props => props.theme.zIndex.sticky};
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    height: 56px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${props => props.theme.colors.primary};
    flex-direction: column;
    padding: ${props => props.theme.spacing.md};
    box-shadow: ${props => props.theme.shadows.lg};
    gap: ${props => props.theme.spacing.md};
  }
`;

const NavLink = styled(Link)`
  color: white;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: ${props => props.theme.transitions.fast};
  min-height: 44px;
  display: flex;
  align-items: center;
  text-decoration: none;
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
  
  &.active {
    background-color: ${props => props.theme.colors.primaryDark};
    font-weight: 600;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    justify-content: center;
    padding: ${props => props.theme.spacing.md};
  }
`;

const MenuButton = styled.button`
  display: none;
  color: white;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: ${props => props.theme.transitions.fast};
  min-height: 44px;
  min-width: 44px;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const VisibilityButton = styled.button`
  color: white;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: ${props => props.theme.transitions.fast};
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: white;
  font-size: 0.875rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  color: white;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: ${props => props.theme.transitions.fast};
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
`;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [valuesVisible, setValuesVisible] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    setValuesVisible(getValueVisibility());
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleToggleVisibility = () => {
    const newVisibility = toggleValueVisibility();
    setValuesVisible(newVisibility);
    
    // Disparar evento personalizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('valueVisibilityChanged', {
      detail: { visible: newVisibility }
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <HeaderContainer>
      <Container>
        <HeaderContent>
          <Logo>
            <DollarSign size={28} />
            Finance Control
          </Logo>
          
          <Nav isOpen={isMenuOpen}>
            <NavLink 
              to="/dashboard" 
              onClick={closeMenu}
              className={isActive('/dashboard') ? 'active' : ''}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/categorias"
              onClick={closeMenu}
              className={isActive('/categorias') ? 'active' : ''}
            >
              Categorias
            </NavLink>
            <NavLink 
              to="/despesas" 
              onClick={closeMenu}
              className={isActive('/despesas') ? 'active' : ''}
            >
              Despesas
            </NavLink>
            <NavLink 
              to="/receitas" 
              onClick={closeMenu}
              className={isActive('/receitas') ? 'active' : ''}
            >
              Receitas
            </NavLink>
            <NavLink
              to="/cartoes"
              onClick={closeMenu}
              className={isActive('/cartoes') ? 'active' : ''}
            >
              Cartões
            </NavLink>
          </Nav>
          
          <ActionButtons>
            <UserInfo>
              <User size={16} />
              Olá, {user?.nome?.split(' ')[0] || 'Usuário'}
            </UserInfo>
            <VisibilityButton 
              onClick={handleToggleVisibility} 
              aria-label={valuesVisible ? 'Ocultar valores' : 'Mostrar valores'}
              title={valuesVisible ? 'Ocultar valores' : 'Mostrar valores'}
            >
              {valuesVisible ? <Eye size={20} /> : <EyeOff size={20} />}
            </VisibilityButton>
            <LogoutButton
              onClick={handleLogout}
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={20} />
            </LogoutButton>
            <MenuButton onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </MenuButton>
          </ActionButtons>
        </HeaderContent>
      </Container>
    </HeaderContainer>
  );
};