export function getRandom(list) {
  return list[Math.floor((Math.random()*list.length))];
}

export function getColor(
  num,
  startColor =  [64, 42, 196],
  endColor = [237, 123, 158]
) {
  if (num < 0 || num > 100) {
    throw new Error("O número deve estar entre 0 e 100");
  }

  const ratio = num / 100.0;

  const color = startColor.map((startVal, i) => {
    const endVal = endColor[i];
    const blendedVal = Math.round((1 - ratio) * startVal + ratio * endVal);
    return blendedVal.toString(16).padStart(2, '0');
  });

  return "#" + color.join('');
}
