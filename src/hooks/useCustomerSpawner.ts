import { useEffect } from 'react';
import useGameStore from '../store/gameStore';

export function useCustomerSpawner(intervalMs: number = 8000): void {
  const isPaused = useGameStore(state => state.isPaused);
  const spawnCustomer = useGameStore(state => state.spawnCustomerWithOrder);

  useEffect(
    function spawnEffect() {
      if (isPaused) return;

      function spawnLogic(): void {
        const state = useGameStore.getState();
        if (state.customers.length < 5) {
          state.spawnCustomerWithOrder();
        }
      }

      if (useGameStore.getState().customers.length === 0) {
        spawnLogic();
      }

      const intervalId = setInterval(spawnLogic, intervalMs);
      return function cleanup() {
        clearInterval(intervalId);
      };
    },
    [isPaused, intervalMs, spawnCustomer],
  );
}

