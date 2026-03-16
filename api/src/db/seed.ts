import { db } from './index.js';
import { leads } from './schema.js';

const mockLeads = [
  {
    type: 'buyer' as const,
    name: 'Sarah Thompson',
    email: 'sarah.thompson@example.com',
    phone: '+1-402-555-0101',
    message: 'Looking for a 3-bed, 2-bath home in Omaha under $350k. Prefer west side schools.',
    source: 'homepage-search',
    status: 'new' as const,
  },
  {
    type: 'buyer' as const,
    name: 'Marcus & Jen Alvarez',
    email: 'marcusalvarez@example.com',
    phone: '+1-712-555-0188',
    message: 'First-time buyers, pre-approved up to $425k. Want 4 beds, big yard, Council Bluffs area.',
    source: 'listings-page',
    status: 'contacted' as const,
    notes: 'Called 3/12 — scheduled showing for Sat. Very motivated.',
  },
  {
    type: 'seller' as const,
    name: 'David Reinholt',
    email: 'dreinholt@example.com',
    phone: '+1-402-555-0234',
    address: '4821 Farnam St, Omaha, NE 68132',
    preferredContact: 'phone',
    source: 'sell-page',
    status: 'qualified' as const,
    notes: 'Wants to list in April. Owns free and clear. Needs valuation first.',
  },
  {
    type: 'tour' as const,
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+1-402-555-0319',
    message: 'Interested in scheduling a tour for the property on 72nd St.',
    propertyId: 'prop-omaha-001',
    source: 'property-detail',
    status: 'new' as const,
  },
  {
    type: 'contact' as const,
    name: 'Tom Westerfield',
    email: 'twesterfield@example.com',
    message: 'General inquiry about the market in Carter Lake. Thinking about moving from Lincoln.',
    source: 'contact-page',
    status: 'contacted' as const,
  },
  {
    type: 'buyer' as const,
    name: 'Angela Kowalski',
    email: 'akowalski@example.com',
    phone: '+1-402-555-0477',
    message: 'Relocating from Chicago for work. Need something ready by June 1st. Budget $500k.',
    source: 'chat',
    status: 'qualified' as const,
    notes: 'High urgency. Has corporate relo package. Follow up weekly.',
  },
  {
    type: 'seller' as const,
    name: 'Bob & Linda Gruber',
    email: 'bobgruber@example.com',
    address: '112 Willow Creek Dr, Carter Lake, IA 51510',
    preferredContact: 'email',
    source: 'sell-page',
    status: 'closed' as const,
    notes: 'Listed and sold March 2025. Great clients.',
  },
  {
    type: 'buyer' as const,
    name: 'Devon Park',
    email: 'devon.park@example.com',
    phone: '+1-712-555-0092',
    message: 'Looking for investment property, duplex or triplex preferred, under $300k.',
    source: 'homepage-search',
    status: 'lost' as const,
    notes: 'Went with another agent. Wanted commercial focus we don\'t offer.',
  },
];

async function seed() {
  console.log('Seeding leads…');

  // Clear existing seed data (by email domain) to allow re-running
  await db.delete(leads);
  console.log('Cleared existing leads.');

  const inserted = await db.insert(leads).values(mockLeads).returning({ id: leads.id, name: leads.name });
  console.log(`Inserted ${inserted.length} leads:`);
  inserted.forEach(l => console.log(`  • ${l.name} (${l.id})`));

  console.log('Done.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
