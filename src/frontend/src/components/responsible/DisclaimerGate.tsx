import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface DisclaimerGateProps {
  onAcknowledge: () => void;
}

export default function DisclaimerGate({ onAcknowledge }: DisclaimerGateProps) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [virtualCoinsConfirmed, setVirtualCoinsConfirmed] = useState(false);

  const canProceed = ageConfirmed && virtualCoinsConfirmed;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <AlertCircle className="w-6 h-6" />
            <DialogTitle className="text-xl">Important Notice</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Please read and confirm the following before playing:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="age"
              checked={ageConfirmed}
              onCheckedChange={(checked) => setAgeConfirmed(checked === true)}
            />
            <Label htmlFor="age" className="text-sm font-normal cursor-pointer leading-relaxed">
              I confirm that I am <strong>18 years of age or older</strong>.
            </Label>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="virtual"
              checked={virtualCoinsConfirmed}
              onCheckedChange={(checked) => setVirtualCoinsConfirmed(checked === true)}
            />
            <Label htmlFor="virtual" className="text-sm font-normal cursor-pointer leading-relaxed">
              I understand this game uses <strong>virtual coins only</strong> with no real-money value. This is{' '}
              <strong>not real-money gambling</strong>.
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onAcknowledge} disabled={!canProceed} className="w-full">
            I Agree - Continue to Play
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
