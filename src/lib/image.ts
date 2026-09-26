export interface ImageDimensions {
  width: number;
  height: number;
}

export function fitImageWithin(sourceWidth: number, sourceHeight: number, maxWidth: number, maxHeight: number): ImageDimensions {
  if (![sourceWidth, sourceHeight, maxWidth, maxHeight].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Image dimensions must be positive numbers.');
  }
  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}
