import EventRepository from '../repositories/event-repository.js';

export default class EventService {
    BusquedaEvento = async (name, category, startDate, tag, page, pageSize) => {
        const repo = new EventRepository();
        const returnArray = await repo.BusquedaEvento(name, category, startDate, tag, page, pageSize);
        return {
            collection: returnArray,
            pageSize: pageSize,
            page: page,
            nextPage: `http://localhost:3000/api/event?limit=${parseInt(pageSize)}&offset=${parseInt(page) + pageSize}`,
        };
    }
//Falta buscar evento por fecha
    DetalleEvento = async (id) => {
        const repo = new EventRepository();
        const returnArray = await repo.DetalleEvento(id);
        return returnArray;
    }

    async listaUsuarios(id, first, last, username, attended, rating) {
        const repo = new EventRepository();
        const users = await repo.listaUsuarios(id, first, last, username, attended, rating);
        return users;
    }

    async crearEvent(eventData) {
        const repo = new EventRepository();
        const newEvent = await repo.crearEvent(eventData);
        return newEvent;
    }

    async getEventById(eventId) {
        const repo = new EventRepository();
        const event = await repo.getEventById(eventId);
        return event;
    }

    async putEvent(eventId, eventData) {
        const repo = new EventRepository();
        const updatedEvent = await repo.putEvent(eventId, eventData);
        return updatedEvent;
    }

    async borrarEvent(eventId) {
        const repo = new EventRepository();
        const result = await repo.borrarEvent(eventId);
        return result;
    }

    async registerUser(eventId, userId) {
        const repo = new EventRepository();
        const registration = await repo.registerUser(eventId, userId);
        return registration;
    }

    async unregisterUser(eventId, userId) {
        const repo = new EventRepository();
        const result = await repo.unregisterUser(eventId, userId);
        return result;
    }

    async ratingEvento(eventId, rating) {
        const repo = new EventRepository();
        const result = await repo.ratingEvento(eventId, rating);
        return result;
    }

    async desencriptarToken(vtoken) {
        const secretKey = 'UmDoisTreisTriesDoisUmoTodoMundoSobreDoisRaizEmCadaUno';
        let token = vtoken;
        let payloadOriginal = null;
        try {
            payloadOriginal = await jwt.verify(token, secretKey);
        } catch (e) {
            console.error(e);
        }
        return payloadOriginal;
    }
}
