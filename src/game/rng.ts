export type RNG = {
  nextFloat: () => number;
  nextInt: (min: number, max: number) => number;
  chance: (probability: number) => boolean;
};

export function createRng(seed?: number): RNG {
  let s = typeof seed === 'number' ? seed : Date.now();
  function nextFloat(): number {
    // Simple LCG for determinism if seed provided
    s = (s * 1664525 + 1013904223) % 4294967296;
    return (s & 0xffffffff) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    const r = nextFloat();
    return Math.floor(min + r * (max - min + 1));
  }

  function chance(probability: number): boolean {
    return nextFloat() < probability;
  }

  return { nextFloat, nextInt, chance };
}

