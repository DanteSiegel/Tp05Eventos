import express from 'express';
import config from './src/configs/db-config.js';
import pkg from 'pg';
import eventController from './src/controllers/event-controller.js';

const { Client } = pkg;


const client = new Client(config);
await client.connect();


const app = express();
const port = 3000;


app.use(express.json());


app.use(eventController);


app.get('/provinces', async (req, res) => {
    try {
        const result = await client.query('SELECT * from provinces');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener provincias' });
    }
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
