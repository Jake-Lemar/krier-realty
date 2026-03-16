import { eq, desc, and } from 'drizzle-orm';
import { db, isDbConfigured } from '../db/index.js';
import { leads, type Lead, type NewLead } from '../db/schema.js';

// ─── Interface ────────────────────────────────────────────────────────────────
// All consumers program against this. Swap the implementation without touching
// any route or service code.

export interface ILeadRepository {
  create(data: NewLead): Promise<Lead>;
  findAll(opts?: { status?: string; origin?: string; limit?: number; offset?: number }): Promise<{ data: Lead[]; total: number }>;
  findById(id: string): Promise<Lead | null>;
  update(id: string, data: Partial<Pick<Lead, 'status' | 'notes' | 'origin'>>): Promise<Lead | null>;
}

// ─── Drizzle / Postgres implementation ───────────────────────────────────────

export class DrizzleLeadRepository implements ILeadRepository {
  async create(data: NewLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(data).returning();
    return lead;
  }

  async findAll(opts: { status?: string; origin?: string; limit?: number; offset?: number } = {}): Promise<{ data: Lead[]; total: number }> {
    const { status, origin, limit = 25, offset = 0 } = opts;

    const conditions = [
      status ? eq(leads.status, status as Lead['status']) : undefined,
      origin ? eq(leads.origin, origin as Lead['origin']) : undefined,
    ].filter(Boolean) as Parameters<typeof and>;

    const where = conditions.length ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(leads)
        .where(where)
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ id: leads.id })
        .from(leads)
        .where(where),
    ]);

    return { data, total: countResult.length };
  }

  async findById(id: string): Promise<Lead | null> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return lead ?? null;
  }

  async update(id: string, data: Partial<Pick<Lead, 'status' | 'notes' | 'origin'>>): Promise<Lead | null> {
    const [updated] = await db
      .update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated ?? null;
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const leadRepository: ILeadRepository = new DrizzleLeadRepository();
