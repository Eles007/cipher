// Представление начальных значений
const h0 = 0x6a09e667;
const h1 = 0xbb67ae85;
const h2 = 0x3c6ef372;
const h3 = 0xa54ff53a;
const h4 = 0x510e527f;
const h5 = 0x9b05688c;
const h6 = 0x1f83d9ab;
const h7 = 0x5be0cd19;

// Функции SHA-256
function ch(x, y, z) {
  return (x & y) ^ (~x & z);
}

function maj(x, y, z) {
  return (x & y) ^ (x & z) ^ (y & z);
}

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

function sigma0(x) {
  return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
}

function sigma1(x) {
  return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
}

function gamma0(x) {
  return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
}

function gamma1(x) {
  return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
}

// Константы K для SHA-256
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256(message) {
  // Инициализация переменных
  let a = h0;
  let b = h1;
  let c = h2;
  let d = h3;
  let e = h4;
  let f = h5;
  let g = h6;
  let h = h7;

  // Преобразование сообщения в бинарный вид
  const utf8Message = unescape(encodeURIComponent(message));
  const binaryMessage = new TextEncoder().encode(utf8Message);

  // Добавление битов "1" и дополнение нулями
  const bitLength = binaryMessage.length * 8;
  const paddingLength = (512 - ((bitLength + 64) % 512)) % 512;
  const paddedMessage = new Uint8Array(
    binaryMessage.length + paddingLength / 8 + 8
  );
  paddedMessage.set(binaryMessage);
  paddedMessage[binaryMessage.length] = 0x80;
  for (let i = 0; i < 8; i++) {
    paddedMessage[paddedMessage.length - 8 + i] =
      (bitLength >>> (8 * (7 - i))) & 0xff;
  }

  // Обработка блоков сообщения
  for (let offset = 0; offset < paddedMessage.length; offset += 64) {
    const block = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      block[i] =
        (paddedMessage[offset + i * 4] << 24) |
        (paddedMessage[offset + i * 4 + 1] << 16) |
        (paddedMessage[offset + i * 4 + 2] << 8) |
        paddedMessage[offset + i * 4 + 3];
    }

    for (let i = 16; i < 64; i++) {
      block[i] =
        gamma1(block[i - 2]) +
        block[i - 7] +
        gamma0(block[i - 15]) +
        block[i - 16];
    }

    let temp1, temp2;
    for (let i = 0; i < 64; i++) {
      temp1 = h + sigma1(e) + ch(e, f, g) + K[i] + block[i];
      temp2 = sigma0(a) + maj(a, b, c);
      h = g;
      g = f;
      f = e;
      e = d + temp1;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2;
    }

    a = (a + h) >>> 0;
    b = (b + g) >>> 0;
    c = (c + f) >>> 0;
    d = (d + e) >>> 0;
    e = (e + h0) >>> 0;
    f = (f + h1) >>> 0;
    g = (g + h2) >>> 0;
    h = (h + h3) >>> 0;
  }

  // Конкатенация результатов
  const hash = new Uint8Array(32);
  const hashView = new DataView(hash.buffer);
  hashView.setUint32(0, a);
  hashView.setUint32(4, b);
  hashView.setUint32(8, c);
  hashView.setUint32(12, d);
  hashView.setUint32(16, e);
  hashView.setUint32(20, f);
  hashView.setUint32(24, g);
  hashView.setUint32(28, h);

  return hash;
}

// Пример использования
const message = "Hello, world!";
const hash = sha256(message);
console.log(hash);
