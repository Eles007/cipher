import {desEncryptBlock} from './des.js';

//хэш-функция на основе DES
function simpleHash(message, key) {
  //преобразование сообщения в блоки длиной 64 бита
  const blocks = [];
  for (let i = 0; i < message.length; i += 8) {
    const block = message.slice(i, i + 8).padEnd(8, '\0');
    blocks.push(parseInt(block, 2));
  }

  //инициализация хеша
  let hash = 0;

  //щифрование каждого блока с использованием DES и обновление хеша
  for (const block of blocks) {
    hash = desEncryptBlock(hash ^ block, key);
  }

  return hash;
}

//пример использования
const message = "Hello, World!";
const key = 0b1111000011001100111100001100110011110000110011001111000011001100;

const hashValue = simpleHash(message, key);
console.log("Хэш-значение:", hashValue.toString(16).padStart(16, '0'));