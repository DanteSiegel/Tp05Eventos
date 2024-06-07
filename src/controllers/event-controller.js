import express from 'express';
import EventService from '../services/event-service.js';

const router = express.Router();
const eventService = new EventService();

router.get('/api/event', async (req, res) => {
    try {
        const { name, category, startDate, tag, page = 1, pageSize = 10 } = req.query;

        const eventsData = await eventService.BusquedaEvento(name, category, startDate, tag, page, pageSize);

        res.status(200).json(eventsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching events.' });
    }
});

export default router;
