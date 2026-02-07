const units = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertTwoDigits(num: number): string {
  if (num < 20) return units[num];
  return `${tens[Math.floor(num / 10)]} ${units[num % 10]}`.trim();
}

function convertThreeDigits(num: number): string {
  if (num === 0) return "";
  if (num < 100) return convertTwoDigits(num);
  return `${units[Math.floor(num / 100)]} Hundred ${convertTwoDigits(
    num % 100
  )}`.trim();
}

export function amountToWords(amount: number): string {
  if (amount === 0) return "";

  let num = Math.floor(amount);
  let result = "";

  const crore = Math.floor(num / 1_00_00_000);
  num %= 1_00_00_000;

  const lakh = Math.floor(num / 1_00_000);
  num %= 1_00_000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore) result += `${convertThreeDigits(crore)} Crore `;
  if (lakh) result += `${convertThreeDigits(lakh)} Lakh `;
  if (thousand) result += `${convertThreeDigits(thousand)} Thousand `;
  if (num) result += `${convertThreeDigits(num)} `;

  return `${result.trim()} Rupees`;
}
