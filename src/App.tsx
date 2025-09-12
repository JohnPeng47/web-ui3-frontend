import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DashboardPage from './components/pages/agent_dashboard/DashboardPage';

const theme = createTheme({
  palette: {
    mode: 'light'
  }
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardPage />
    </ThemeProvider>
  );
}
