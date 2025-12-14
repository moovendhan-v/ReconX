import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { eq, desc, ilike, or } from 'drizzle-orm';
import { redis } from '../redis/client';

const router = Router();

// Get all CVEs with optional search and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Try cache first
    const cacheKey = `cves:list:${search || 'all'}:${page}:${limit}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    let query = db.select().from(schema.cves).orderBy(desc(schema.cves.publishedDate));

    if (search) {
      query = query.where(
        or(
          ilike(schema.cves.cveId, `%${search}%`),
          ilike(schema.cves.title, `%${search}%`),
          ilike(schema.cves.description, `%${search}%`)
        )
      ) as any;
    }

    const cves = await query.limit(limit).offset(offset);

    const result = { cves, page, limit, total: cves.length };
    
    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(result), 300);

    res.json(result);
  } catch (error) {
    console.error('Error fetching CVEs:', error);
    res.status(500).json({ error: 'Failed to fetch CVEs' });
  }
});

// Get single CVE by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cve = await db.query.cves.findFirst({
      where: eq(schema.cves.id, id),
      with: {
        pocs: true,
      },
    });

    if (!cve) {
      return res.status(404).json({ error: 'CVE not found' });
    }

    res.json(cve);
  } catch (error) {
    console.error('Error fetching CVE:', error);
    res.status(500).json({ error: 'Failed to fetch CVE' });
  }
});

// Create new CVE
router.post('/', async (req: Request, res: Response) => {
  try {
    const newCve = await db.insert(schema.cves).values(req.body).returning();

    // Invalidate cache
    const keys = await redis.getClient().keys('cves:list:*');
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
    }

    res.status(201).json(newCve[0]);
  } catch (error) {
    console.error('Error creating CVE:', error);
    res.status(500).json({ error: 'Failed to create CVE' });
  }
});

// Update CVE
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await db
      .update(schema.cves)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(schema.cves.id, id))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: 'CVE not found' });
    }

    // Invalidate cache
    const keys = await redis.getClient().keys('cves:*');
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating CVE:', error);
    res.status(500).json({ error: 'Failed to update CVE' });
  }
});

// Delete CVE
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await db.delete(schema.cves).where(eq(schema.cves.id, id)).returning();

    if (!deleted.length) {
      return res.status(404).json({ error: 'CVE not found' });
    }

    // Invalidate cache
    const keys = await redis.getClient().keys('cves:*');
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
    }

    res.json({ message: 'CVE deleted successfully' });
  } catch (error) {
    console.error('Error deleting CVE:', error);
    res.status(500).json({ error: 'Failed to delete CVE' });
  }
});

export default router;
