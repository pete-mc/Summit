import Big from "big.js";
const base300CharacterSet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
  ",.:*$%#()[]{}@!&" +
  "áéíóúñäëïöüÿàèìòùâêîôûçøåßðþħĸłżźšžćđğşļ" +
  "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ" +
  "¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿×÷" +
  "ĀāĂăĄąĆĈĉĊċČčĎďĐĒēĔĕĖėĘęĚěĜĝĞĠġĢģĤĥĦĨĩĪīĬĭĮįİıĲĳĴĵĶķĹĺĻĽľĿŀŁŃńŅņŇňŉŊŋŌōŐőŒœŔŕŖŗŘřŚśŜŝŞŠŢţŤťŦŧ" +
  "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

function removeHyphens(guid: string): string {
  return guid.replace(/-/g, "");
}

function addHyphens(guid: string): string {
  return guid.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

function convertToCustomBase(guid: string, characterSet: string): string {
  let bigGuid = new Big(0);
  for (let i = 0; i < guid.length; i++) {
    const digitValue = parseInt(guid[i], 16);
    bigGuid = bigGuid.times(16).plus(digitValue);
  }
  let result = "";
  const base = new Big(characterSet.length);
  while (bigGuid.gt(0)) {
    const index = bigGuid.mod(base).toNumber();
    result = characterSet[index] + result;
    bigGuid = bigGuid.div(base).round(0, Big.roundDown);
  }
  return result.padStart(16, "0");
}

function convertFromCustomBase(baseStr: string, characterSet: string): string {
  let bigDecimal = new Big(0);
  const base = new Big(characterSet.length);
  for (let i = 0; i < baseStr.length; i++) {
    const index = characterSet.indexOf(baseStr[i]);
    bigDecimal = bigDecimal.times(base).plus(index);
  }
  let hexResult = "";
  while (bigDecimal.gt(0)) {
    const hexDigit = bigDecimal.mod(16).toNumber();
    hexResult = hexDigit.toString(16) + hexResult;
    bigDecimal = bigDecimal.div(16).round(0, Big.roundDown);
  }
  return hexResult.padStart(32, "0");
}

export function processGuids(guids: string[], batchSize: number = 62): string[] {
  const batchedGuids: string[] = [];
  for (let i = 0; i < guids.length; i += batchSize) {
    const batch = guids.slice(i, i + batchSize);
    const convertedBatch = batch.map((guid) => convertToCustomBase(removeHyphens(guid), base300CharacterSet)).join("");
    batchedGuids.push(convertedBatch);
  }
  return batchedGuids;
}

export function reconstructGuids(compressedBatches: string[]): string[] {
  return compressedBatches.flatMap((compressedBatch) => {
    const regexPattern = /.{16}/g;
    const matches = compressedBatch.match(regexPattern) ?? [];
    return matches.map((baseStr) => addHyphens(convertFromCustomBase(baseStr, base300CharacterSet)));
  });
}
