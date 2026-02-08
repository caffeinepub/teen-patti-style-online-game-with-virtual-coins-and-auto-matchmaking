interface CardDisplayProps {
  isMe: boolean;
  hasSeenCards: boolean;
  hasPacked: boolean;
}

export default function CardDisplay({ isMe, hasSeenCards, hasPacked }: CardDisplayProps) {
  if (hasPacked) {
    return null;
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-12 h-16 rounded border-2 border-primary/40 bg-card flex items-center justify-center text-xs font-semibold"
          style={{
            backgroundImage: isMe && hasSeenCards ? 'none' : 'url(/assets/generated/card-deck-sprite.dim_2048x2048.png)',
            backgroundSize: isMe && hasSeenCards ? 'auto' : '400% 400%',
            backgroundPosition: isMe && hasSeenCards ? 'center' : '0% 0%',
          }}
        >
          {isMe && !hasSeenCards && '?'}
          {isMe && hasSeenCards && '🂠'}
        </div>
      ))}
    </div>
  );
}
