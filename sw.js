'use strict';
const CACHE_PREFIX = 'iskra-arena-';
const VERSION = 'iskra-arena-pandi-v2.5';
const APP_ROOT = new URL('./', self.registration.scope);
const FILES = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './art.js',
  './game.js',
  './SupercellHeadline-Heavy.ttf',
  './SupercellText_Bd.ttf',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './manifest.webmanifest'
];
const resources = FILES.map(p => new URL(p, APP_ROOT).href);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(resources))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== APP_ROOT.origin || !url.href.startsWith(APP_ROOT.href)) return;

  event.respondWith(
    fetch(request).then(resp => {
      if (resp.ok) {
        const clone = resp.clone();
        caches.open(VERSION).then(cache => cache.put(request, clone));
      }
      return resp;
    }).catch(() =>
      caches.match(request, { ignoreSearch: true }).then(hit =>
        hit || (request.mode === 'navigate' ? caches.match(new URL('./index.html', APP_ROOT).href, { ignoreSearch: true }) : Response.error())
      )
    )
  );
});
