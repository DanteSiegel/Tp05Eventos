import express from 'express';
import EventService from '../services/event-service.js';

const router = express.Router();
const eventService = new EventService();

// Endpoint para buscar eventos por nombre
router.get('/api/event/name/:name', async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const eventsData = await eventService.BusquedaEvento(req.params.name, null, null, null, page, pageSize);
        res.status(200).json(eventsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching events.' });
    }
});

// Endpoint para buscar eventos por categoría
router.get('/api/event/category/:category', async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const eventsData = await eventService.BusquedaEvento(null, req.params.category, null, null, page, pageSize);
        res.status(200).json(eventsData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching events.' });
    }
});

// Endpoint para buscar eventos por fecha de inicio
// router.get('/api/event/startdate/:startDate', async (req, res) => {
//     try {
//         const { page = 1, pageSize = 10 } = req.query;
//         const eventsData = await eventService.BusquedaEvento(req.params.startDate);
//         res.status(200).json(eventsData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'An error occurred while fetching events.' });
//     }
// });

// // Endpoint para buscar eventos por tag
// router.get('/api/event/tag/:tag', async (req, res) => {
//     try {
//         const { page = 1, pageSize = 10 } = req.query;
//         const eventsData = await eventService.BusquedaEvento(null, null, null, req.params.tag, page, pageSize);
//         res.status(200).json(eventsData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'An error occurred while fetching events.' });
//     }
// });

// Endpoint para buscar eventos por cualquier combinación de parámetros de búsqueda
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
