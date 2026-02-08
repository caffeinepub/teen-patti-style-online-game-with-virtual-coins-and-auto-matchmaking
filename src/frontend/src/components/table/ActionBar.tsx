import { usePerformAction, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TableView } from '../../backend';
import { Eye, X, DollarSign, TrendingUp, Trophy } from 'lucide-react';

interface ActionBarProps {
  table: TableView;
}

export default function ActionBar({ table }: ActionBarProps) {
  const performAction = usePerformAction();
  const { data: userProfile } = useGetCallerUserProfile();

  const currentPlayerIndex = Number(table.currentTurn) % 3;
  const currentPlayer = table.players[currentPlayerIndex];
  const myStatus = table.playerStatuses.find((_, index) => {
    const player = table.players[index];
    return userProfile && player.principal.toString() === userProfile.displayName;
  });

  const isMyTurn = currentPlayer && userProfile && currentPlayer.principal.toString() === userProfile.displayName;
  const hasPacked = myStatus?.hasPacked || false;
  const hasSeenCards = myStatus?.hasSeenCards || false;

  const handleAction = (action: string) => {
    performAction.mutate(action);
  };

  if (!isMyTurn || hasPacked) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/20">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            {hasPacked ? 'You have packed' : 'Waiting for other players...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-3 justify-center">
          {!hasSeenCards && (
            <Button
              onClick={() => handleAction('see')}
              disabled={performAction.isPending}
              variant="secondary"
              size="lg"
            >
              <Eye className="w-5 h-5 mr-2" />
              See Cards
            </Button>
          )}
          <Button
            onClick={() => handleAction('pack')}
            disabled={performAction.isPending}
            variant="destructive"
            size="lg"
          >
            <X className="w-5 h-5 mr-2" />
            Pack
          </Button>
          <Button
            onClick={() => handleAction('bet')}
            disabled={performAction.isPending}
            variant="default"
            size="lg"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Call ({Number(table.currentBet).toLocaleString()})
          </Button>
          <Button
            onClick={() => handleAction('raise')}
            disabled={performAction.isPending}
            variant="default"
            size="lg"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Raise
          </Button>
          <Button
            onClick={() => handleAction('show')}
            disabled={performAction.isPending}
            variant="outline"
            size="lg"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Show
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
