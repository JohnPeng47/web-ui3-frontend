import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardPage from './components/pages/agent_dashboard/DashboardPage';
import CreateEngagementPage from './components/pages/create_engagement/CreateEngagementPage';

const theme = createTheme({
  palette: {
    mode: 'light'
  }
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" newestOnTop closeOnClick pauseOnHover />
      <Routes>
        <Route path="/create" element={<CreateEngagementPage />} />
        <Route path="/dashboard/:engagementId" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/create" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
