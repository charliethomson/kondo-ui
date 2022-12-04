export const prettySize = (sz: number): string => {
  const KIBIBYTE: number = 1024;
  const MEBIBYTE: number = 1_048_576;
  const GIBIBYTE: number = 1_073_741_824;
  const TEBIBYTE: number = 1_099_511_627_776;
  const PEBIBYTE: number = 1_125_899_906_842_624;
  const EXBIBYTE: number = 1_152_921_504_606_846_976;

  let size = sz;
  let symbol = "B";

  if (size < KIBIBYTE) {
  } else if (size < MEBIBYTE) {
    size /= KIBIBYTE;
    symbol = "KiB";
  } else if (size < GIBIBYTE) {
    size /= MEBIBYTE;
    symbol = "MiB";
  } else if (size < TEBIBYTE) {
    size /= GIBIBYTE;
    symbol = "GiB";
  } else if (size < PEBIBYTE) {
    size /= TEBIBYTE;
    symbol = "TiB";
  } else if (size < EXBIBYTE) {
    size /= PEBIBYTE;
    symbol = "PiB";
  } else {
    size /= EXBIBYTE;
    symbol = "EiB";
  }

  return size.toFixed(1) + symbol;
};
