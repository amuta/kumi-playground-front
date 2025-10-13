export function boxMullerRandom(mean = 0, std = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * std + mean;
}

export function uniformRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function seededRng(seed: number) {
  let state = seed >>> 0;

  return function random(): number {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}
