import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import PinDetailScreen from './screens/PinDetailScreen';
import CreatePinScreen from './screens/CreatePinScreen';
import SettingsScreen from './screens/SettingsScreen';
import BoardDetailScreen from './screens/BoardDetailScreen';
import MyBoardsScreen from './screens/MyBoardsScreen';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#e60023',
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/pin/:pinId" element={<PinDetailScreen />} />
            <Route path="/create-pin" element={<CreatePinScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/boards" element={<MyBoardsScreen />} />
            <Route path="/boards/:boardId" element={<BoardDetailScreen />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
