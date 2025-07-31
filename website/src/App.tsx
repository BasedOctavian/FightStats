import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import HomePage from './pages/HomePage';
import FighterDetailPage from './pages/fighter/FighterDetailPage';
import EventDetailPage from './pages/event/EventDetailPage';
import FightDetailPage from './pages/fight/FightDetailPage';
import VisualizePage from './pages/VisualizePage';
import TopBar from './components/TopBar';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: '#0A0E17' }}>
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fighter/:id" element={<FighterDetailPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/fight/:encodedFightCode" element={<FightDetailPage />} />
            <Route path="/visualize" element={<VisualizePage />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App; 