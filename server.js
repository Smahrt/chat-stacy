const express = require('express');

const app = express();

app.use(express.static('./dist/stacy-chatbot'));

app.get('/*', (req, res) =>
  res.sendFile('index.html', {
    root: 'dist/stacy-chatbot/'
  })
);

app.listen(process.env.PORT || 8080);
