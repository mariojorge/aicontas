import React, { useState, useEffect, cloneElement } from 'react';
import styled from 'styled-components';
import { getValueVisibility } from '../../utils/valueVisibility';

const ValueContainer = styled.span`
  filter: ${props => props.hidden ? 'blur(4px)' : 'none'};
  transition: filter 0.3s ease;
  user-select: ${props => props.hidden ? 'none' : 'auto'};
  display: inline-block;
  font-size: ${props => props.hidden ? '1.25em' : 'inherit'};
`;

export const PrivateValue = ({ children, placeholder = "R$ ••••,••", ...props }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(getValueVisibility());
    };

    // Verificar estado inicial
    updateVisibility();

    // Escutar mudanças
    const handleVisibilityChange = (event) => {
      setIsVisible(event.detail.visible);
    };

    window.addEventListener('valueVisibilityChanged', handleVisibilityChange);

    return () => {
      window.removeEventListener('valueVisibilityChanged', handleVisibilityChange);
    };
  }, []);

  // Se valores estão ocultos, substitui o conteúdo pelo placeholder
  const displayContent = isVisible ? children : placeholder;

  return (
    <ValueContainer hidden={!isVisible} {...props}>
      {displayContent}
    </ValueContainer>
  );
};