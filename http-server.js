const express = require('express');
const app = express();
const port = 8887;
const buildLocation = 'dist/selfiemator';
app.use(express.static(buildLocation));
app.use((req, res, next) => {
  if (!req.originalUrl.includes(buildLocation)) {
    res.sendFile(`${__dirname}/${buildLocation}/index.html`);
  } else {
    next();
  }
});
app.listen(port, () => console.info(`Server running on port ${port}`));