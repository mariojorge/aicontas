import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Header } from './components/Layout/Header.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Expenses } from './pages/Expenses.jsx';
import { Incomes } from './pages/Incomes.jsx';
import { Reports } from './pages/Reports.jsx';
import { Categories } from './pages/Categories.jsx';
import { CreditCards } from './pages/CreditCards.jsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AuthProvider>
          <PrivateRoute>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Header />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/despesas" element={<Expenses />} />
                  <Route path="/receitas" element={<Incomes />} />
                  <Route path="/categorias" element={<Categories />} />
                  <Route path="/cartoes" element={<CreditCards />} />
                  <Route path="/relatorios" element={<Reports />} />
                </Routes>
              </main>
            </div>
          </PrivateRoute>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;