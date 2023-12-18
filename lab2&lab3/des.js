//перестановочные таблицы для DES
const initialPermutation = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38,
  30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39,
  31, 23, 15, 7,
];

const finalPermutation = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14,
  54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9,
  49, 17, 57, 25,
];

const expansionPermutation = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16,
  17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1,
];

//функция для выполнения перестановки согласно заданной таблице
function permute(input, table) {
  return table.map((bit) => input[bit - 1]);
}

//функция для выполнения циклического сдвига влево
function leftShift(arr, count) {
  return arr.concat(arr.splice(0, count));
}

//функция для генерации подключей
function generateSubkeys(key) {
  const keyPermutation = [
    57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35,
    27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46,
    38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
  ];

  const keyCompression = [
    14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27,
    20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56,
    34, 53, 46, 42, 50, 36, 29, 32,
  ];

  const keyBits = Array.from({ length: 64 }, (_, index) => (key >> index) & 1);
  const permutedKey = permute(keyBits, keyPermutation);

  let left = permutedKey.slice(0, 28);
  let right = permutedKey.slice(28);

  const subkeys = [];

  for (let i = 0; i < 16; i++) {
    left = leftShift(left, i < 2 || i == 8 || i == 15 ? 1 : 2);
    right = leftShift(right, i < 2 || i == 8 || i == 15 ? 1 : 2);

    const combinedKey = left.concat(right);
    const subkey = permute(combinedKey, keyCompression);
    subkeys.push(subkey);
  }

  return subkeys;
}

//функция для выполнения одного раунда DES
function desRound(data, subkey) {
  const expandedData = permute(data, expansionPermutation);
  const xorResult = expandedData.map((bit, index) => bit ^ subkey[index]);
  //имитация S-блоков (в реальной реализации они были бы таблицами)
  const sBoxResult = xorResult
    .join("")
    .match(/.{6}/g)
    .map((chunk, boxIndex) => {
      const row = parseInt(chunk[0] + chunk[5], 2) % 4;
      const col = parseInt(chunk.slice(1, 5), 2) % 16;
      const sBox = [
        [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
        [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
        [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
        [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
      ];

      const actualBoxIndex = boxIndex % sBox.length;
      const value = sBox[actualBoxIndex][row * 16 + col];
      return value !== undefined ? value.toString(2).padStart(4, "0") : '';
    })
    .join("");
  const permutedResult = permute(
    sBoxResult.split("").map(Number),
    finalPermutation
  );
  return permutedResult;
}

//функция для выполнения DES шифрования
export function desEncryptBlock(block, key) {
  const initialPermutationResult = permute(block, initialPermutation);
  const subkeys = generateSubkeys(key);

  let left = initialPermutationResult.slice(0, 32);
  let right = initialPermutationResult.slice(32);

  for (let i = 0; i < 16; i++) {
    const temp = right.slice();
    const roundResult = desRound(right, subkeys[i]);

    right = left.map((bit, index) => bit ^ roundResult[index]);
    left = temp;
  }

  const finalResult = permute(right.concat(left), finalPermutation);
  return parseInt(finalResult.join(""), 2);
}

//пример использования
const plaintextBlock = 0b1101011100101000110010100100011010101010110001100111001100101110;
const key = 0b1111000011001100111100001100110011110000110011001111000011001100;

const ciphertextBlock = desEncryptBlock(plaintextBlock, key);
console.log("Шифротекст:", ciphertextBlock.toString(2).padStart(64, "0"));
