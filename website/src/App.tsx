import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import HomePage from './pages/HomePage';
import FighterDetailPage from './pages/FighterDetailPage';

function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fighter/:id" element={<FighterDetailPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 