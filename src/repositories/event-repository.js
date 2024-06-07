import pg from "pg";
import { DBconfig } from "../../src/configs/db-config.js";

export default class EventRepository {
    constructor() {
        const { Client } = pg;
        this.DBClient = new Client(DBconfig);
        this.DBClient.connect();
    }

    async BusquedaEvento(name, category, startDate, tag, page, pageSize) {
        const intPage = parseInt(page);
        const intPageSize = parseInt(pageSize);

        let queryAgregado = '';
        if (name) queryAgregado += `AND e.name = '${name}' `;
        if (startDate) queryAgregado += `AND e.start_date = '${startDate}' `;
        if (category) queryAgregado += `AND ec.name = '${category}' `;
        if (tag) queryAgregado += `AND t.name = '${tag}' `;

        const sql = `
            SELECT e.id, e.name, e.description, e.start_date, e.duration_in_minutes, e.price, e.enabled_for_enrollment, e.max_assistance,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'first_name', u.first_name,
                'last_name', u.last_name
            ) as creator,
            json_build_object(
                'id', ec.id,
                'name', ec.name
            ) as category,
            json_build_object(
                'id', el.id,
                'name', el.name,
                'full_address', el.full_address,
                'latitude', el.latitude,
                'longitude', el.longitude,
                'max_capacity', el.max_capacity
            ) as event_location,
            json_build_object(
                'id', l.id,
                'name', l.name,
                'latitude', l.latitude,
                'longitude', l.longitude
            ) as location,
            json_build_object(
                'id', p.id,
                'name', p.name,
                'full_name', p.full_name,
                'latitude', p.latitude,
                'longitude', p.longitude,
                'display_order', p.display_order
            ) as province,
            array_agg(
                json_build_object(
                    'id', t.id,
                    'name', t.name
                )
            ) as tags  
            FROM events e
            JOIN users u ON e.id_creator_user = u.id
            JOIN event_categories ec ON e.id_event_category = ec.id
            JOIN event_tags et ON e.id = et.id_event
            JOIN tags t ON et.id_tag = t.id
            JOIN event_locations el ON e.id_event_location = el.id 
            JOIN locations l ON el.id_location = l.id
            JOIN provinces p ON l.id_province = p.id
            WHERE 1=1 ${queryAgregado}
            GROUP BY e.id, u.id, ec.id, el.id, l.id, p.id
            LIMIT ${intPageSize} OFFSET ${(intPage - 1) * intPageSize};
        `;
        const response = await this.DBClient.query(sql);
        return response.rows;
    }

    async DetalleEvento(id) {
        const sql = `
            SELECT e.id, e.name, e.description, e.start_date, e.duration_in_minutes, e.price, e.enabled_for_enrollment, e.max_assistance,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'first_name', u.first_name,
                'last_name', u.last_name
            ) as creator,
            json_build_object(
                'id', ec.id,
                'name', ec.name
            ) as category,
            json_build_object(
                'id', el.id,
                'name', el.name,
                'full_address', el.full_address,
                'latitude', el.latitude,
                'longitude', el.longitude,
                'max_capacity', el.max_capacity
            ) as event_location,
            json_build_object(
                'id', l.id,
                'name', l.name,
                'latitude', l.latitude,
                'longitude', l.longitude
            ) as location,
            json_build_object(
                'id', p.id,
                'name', p.name,
                'full_name', p.full_name,
                'latitude', p.latitude,
                'longitude', p.longitude,
                'display_order', p.display_order
            ) as province,
            array_agg(
                json_build_object(
                    'id', t.id,
                    'name', t.name
                )
            ) as tags
            FROM events e
            JOIN users u ON e.id_creator_user = u.id
            JOIN event_categories ec ON e.id_event_category = ec.id
            JOIN event_tags et ON e.id = et.id_event
            JOIN tags t ON et.id_tag = t.id
            JOIN event_locations el ON e.id_event_location = el.id 
            JOIN locations l ON el.id_location = l.id
            JOIN provinces p ON l.id_province = p.id
            WHERE e.id = $1
            GROUP BY e.id, u.id, ec.id, el.id, l.id, p.id;
        `;
        const response = await this.DBClient.query(sql, [id]);
        return response.rows[0];
    }

