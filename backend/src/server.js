require('dotenv').config({ override: true });
const http = require('http');
const app = require('./app');
const { connectToDatabase } = require('./config/db');
const { initializeRealtime } = require('./services/realtime');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectToDatabase();
  const server = http.createServer(app);
  initializeRealtime(server);
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});


