import { useEffect } from 'react';
import { useGetQueueSize, useGetTable, useJoinQueue } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ArrowLeft } from 'lucide-react';

interface MatchmakingScreenProps {
  onNavigateToLobby: () => void;
  onNavigateToTable: () => void;
}

export default function MatchmakingScreen({ onNavigateToLobby, onNavigateToTable }: MatchmakingScreenProps) {
  const joinQueue = useJoinQueue();
  const { data: queueSize } = useGetQueueSize();
  const { data: table } = useGetTable();

  // Join queue on mount
  useEffect(() => {
    if (!joinQueue.isPending && !joinQueue.isSuccess) {
      joinQueue.mutate();
    }
  }, []);

  // Navigate to table when one is assigned
  useEffect(() => {
    if (table) {
      onNavigateToTable();
    }
  }, [table, onNavigateToTable]);

  const handleCancel = () => {
    onNavigateToLobby();
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-2 border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">Finding Players...</CardTitle>
          <CardDescription>Please wait while we match you with other players</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-lg font-semibold">
              <Users className="w-5 h-5 text-primary" />
              <span>Players in Queue</span>
            </div>
            <p className="text-4xl font-bold text-primary">{queueSize ? Number(queueSize) : 0}</p>
            <p className="text-sm text-muted-foreground">Waiting for 3 players to start</p>
          </div>
          <Button onClick={handleCancel} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
