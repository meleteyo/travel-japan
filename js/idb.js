/* idb.js — tiny IndexedDB wrapper for on-device document captures.
   Images never leave the device; nothing is uploaded or committed. */
window.App = window.App || {};
(function (A) {
  'use strict';
  const DB = 'tj-docs', STORE = 'docs', VER = 1;
  let _db = null;

  function open() {
    return new Promise((res, rej) => {
      if (_db) return res(_db);
      if (typeof indexedDB === 'undefined') return rej(new Error('no-idb'));
      const r = indexedDB.open(DB, VER);
      r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
      r.onsuccess = () => { _db = r.result; res(_db); };
      r.onerror = () => rej(r.error);
    });
  }
  function store(mode) { return open().then((db) => db.transaction(STORE, mode).objectStore(STORE)); }
  function wrap(req) { return new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); }

  A.idb = {
    available() { return typeof indexedDB !== 'undefined'; },
    get(key) { return store('readonly').then((s) => wrap(s.get(key))); },
    set(key, val) { return store('readwrite').then((s) => wrap(s.put(val, key))); },
    del(key) { return store('readwrite').then((s) => wrap(s.delete(key))); },
    keys() { return store('readonly').then((s) => wrap(s.getAllKeys())); },
  };
})(window.App);
