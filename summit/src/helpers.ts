import { TerrainCache } from "../typings/summitTypes";
import $ from "jquery";
import { TerrainCacheData } from "../typings/terrainTypes";
import moment from "moment";
import Big from "big.js";

//function to initiate a local store for caching data with an array of items containing Type, Data & TTL
export function initCache(): void {
  if (localStorage.getItem("SummitTerrainCache") === null) {
    localStorage.setItem("SummitTerrainCache", JSON.stringify([]));
  }
  //clear cache items if it is older than 5 mins
  const cache: TerrainCache = JSON.parse(localStorage.getItem("SummitTerrainCache") || "[]");
  const now = moment().unix();
  cache.forEach((item) => {
    if (item.ttl < now) {
      clearCacheItem(item.type);
    }
  });
}

export function compareVersions(versionA: string, versionB: string): boolean {
  const aParts = versionA.split(".").map(Number);
  const bParts = versionB.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal > bVal) return false;
    if (aVal < bVal) return true;
  }
  return false;
}

//function to add an item to the cache
export function addToCache(type: string, data: TerrainCacheData, ttl: number): TerrainCacheData {
  const cache = JSON.parse(localStorage.getItem("SummitTerrainCache") || "[]");
  cache.push({ type: type, data: data, ttl: moment().unix() + ttl });
  localStorage.setItem("SummitTerrainCache", JSON.stringify(cache));
  //trigger to clear this item from cache when ttl expires
  setTimeout(() => {
    clearCacheItem(type);
  }, ttl * 1000);
  return data;
}

//function to clear an item from the cache
export function clearCacheItem(type: string): void {
  let cache: TerrainCache = JSON.parse(localStorage.getItem("SummitTerrainCache") || "[]");
  cache = cache.filter((item) => item.type !== type);
  localStorage.setItem("SummitTerrainCache", JSON.stringify(cache));
}

//function to clear the cache
export function clearCache() {
  if (localStorage.getItem("SummitTerrainCache") != null) {
    localStorage.removeItem("SummitTerrainCache");
  }
  localStorage.setItem("SummitTerrainCache", JSON.stringify([]));
}

//function to get a cache item
export function getCacheItem(type: string): unknown {
  initCache();
  const cache: TerrainCache = JSON.parse(localStorage.getItem("SummitTerrainCache") || "[]");
  const cacheItem = cache.find((item) => item.type === type);
  if (cacheItem) {
    return cacheItem.data;
  }
  return undefined;
}

// Function to get a random color
export function getRandomColor(): string {
  return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},1)`;
}

//xpath jquery function
$.fn.xpath = function (expr) {
  const found = [];
  const context = this[0];
  const result = document.evaluate(expr, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  let node;
  while ((node = result.iterateNext())) {
    found.push(node);
  }
  return $(found);
};

// Function to throttle other functions
export function throttle(func: (...args: unknown[]) => void, limit: number): (...args: unknown[]) => void {
  let lastRan: number;
  let lastFunc: NodeJS.Timeout;
  return function debounced(this: unknown, ...args: unknown[]): void {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan),
      );
    }
  };
}
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
    const regexPattern = new RegExp(".{16}", "g");
    const matches = compressedBatch.match(regexPattern) || [];
    return matches.map((baseStr) => addHyphens(convertFromCustomBase(baseStr, base300CharacterSet)));
  });
}

export async function openIndexedDB(dbName: string, storeName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
      const db = (event.target as IDBRequest).result as IDBDatabase;
      db.createObjectStore(storeName);
    };

    request.onsuccess = function (event) {
      resolve((event.target as IDBRequest).result as IDBDatabase);
    };

    request.onerror = function (event) {
      if (event.target) {
        reject((event.target as IDBRequest).error);
      }
    };
  });
}

export async function saveToIndexedDB(db: IDBDatabase, storeName: string, data: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(data, id);

    request.onsuccess = function () {
      resolve();
    };

    request.onerror = function (event) {
      reject((event.target as IDBRequest).error);
    };
  });
}
