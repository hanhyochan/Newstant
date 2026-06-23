const path = require("path");
const fs = require("fs");
const jsonServer = require("json-server");

const dbPath = path.join(__dirname, "db.json");
const server = jsonServer.create();
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();
const port = Number(process.env.MOCK_API_PORT ?? 4000);
const host = process.env.MOCK_API_HOST;
let isReloadingDb = false;

fs.watchFile(dbPath, { interval: 500 }, () => {
  if (isReloadingDb) {
    return;
  }

  isReloadingDb = true;

  try {
    router.db.read();
  } finally {
    isReloadingDb = false;
  }
});

server.use(middlewares);
server.delete("/recentNewsViews/:id", (req, res) => {
  const collection = router.db.get("recentNewsViews");
  const existingView = collection.find({ id: req.params.id }).value();

  if (!existingView) {
    res.status(404).jsonp({});
    return;
  }

  collection.remove({ id: req.params.id }).write();
  res.status(204).end();
});
server.use(router);

const logServerUrl = (address) => {
  const hostname =
    typeof address === "string" || !address.address || address.address === "::"
      ? "localhost"
      : address.address;

  console.log(`Mock API server is running at http://${hostname}:${port}`);
};

if (host) {
  const listener = server.listen(port, host, () => {
    logServerUrl(listener.address());
  });
} else {
  const listener = server.listen(port, () => {
    logServerUrl(listener.address());
  });
}
