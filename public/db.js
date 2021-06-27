let db;

const indexedDB =
  window.indexedDB

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
  db = target.result;

  if (navigator.onLine) {
    viewDatabase();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveTransaction(save) {
  const transaction = db.transaction(["pending"], "readwrite");
  const storeObject = transaction.objectStore("pending");

  storeObject.add(save);
}

function viewDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const storeObject = transaction.objectStore("pending");
  const getAll = storeObject.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => {
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const storeObject = transaction.objectStore("pending");
          storeObject.clear();
        });
    }
  };
}

window.addEventListener("online", viewDatabase);