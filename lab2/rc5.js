function RC5(key, rounds) {
  if (typeof key !== "string" || key.length !== 16) {
    throw new Error("Ключ должен быть строкой из 16 символов.");
  }

  if (typeof rounds !== "number" || rounds < 0) {
    throw new Error("Количество раундов должно быть неотрицательным целым числом.");
  }

  const w = 32; // Размер слова в битах
  const r = rounds; // Количество раундов
  const b = key.length; // Длина ключа в байтах
  const c = Math.ceil(b / 4); // Длина ключа в словах
  const t = 2 * (r + 1); // Размер расширенного ключа в словах

  // Инициализация констант
  const P = 0xB7E15163;
  const Q = 0x9E3779B9;

  // Расширение ключа
  const keyBytes = new Uint8Array(new TextEncoder().encode(key));
  const L = new Uint32Array(c);
  for (let i = 0; i < c; i++) {
    L[i] = keyBytes[i];
  }
  const S = new Uint32Array(t);
  S[0] = P;
  for (let i = 1; i < t; i++) {
    S[i] = S[i - 1] + Q;
  }

  let i = 0;
  let j = 0;
  let A, B;

  function rotl(x, y) {
    return (x << y) | (x >>> (w - y));
  }

  function rotr(x, y) {
    return (x >>> y) | (x << (w - y));
  }

  this.encrypt = function (plainText) {
    if (!(plainText instanceof Uint8Array) || plainText.length !== 8) {
      throw new Error("Входной текст должен быть Uint8Array длиной в 8 байт.");
    }

    const block = new Uint32Array(2);
    block[0] = (plainText[0] << 24) | (plainText[1] << 16) | (plainText[2] << 8) | plainText[3];
    block[1] = (plainText[4] << 24) | (plainText[5] << 16) | (plainText[6] << 8) | plainText[7];

    A = block[0] + S[0];
    B = block[1] + S[1];

    for (let round = 1; round <= r; round++) {
      A = rotl(A ^ B, B) + S[2 * round];
      B = rotl(B ^ A, A) + S[2 * round + 1];
    }

    block[0] = A;
    block[1] = B;

    const cipherTextBytes = new Uint8Array(8);
    cipherTextBytes[0] = (block[0] >>> 24) & 0xFF;
    cipherTextBytes[1] = (block[0] >>> 16) & 0xFF;
    cipherTextBytes[2] = (block[0] >>> 8) & 0xFF;
    cipherTextBytes[3] = block[0] & 0xFF;
    cipherTextBytes[4] = (block[1] >>> 24) & 0xFF;
    cipherTextBytes[5] = (block[1] >>> 16) & 0xFF;
    cipherTextBytes[6] = (block[1] >>> 8) & 0xFF;
    cipherTextBytes[7] = block[1] & 0xFF;

    return cipherTextBytes;
  };

  this.decrypt = function (cipherText) {
    if (!(cipherText instanceof Uint8Array) || cipherText.length !== 8) {
      throw new Error("Входной текст должен быть Uint8Array длиной в 8 байт.");
    }

    const block = new Uint32Array(2);
    block[0] = (cipherText[0] << 24) | (cipherText[1] << 16) | (cipherText[2] << 8) | cipherText[3];
    block[1] = (cipherText[4] << 24) | (cipherText[5] << 16) | (cipherText[6] << 8) | cipherText[7];

    A = block[0];
    B = block[1];

    for (let round = r; round >= 1; round--) {
      B = rotr(B - S[2 * round + 1], A) ^ A;
      A = rotr(A - S[2 * round], B) ^ B;
    }

    block[0] = A - S[0];
    block[1] = B - S[1];

    const plainTextBytes = new Uint8Array(8);
    plainTextBytes[0] = (block[0] >>> 24) & 0xFF;
    plainTextBytes[1] = (block[0] >>> 16) & 0xFF;
    plainTextBytes[2] = (block[0] >>> 8) & 0xFF;
    plainTextBytes[3] = block[0] & 0xFF;
    plainTextBytes[4] = (block[1] >>> 24) & 0xFF;
    plainTextBytes[5] = (block[1] >>> 16) & 0xFF;
    plainTextBytes[6] = (block[1] >>> 8) & 0xFF;
    plainTextBytes[7] = block[1] & 0xFF;

    return plainTextBytes;
  };
}

// Создайте экземпляр RC5
const key = "0123456789ABCDEF"; // 16-символьный ключ
const rounds = 12; // Количество раундов
const rc5 = new RC5(key, rounds);

// Оригинальный текст
const originalText = new Uint8Array([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x31, 0x32, 0x33]);

// Зашифруйте оригинальный текст
const encryptedText = rc5.encrypt(originalText);

// Расшифруйте зашифрованный текст
const decryptedText = rc5.decrypt(encryptedText);

// Сравните расшифрованный текст с оригинальным текстом
if (arrayBuffersEqual(originalText, decryptedText)) {
  console.log("Зашифрование и расшифрование прошли успешно. Результат верен.");
} else {
  console.error("Ошибка: Результат расшифрования не совпадает с оригинальным текстом.");
}

// Функция для сравнения двух Uint8Array на равенство
function arrayBuffersEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}