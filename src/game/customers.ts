import { Customer, Position } from '../types';
import { createRng } from './rng';
import { GAME_CONSTANTS } from '../types';

export type CustomerOptions = {
  seed?: number;
};

const CUSTOMER_TYPES: Customer['type'][] = ['student', 'worker', 'elderly', 'tourist'];

export function createCustomer(options: CustomerOptions = {}): Customer {
  const rng = createRng(options.seed);
  const id = `customer_${Date.now()}_${rng.nextInt(1000, 9999)}`;
  const type = CUSTOMER_TYPES[rng.nextInt(0, CUSTOMER_TYPES.length - 1)];
  const patience = Math.max(30, Math.min(100, GAME_CONSTANTS.BASE_PATIENCE - rng.nextInt(0, 20)));
  const position: Position = { x: rng.nextInt(10, 90), y: rng.nextInt(10, 90) };

  return {
    id,
    type,
    order: {
      id: '',
      items: [],
      totalPrice: 0,
      timeLimit: 0,
      complexity: 0,
    },
    patience,
    position,
    mood: 'neutral',
  };
}

