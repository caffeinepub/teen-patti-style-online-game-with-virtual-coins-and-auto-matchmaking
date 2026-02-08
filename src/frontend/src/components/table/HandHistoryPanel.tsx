import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TableView } from '../../backend';
import { Clock } from 'lucide-react';

interface HandHistoryPanelProps {
  table: TableView;
}

export default function HandHistoryPanel({ table }: HandHistoryPanelProps) {
  const events: string[] = [];

  // Generate history from table state
  table.players.forEach((player, index) => {
    const status = table.playerStatuses[index];
    if (status.hasPacked) {
      events.push(`${player.displayName} packed`);
    } else if (status.hasSeenCards) {
      events.push(`${player.displayName} saw cards`);
    }
  });

  if (events.length === 0) {
    events.push('Game started');
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/20 h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Hand History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                {event}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
