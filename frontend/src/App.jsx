import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { lightTheme, darkTheme } from './styles/theme';
import { getThemePreference, setThemePreference } from './utils/themePreference';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Header } from './components/Layout/Header.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Expenses } from './pages/Expenses.jsx';
import { Incomes } from './pages/Incomes.jsx';
import { Categories } from './pages/Categories.jsx';
import { CreditCards } from './pages/CreditCards.jsx';
import { InvestmentAssets } from './pages/InvestmentAssets.jsx';
import { InvestmentTransactions } from './pages/InvestmentTransactions.jsx';

function App() {
  const [currentTheme, setCurrentTheme] = useState(() => getThemePreference());
  
  useEffect(() => {
    // Aplicar tema inicial
    const savedTheme = getThemePreference();
    setCurrentTheme(savedTheme);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    setThemePreference(newTheme);
  };

  const theme = currentTheme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AuthProvider>
          <PrivateRoute>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Header currentTheme={currentTheme} onThemeToggle={handleThemeToggle} />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/despesas" element={<Expenses />} />
                  <Route path="/receitas" element={<Incomes />} />
                  <Route path="/categorias" element={<Categories />} />
                  <Route path="/cartoes" element={<CreditCards />} />
                  <Route path="/ativos" element={<InvestmentAssets />} />
                  <Route path="/transacoes" element={<InvestmentTransactions />} />
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