// rank: 0-indexed (0=chess rank1, 7=chess rank8)
// file: 0-indexed (0=a, 7=h)

export function isUpperHalf(rank) {
  return rank >= 4; // chess ranks 5-8
}

export function isLowerHalf(rank) {
  return rank <= 3; // chess ranks 1-4
}

// 9-column absolute grid: upper half absCol=file, lower half absCol=file+1
export function toAbsCol(file, rank) {
  return isUpperHalf(rank) ? file : file + 1;
}

export function isValidSquare(file, rank) {
  return file >= 0 && file <= 7 && rank >= 0 && rank <= 7;
}

export function squareIndex(file, rank) {
  return rank * 8 + file;
}

export function indexToSquare(index) {
  return { file: index % 8, rank: Math.floor(index / 8) };
}
