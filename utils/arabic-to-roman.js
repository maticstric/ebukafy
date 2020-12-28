/*
 *  Convert from arabic numerals to roman numerals.
 *  https://stackoverflow.com/a/32851198
 */

exports.arabicToRoman = (arabicNum) => {
  let lookup = {M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1};
  let roman = '';

  for (let i in lookup) {
    while (arabicNum >= lookup[i]) {
      roman += i;
      arabicNum -= lookup[i];
    }
  }

  return roman;
}
