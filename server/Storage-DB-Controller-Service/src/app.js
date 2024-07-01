require('dotenv').config();
const express = require('express');
const app = express();
const uploadRoutes = require('./routes/upload');

// Root route to confirm that the server is running
app.get('/', (req, res) => {
  res.send('The Service is running!');
});

app.use('/api', uploadRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
