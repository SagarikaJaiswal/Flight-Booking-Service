const express = require('express');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const { scheduleCron } = require('./utils/common/cron');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', apiRoutes);

scheduleCron();

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
});