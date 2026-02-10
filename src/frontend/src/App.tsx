import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import LoginPanel from './components/auth/LoginPanel';
import ProfileSetupDialog from './components/profile/ProfileSetupDialog';
import LobbyScreen from './screens/LobbyScreen';
import MatchmakingScreen from './screens/MatchmakingScreen';
import TableScreen from './screens/TableScreen';
import AppShell from './components/layout/AppShell';
import { ThemeProvider } from 'next-themes';
import { registerServiceWorker } from './pwa/registerServiceWorker';

type AppScreen = 'lobby' | 'matchmaking' | 'table';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('lobby');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Register service worker on mount
  useEffect(() => {
    if (import.meta.env.PROD) {
      registerServiceWorker();
    }
  }, []);

  // Reset to lobby when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentScreen('lobby');
    }
  }, [isAuthenticated]);

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <LoginPanel />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppShell>
        {showProfileSetup && <ProfileSetupDialog />}
        {!showProfileSetup && currentScreen === 'lobby' && (
          <LobbyScreen onNavigateToMatchmaking={() => setCurrentScreen('matchmaking')} />
        )}
        {!showProfileSetup && currentScreen === 'matchmaking' && (
          <MatchmakingScreen
            onNavigateToLobby={() => setCurrentScreen('lobby')}
            onNavigateToTable={() => setCurrentScreen('table')}
          />
        )}
        {!showProfileSetup && currentScreen === 'table' && (
          <TableScreen onNavigateToLobby={() => setCurrentScreen('lobby')} />
        )}
      </AppShell>
    </ThemeProvider>
  );
}
