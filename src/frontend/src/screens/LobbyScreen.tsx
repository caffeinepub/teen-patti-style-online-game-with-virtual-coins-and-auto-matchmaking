import { useDisclaimerAck } from '../hooks/useDisclaimerAck';
import { useGetGameSettings } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DisclaimerGate from '../components/responsible/DisclaimerGate';
import { Play, Coins } from 'lucide-react';

interface LobbyScreenProps {
  onNavigateToMatchmaking: () => void;
}

export default function LobbyScreen({ onNavigateToMatchmaking }: LobbyScreenProps) {
  const { hasAcknowledged, acknowledge, isLoading } = useDisclaimerAck();
  const { data: gameSettings } = useGetGameSettings();

  const handlePlay = () => {
    if (hasAcknowledged) {
      onNavigateToMatchmaking();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {!hasAcknowledged && <DisclaimerGate onAcknowledge={acknowledge} />}
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-sm border-2 border-primary/20">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-primary">Ready to Play?</CardTitle>
            <CardDescription className="text-base">
              Join a table and compete with other players in Teen Patti Classic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                Game Rules
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 3 players per table</li>
                <li>• Boot amount: {gameSettings ? Number(gameSettings.bootAmount).toLocaleString() : '...'} coins</li>
                <li>• Each player receives 3 cards</li>
                <li>• Play blind or see your cards</li>
                <li>• Last player standing wins the pot!</li>
              </ul>
            </div>
            <Button
              onClick={handlePlay}
              disabled={!hasAcknowledged}
              size="lg"
              className="w-full h-14 text-xl font-bold"
            >
              <Play className="w-6 h-6 mr-2" />
              Play Now
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Virtual coins only • No real-money gambling
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
