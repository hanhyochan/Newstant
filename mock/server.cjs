const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();
const port = Number(process.env.MOCK_API_PORT ?? 4000);
const host = process.env.MOCK_API_HOST;

server.use(middlewares);
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
