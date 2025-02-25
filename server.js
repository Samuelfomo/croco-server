const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'http://localhost';

const permissionAccess = {
    origin : "http://localhost:3000",
}

app.use(cors(permissionAccess));

app.use(express.json());

app.listen(port, () => {
    console.log(`Server running at ${host}:${port}`);
});
