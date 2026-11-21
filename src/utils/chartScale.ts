export const chartFrame = {
  width: 480,
  height: 200,
  left: 44,
  top: 12,
  plotWidth: 436,
  plotHeight: 160,
};

export function niceMax(value: number) {
  if (value <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step =
    [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ??
    10;
  return step * magnitude;
}
