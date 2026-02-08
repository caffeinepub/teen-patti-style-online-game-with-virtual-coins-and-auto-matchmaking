import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPanel() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/assets/generated/table-felt.dim_1024x1024.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <Card className="w-full max-w-md relative z-10 bg-card/95 backdrop-blur-sm border-2 border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/app-logo.dim_512x512.png"
              alt="Teen Patti"
              className="w-32 h-32 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Teen Patti Classic</CardTitle>
          <CardDescription className="text-base">
            Virtual coins only • No real-money gambling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLoggingIn ? 'Connecting...' : 'Login to Play'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By logging in, you confirm you are 18+ years old
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
