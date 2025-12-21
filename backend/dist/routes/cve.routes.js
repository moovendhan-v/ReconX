"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const client_1 = require("../redis/client");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const search = req.query.search;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const cacheKey = `cves:list:${search || 'all'}:${page}:${limit}`;
        const cached = await client_1.redis.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        let query = db_1.db.select().from(db_1.schema.cves).orderBy((0, drizzle_orm_1.desc)(db_1.schema.cves.publishedDate));
        if (search) {
            query = query.where((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.schema.cves.cveId, `%${search}%`), (0, drizzle_orm_1.ilike)(db_1.schema.cves.title, `%${search}%`), (0, drizzle_orm_1.ilike)(db_1.schema.cves.description, `%${search}%`)));
        }
        const cves = await query.limit(limit).offset(offset);
        const result = { cves, page, limit, total: cves.length };
        await client_1.redis.set(cacheKey, JSON.stringify(result), 300);
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching CVEs:', error);
        res.status(500).json({ error: 'Failed to fetch CVEs' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cve = await db_1.db.query.cves.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.schema.cves.id, id),
            with: {
                pocs: true,
            },
        });
        if (!cve) {
            return res.status(404).json({ error: 'CVE not found' });
        }
        res.json(cve);
    }
    catch (error) {
        console.error('Error fetching CVE:', error);
        res.status(500).json({ error: 'Failed to fetch CVE' });
    }
});
router.post('/', async (req, res) => {
    try {
        const newCve = await db_1.db.insert(db_1.schema.cves).values(req.body).returning();
        const keys = await client_1.redis.getClient().keys('cves:list:*');
        if (keys.length > 0) {
            await Promise.all(keys.map(key => client_1.redis.del(key)));
        }
        res.status(201).json(newCve[0]);
    }
    catch (error) {
        console.error('Error creating CVE:', error);
        res.status(500).json({ error: 'Failed to create CVE' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await db_1.db
            .update(db_1.schema.cves)
            .set({ ...req.body, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(db_1.schema.cves.id, id))
            .returning();
        if (!updated.length) {
            return res.status(404).json({ error: 'CVE not found' });
        }
        const keys = await client_1.redis.getClient().keys('cves:*');
        if (keys.length > 0) {
            await Promise.all(keys.map(key => client_1.redis.del(key)));
        }
        res.json(updated[0]);
    }
    catch (error) {
        console.error('Error updating CVE:', error);
        res.status(500).json({ error: 'Failed to update CVE' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db_1.db.delete(db_1.schema.cves).where((0, drizzle_orm_1.eq)(db_1.schema.cves.id, id)).returning();
        if (!deleted.length) {
            return res.status(404).json({ error: 'CVE not found' });
        }
        const keys = await client_1.redis.getClient().keys('cves:*');
        if (keys.length > 0) {
            await Promise.all(keys.map(key => client_1.redis.del(key)));
        }
        res.json({ message: 'CVE deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting CVE:', error);
        res.status(500).json({ error: 'Failed to delete CVE' });
    }
});
exports.default = router;
//# sourceMappingURL=cve.routes.js.map