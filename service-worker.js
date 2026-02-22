self.addEventListener("install", e => {
e.waitUntil(
caches.open("erp-cache").then(cache => {
return cache.addAll([
"./",
"./index.html",
"./dashboard.html",
"./pos.html",
"./css/style.css"
]);
})
);
});