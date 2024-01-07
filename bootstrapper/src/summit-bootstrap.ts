import summitJS from "./summit.js?raw";
import $ from "jquery";

async function openIndexedDB(dbName: string, storeName: string): Promise<IDBDatabase> {
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

async function saveToIndexedDB(db: IDBDatabase, storeName: string, data: string, id: string): Promise<void> {
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

function compareVersions(versionA: string, versionB: string): boolean {
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

async function summitBootstrap() {
  const jarVersion = summitJS?.match(/Summit Version: \"(.*)\"/)?.[1];
  const summitVersion = localStorage.getItem("summit-version");

  if (!summitVersion || (jarVersion && compareVersions(summitVersion, jarVersion)) || process.env.SUMMITBUILD === "dev") {
    const dbName = "TerrainSummit";
    const storeName = "JSStore";
    const id = "summitJS";
    const db = await openIndexedDB(dbName, storeName);
    await saveToIndexedDB(db, storeName, summitJS, id);
    localStorage.setItem("summit-version", jarVersion || "");
  }

  const onclickCode = `
    (async function() {
      function openIndexedDB(dbName, storeName) {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName, 1);
          request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore(storeName);
          };
          request.onsuccess = function(event) {
            resolve(event.target.result);
          };
          request.onerror = function(event) {
            reject(event.target.error);
          };
        });
      }

      function readFromIndexedDB(db, storeName, id) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(id);
          request.onsuccess = function(event) {
            console.debug(event);
            resolve(event.target.result);
          };
          request.onerror = function(event) {
            reject(event.target.error);
          };
        });
      }
      const db = await openIndexedDB('TerrainSummit', 'JSStore');
      const scriptData = await readFromIndexedDB(db, 'JSStore', 'summitJS');
      if (scriptData) {
        const summitScript = document.createElement('script');
        summitScript.id = 'summit-script';
        summitScript.innerHTML = scriptData;
        summitScript.async = true;
        document.head.appendChild(summitScript);
      } else {
        console.error('No data in IndexedDB');
      }

      $nuxt.$router.push({ path: $nuxt.$route.fullPath, query: { Summit: true } });
    })();
  `;

  $(`<button style="display: none;" onclick="${onclickCode}"/>`).appendTo("body").trigger("click").remove();
}

summitBootstrap();
