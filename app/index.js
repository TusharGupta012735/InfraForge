const express = require('express');
const os = require('os');
const client = require('prom-client');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    host: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Sample app listening on ${port}`);
  });
}

module.exports = app;
