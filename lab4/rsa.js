//просто или не простое число
function gcd(a, b) {
    while (b !== 0n) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function generateEncryptionExponent(phi) {
    let e = 47n;

    while (gcd(e, phi) !== 1n) {
        e += 2n;
    }

    return e;
}
//Расширенный алгоритм Евклида
class LinearCombination {
    constructor(value, s, t) {
      this.value = BigInt(value);
      this.s = BigInt(s);
      this.t = BigInt(t);
    }
  }
  
  function extendedGCDRec(x, y) {
    if (y.value === 0n) {
      return x;
    }
  
    const q = x.value / y.value;
    const s = x.s - q * y.s;
    const t = x.t - q * y.t;
  
    const r = new LinearCombination(x.value - q * y.value, s, t);
  
    return extendedGCDRec(y, r);
  }
  
  function extendedGcd(a, b) {
    if (a === 0n && b === 0n) {
      return new LinearCombination(-1, 0, 0);
    }
  
    if (a === 0n) {
      return new LinearCombination(b, 0, 1);
    }
  
    const x = new LinearCombination(a, 1, 0);
    const y = new LinearCombination(b, 0, 1);
  
    return extendedGCDRec(x, y);
  }

function computeDecryptionExponent(e, phi) {
    let d = extendedGcd(e, phi).s;

    while (d < 1n) {
        d += phi;
    }

    return d;
}
//зашифр
function encrypt(m, publicKey) {
    const { e, n } = publicKey;
    //проверка, что сообщение в диапозоне
    if (m < 0n || m >= n) {
        throw new Error(`Condition 0 <= m < n not met. m = ${m}`);
    }

    if (gcd(m, n) !== 1n) {
        throw new Error("Condition gcd(m, n) = 1 not met.");
    }

    const c = m ** e % n;

    return c;
}
//расшиф
function decrypt(c, secretKey) {
    const { d, n } = secretKey;

    const m = c ** d % n;

    return m;
}
//преобразование число в текст
function numberToText(m) {
    let hexNumber = m.toString(16);

    if (hexNumber.length % 2 === 1) {
        hexNumber = "0" + hexNumber;
    }

    const hexChars = hexNumber.match(/\w{2}/g);

    const chars = hexChars.map((hex) =>
        String.fromCodePoint(parseInt(hex, 16))
    );

    const asciiStr = chars.join("");
    const text = decodeURIComponent(asciiStr);

    return text;
}
//преобразование текст в число
function textToNumber(text) {
    const asciiStr = encodeURIComponent(text);
    const chars = asciiStr.split("");

    const hexChars = chars.map((ch) =>
        ch.codePointAt(0).toString(16).padStart(2, "0")
    );

    const hexNumber = hexChars.join("");
    const m = BigInt(`0x${hexNumber}`);

    return m;
}

function rsaExample() {
    const p = 191n;
    const q = 223n;

    const n = p * q;
    const phi = (p - 1n) * (q - 1n);

    const e = generateEncryptionExponent(phi);
    const d = computeDecryptionExponent(e, phi);

    const publicKey = { e, n };
    const secretKey = { d, n };

    const m = textToNumber("Go");
    const c = encrypt(m, publicKey);
    const m2 = decrypt(c, secretKey);

    console.log(numberToText(m2)); //Go
}

rsaExample();