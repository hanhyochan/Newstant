const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();
const port = Number(process.env.MOCK_API_PORT ?? 4000);
const host = process.env.MOCK_API_HOST ?? "127.0.0.1";

server.use(middlewares);
server.use(router);

server.listen(port, host, () => {
  console.log(`Mock API server is running at http://${host}:${port}`);
});
