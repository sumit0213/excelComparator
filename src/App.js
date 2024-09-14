import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Import React Router components
import { ThemeProvider, createTheme } from '@mui/material/styles';  // Import ThemeProvider and createTheme from MUI
import './App.css';
import PageFormat from './PageFormat';  // Component handling tab navigation
import DifferencesPage from './DifferencesPage';  // Component for displaying the differences

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Set your primary color
    },
    secondary: {
      main: '#dc004e',  // Set your secondary color
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',  // Set your preferred font
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>  {/* Wrap the entire app with ThemeProvider */}
      <Router>
        <div className="App">
          <header>
          </header>

          <main>
            <Routes>
              {/* Define your routes */}
              <Route path="/" element={<PageFormat />} />  {/* Main page with tab navigation */}
              <Route path="/differences" element={<DifferencesPage />} />  {/* Differences page */}
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
