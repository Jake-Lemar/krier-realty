import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const leadTypeEnum   = pgEnum('lead_type',   ['buyer', 'seller', 'contact', 'tour']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'closed', 'lost']);
export const leadOriginEnum = pgEnum('lead_origin', [
  'website', 'manual', 'zillow', 'realtor_com', 'facebook', 'referral', 'cold_call', 'other',
]);

export const leads = pgTable('leads', {
  id:               uuid('id').primaryKey().defaultRandom(),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  type:             leadTypeEnum('type').notNull(),
  name:             text('name').notNull(),
  email:            text('email').notNull(),
  phone:            text('phone'),
  message:          text('message'),
  propertyId:       text('property_id'),
  address:          text('address'),
  preferredContact: text('preferred_contact'),
  source:           text('source'),
  origin:           leadOriginEnum('origin').notNull().default('website'),
  status:           leadStatusEnum('status').notNull().default('new'),
  notes:            text('notes'),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