    async listaUsuarios(id, first, last, username, attended, rating) {
        let queryAgregado = "";
        if (first) {
            queryAgregado += `AND u.first_name = '${first}' `;
        }
        if (last) {
            queryAgregado += `AND u.last_name = '${last}' `;
        }
        if (username) {
            queryAgregado += `AND u.username = '${username}' `;
        }
        if (attended) {
            queryAgregado += `AND er.attended = '${attended}' `;
        }
        if (rating) {
            queryAgregado += `AND er.rating = '${rating}' `;
        }

        const sql = `
            SELECT er.id, er.id_event, er.id_user, er.description, er.attended, er.rating,
            json_build_object(
                'id', u.id,
                'first_name', u.first_name,
                'last_name', u.last_name,
                'username', u.username
            ) AS user
            FROM users u
            JOIN event_enrollments er ON er.id_user = u.id
            JOIN events e ON e.id = er.id_event
            WHERE e.id = $1 ${queryAgregado}
        `;
        const response = await this.DBClient.query(sql, [id]);
        return response.rows;
    }

    async crearEvent(eventData) {
        const { name, description, id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user } = eventData;
        const sql = `
            INSERT INTO events (name, description, id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const { rows } = await this.DBClient.query(sql, [name, description, id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, id_creator_user]);
        return rows[0];
    }

    async getEventById(eventId) {
        const sql = `
            SELECT * FROM events
            WHERE id = $1
        `;
        const { rows } = await this.DBClient.query(sql, [eventId]);
        return rows[0];
    }

    async putEvent(eventId, eventData) {
        const { name, description, id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance } = eventData;
        const sql = `
            UPDATE events
            SET name = $1, description = $2, id_event_category = $3, id_event_location = $4, start_date = $5, duration_in_minutes = $6, price = $7, enabled_for_enrollment = $8, max_assistance = $9
            WHERE id = $10
            RETURNING *
        `;
        const { rows } = await this.DBClient.query(sql, [name, description, id_event_category, id_event_location, start_date, duration_in_minutes, price, enabled_for_enrollment, max_assistance, eventId]);
        return rows[0];
    }

    async borrarEvent(eventId) {
        const sql = `
            DELETE FROM events
            WHERE id = $1
        `;
        await this.DBClient.query(sql, [eventId]);
        return { message: 'Event deleted successfully' };
    }

    async registerUser(id_event, id_user) {
        const sql = `
            INSERT INTO event_enrollments (id_event, id_user)
            VALUES ($1, $2)
            RETURNING *
        `;
        const { rows } = await this.DBClient.query(sql, [id_event, id_user]);
        return rows[0];
    }

    async unregisterUser(id_event, id_user) {
        const sql = `
            DELETE FROM event_enrollments
            WHERE id_event = $1 AND id_user = $2
        `;
        await this.DBClient.query(sql, [id_event, id_user]);
        return { message: 'User unregistered successfully' };
    }

    async ratingEvento(id_event, rating) {
        const sqlCheck = `
            SELECT * FROM event_enrollments
            WHERE id_event = $1 AND id_user = $2
        `;
        const userId = req.user.id;  // Assuming user ID is available in the request
        const resultCheck = await this.DBClient.query(sqlCheck, [id_event, userId]);
        if (resultCheck.rowCount === 0) {
            throw new Error("User not enrolled in the event");
        }
        const sql = `
            UPDATE event_enrollments
            SET rating = $1
            WHERE id_event = $2 AND id_user = $3
            RETURNING *
        `;
        const { rows } = await this.DBClient.query(sql, [rating, id_event, userId]);
        return rows[0];
    }
}
