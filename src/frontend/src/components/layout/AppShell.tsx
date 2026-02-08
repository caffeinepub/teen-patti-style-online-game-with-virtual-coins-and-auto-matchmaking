import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import BalanceBadge from '../lobby/BalanceBadge';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/assets/generated/table-felt.dim_1024x1024.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-primary/20 bg-card/90 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/app-logo.dim_512x512.png"
                alt="Teen Patti"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">Teen Patti Classic</h1>
                {userProfile && (
                  <p className="text-xs text-muted-foreground">{userProfile.displayName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {userProfile && <BalanceBadge coins={userProfile.coins} />}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-primary/20 bg-card/90 backdrop-blur-sm py-4">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026. Built with love using{' '}
            <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
