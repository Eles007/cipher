let textElement = document.getElementById("input-text-cipher");
let numberElement = document.getElementById("input-number-cipher");
let errorText = document.getElementById("errorText");
let outputElement = document.getElementById("output-text-cipher");
let selectElement = document.querySelector(".box select");
let selectBreakElement = document.querySelector(".box-break select");
let textBreakElement = document.getElementById("input-text-break-cipher");

function changeColorInput() {
  textElement.style.borderColor = "#3498db";
}

function getDigit() {
  if (numberElement.value === "") {
    textElement.style.borderColor = "red";
    errorText.textContent = "Введите шаг!";
    textElement.disabled = true;
  } else {
    textElement.style.borderColor = "#68b9f0";
    errorText.textContent = "";
    textElement.disabled = false;
  }
  return numberElement.value;
}

function caesarCipherEng() {
  const str = textElement.value;
  const shift = +getDigit();

  if (shift < 0) {
    shift = 26 + (shift % 26);
  }

  let result = "";

  for (let i = 0; i < str.length; i++) {
    let char = str[i];

    if (char.match(/[a-z]/i)) {
      const isLowerCase = char === char.toLowerCase();
      const alphabetStart = isLowerCase ? "a".charCodeAt(0) : "A".charCodeAt(0);
      char = String.fromCharCode(
        ((char.charCodeAt(0) - alphabetStart + shift) % 26) + alphabetStart
      );
    }

    result += char;
  }

  return result;
}

function caesarCipherRus() {
  let input = textElement.value;

  let shift = +getDigit() % 33; // Убедимся, что сдвиг находится в диапазоне от 0 до 33
  const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
  const inputArray = input.split("");

  const resultArray = inputArray.map((char) => {
    if (char.match(/[А-Я]/i)) {
      const isLowerCase = char === char.toLowerCase();
      let index = alphabet.indexOf(char.toUpperCase()) + shift;
      if (index < 0) {
        index += 33; // Обрабатываем отрицательный сдвиг
      }
      let shiftedChar = alphabet[index % 33];
      if (isLowerCase) {
        shiftedChar = shiftedChar.toLowerCase();
      }
      return shiftedChar;
    } else {
      return char;
    }
  });

  return resultArray.join("");
}

function encryptAndValidate() {
  let result = "";
  let selectedOption = selectElement.options[selectElement.selectedIndex];

  if (selectedOption.value == "ru") {
    result = caesarCipherRus();
  } else {
    result = caesarCipherEng();
  }

  outputElement.textContent = result;
  textBreakElement.value = result;

  return outputElement.textContent;
}

/*-взлом-*/

function breakCipherEng() {
  let ciphertext = textBreakElement.value;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const results = [];

  for (let shift = 1; shift <= 25; shift++) {
    let decryptedText = "";
    for (let i = 0; i < ciphertext.length; i++) {
      const char = ciphertext[i];
      if (char === " ") {
        decryptedText += " ";
        continue;
      }
      const charIndex = alphabet.indexOf(char.toUpperCase());
      if (charIndex !== -1) {
        const newIndex = (charIndex - shift + 26) % 26;
        const decryptedChar = alphabet[newIndex];
        decryptedText +=
          char === char.toLowerCase()
            ? decryptedChar.toLowerCase()
            : decryptedChar;
      } else {
        decryptedText += char;
      }
    }
    results.push(decryptedText);
  }

  return results;
}

function breakCipherRus() {
  let ciphertext = textBreakElement.value;
  const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
  const results = [];

  for (let shift = 1; shift <= 32; shift++) {
    let decryptedText = "";
    for (let i = 0; i < ciphertext.length; i++) {
      const char = ciphertext[i];
      if (char === " ") {
        decryptedText += " ";
        continue;
      }
      const charIndex = alphabet.indexOf(char.toUpperCase());
      if (charIndex !== -1) {
        const newIndex = (charIndex - shift + 33) % 33;
        const decryptedChar = alphabet[newIndex];
        decryptedText +=
          char === char.toLowerCase()
            ? decryptedChar.toLowerCase()
            : decryptedChar;
      } else {
        decryptedText += char;
      }
    }
    results.push(decryptedText);
  }

  return results;
}

function displayAndBreakCipher() {
  let selectedOption =
    selectBreakElement.options[selectBreakElement.selectedIndex];

  if (selectedOption.value == "ru") {
    result = breakCipherRus();
  } else {
    result = breakCipherEng();
  }

  let targetDiv = document.getElementById("text-output-break-cipher");

  targetDiv.innerHTML = "";

  for (let i = 0; i < result.length; i++) {
    let p = document.createElement("p");
    p.innerHTML = `Шаг сдвига(${i + 1}):<b>${result[i]}</b>`;
    targetDiv.appendChild(p);
  }

  console.log(result);
}
