import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownTrigger = styled.button`
  color: white;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: ${props => props.theme.transitions.fast};
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
  
  &.active {
    background-color: ${props => props.theme.colors.primaryDark};
    font-weight: 600;
  }
  
  svg {
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    justify-content: center;
    padding: ${props => props.theme.spacing.md};
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border};
  z-index: ${props => props.theme.zIndex.dropdown};
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all 0.2s ease;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    position: static;
    box-shadow: none;
    border: none;
    border-radius: 0;
    background-color: ${props => props.theme.colors.primaryDark};
    min-width: auto;
    width: 100%;
    margin-top: ${props => props.theme.spacing.xs};
    transform: none;
    opacity: 1;
    visibility: visible;
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.backgroundHover};
  }
  
  &.active {
    background-color: ${props => props.theme.colors.primary};
    color: white;
    font-weight: 600;
  }
  
  &:first-child {
    border-radius: ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    color: rgba(255, 255, 255, 0.9);
    padding: ${props => props.theme.spacing.md};
    border-radius: 0;
    
    &:hover {
      background-color: ${props => props.theme.colors.primaryLight};
      color: white;
    }
    
    &.active {
      background-color: ${props => props.theme.colors.primaryLight};
      color: white;
    }
  }
`;

export const DropdownMenu = ({ 
  trigger, 
  items, 
  isOpen, 
  onToggle, 
  onClose 
}) => {
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const hasActiveItem = items.some(item => isActive(item.path));

  return (
    <DropdownContainer 
      ref={dropdownRef}
      onMouseEnter={() => window.innerWidth > 768 && onToggle(true)}
      onMouseLeave={() => window.innerWidth > 768 && onToggle(false)}
    >
      <DropdownTrigger 
        onClick={() => onToggle(!isOpen)}
        isOpen={isOpen}
        className={hasActiveItem ? 'active' : ''}
      >
        {trigger}
        <ChevronDown size={16} />
      </DropdownTrigger>
      
      <DropdownContent isOpen={isOpen}>
        {items.map((item, index) => (
          <DropdownItem
            key={index}
            to={item.path}
            onClick={onClose}
            className={isActive(item.path) ? 'active' : ''}
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </DropdownContainer>
  );
};