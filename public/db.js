let db;
// create a new db request for a "budget" database.
const request = window.indexedDB.open("budget", 1)

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  db = event.target.result;
  const pendingStore = db.createObjectStore("pending", {autoIncrement: true});
  pendingStore.createIndex("statusIndex", "status")
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (err) {
  // log error here
  console.log(err)
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  db = request.result;
  const transaction = db.transaction(["pending"], "readwrite")
  // access your pending object store
  const transactionPending = transaction.objectStore("pending")
  // add record to your store with add method.
  transactionPending.add(record)
}

function checkDatabase() {
  // open a transaction on your pending db
  const check = db.transaction(["pending"], "readwrite")
  // access your pending object store
  const checking = check.objectStore("pending")
  // get all records from store and set to a variable
  const getAll = checking.getAll()

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const succesfulTransaction = db.transaction(["pending"], "readwrite")
          // access your pending object store
          const success = succesfulTransaction.objectStore("pending")
          // clear all items in your store
          success.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
