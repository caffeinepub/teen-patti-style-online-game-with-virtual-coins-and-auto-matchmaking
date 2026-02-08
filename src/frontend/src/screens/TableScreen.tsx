import { useEffect } from 'react';
import { useGetTable, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ActionBar from '../components/table/ActionBar';
import HandHistoryPanel from '../components/table/HandHistoryPanel';
import CardDisplay from '../components/table/CardDisplay';
import BalanceBadge from '../components/lobby/BalanceBadge';

interface TableScreenProps {
  onNavigateToLobby: () => void;
}

export default function TableScreen({ onNavigateToLobby }: TableScreenProps) {
  const { data: table } = useGetTable();
  const { data: userProfile } = useGetCallerUserProfile();

  // Navigate back to lobby if table is no longer active
  useEffect(() => {
    if (table && !table.isGameActive) {
      const timer = setTimeout(() => {
        onNavigateToLobby();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [table, onNavigateToLobby]);

  if (!table) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">No active table found</p>
            <Button onClick={onNavigateToLobby}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayerIndex = Number(table.currentTurn) % 3;
  const currentPlayer = table.players[currentPlayerIndex];
  const myPrincipal = userProfile ? userProfile.displayName : '';

  return (
    <div className="space-y-6">
      {/* Table Header */}
      <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Table #{Number(table.id)}</CardTitle>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                Pot: <span className="text-primary font-bold">{Number(table.currentPot).toLocaleString()}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Current Bet: <span className="text-primary font-bold">{Number(table.currentBet).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players */}
        <div className="lg:col-span-2 space-y-4">
          {table.players.map((player, index) => {
            const status = table.playerStatuses[index];
            const isCurrentTurn = index === currentPlayerIndex;
            const isMe = !!(userProfile && player.principal.toString() === myPrincipal);

            return (
              <Card
                key={index}
                className={`bg-card/95 backdrop-blur-sm border-2 ${
                  isCurrentTurn ? 'border-primary' : 'border-primary/20'
                } ${status.hasPacked ? 'opacity-50' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {player.displayName} {isMe && '(You)'}
                        </h3>
                        {isCurrentTurn && !status.hasPacked && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-semibold">
                            Your Turn
                          </span>
                        )}
                        {status.hasPacked && (
                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                            Packed
                          </span>
                        )}
                      </div>
                      <BalanceBadge coins={player.coins} />
                      {status.hasSeenCards && !status.hasPacked && (
                        <p className="text-xs text-muted-foreground">Seen cards</p>
                      )}
                    </div>
                    <CardDisplay
                      isMe={isMe}
                      hasSeenCards={status.hasSeenCards}
                      hasPacked={status.hasPacked}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hand History */}
        <div className="lg:col-span-1">
          <HandHistoryPanel table={table} />
        </div>
      </div>

      {/* Action Bar */}
      {table.isGameActive && <ActionBar table={table} />}

      {!table.isGameActive && (
        <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-lg font-semibold">Game Over!</p>
            <p className="text-muted-foreground">Returning to lobby...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
