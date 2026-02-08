import { useInternetIdentity } from './useInternetIdentity';
import { useState, useEffect } from 'react';

const DISCLAIMER_KEY_PREFIX = 'teenPatti_disclaimer_ack_';

export function useDisclaimerAck() {
  const { identity } = useInternetIdentity();
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const principalString = identity?.getPrincipal().toString() || '';
  const storageKey = DISCLAIMER_KEY_PREFIX + principalString;

  useEffect(() => {
    if (principalString) {
      try {
        const stored = localStorage.getItem(storageKey);
        setHasAcknowledged(stored === 'true');
      } catch (error) {
        console.warn('Failed to read disclaimer acknowledgement:', error);
      }
      setIsLoading(false);
    }
  }, [principalString, storageKey]);

  const acknowledge = () => {
    try {
      localStorage.setItem(storageKey, 'true');
      setHasAcknowledged(true);
    } catch (error) {
      console.error('Failed to save disclaimer acknowledgement:', error);
    }
  };

  return {
    hasAcknowledged,
    acknowledge,
    isLoading,
  };
}
