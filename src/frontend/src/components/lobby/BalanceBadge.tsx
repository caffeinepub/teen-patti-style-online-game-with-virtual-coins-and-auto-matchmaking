import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BalanceBadgeProps {
  coins: bigint;
}

export default function BalanceBadge({ coins }: BalanceBadgeProps) {
  const formattedCoins = Number(coins).toLocaleString();

  return (
    <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
      <Coins className="w-4 h-4 mr-1.5 text-primary" />
      {formattedCoins}
    </Badge>
  );
}
