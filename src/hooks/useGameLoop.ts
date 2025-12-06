import { useEffect } from 'react';

export function useGameLoop(
  isPaused: boolean,
  customersLength: number,
  acceptedOrder: boolean,
  spawnCustomer: () => void,
  decrementTime: () => void,
): void {
  useEffect(
    function spawnLoop() {
      const interval = setInterval(function tick() {
        if (!isPaused && customersLength < 5) {
          spawnCustomer();
        }
      }, 8000);
      return function cleanup() {
        clearInterval(interval);
      };
    },
    [isPaused, customersLength, spawnCustomer],
  );

  useEffect(
    function countdownLoop() {
      let interval: number | null = null;
      if (acceptedOrder && !isPaused) {
        interval = setInterval(function tick() {
          decrementTime();
        }, 1000) as unknown as number;
      }
      return function cleanup() {
        if (interval) clearInterval(interval);
      };
    },
    [acceptedOrder, isPaused, decrementTime],
  );
}

