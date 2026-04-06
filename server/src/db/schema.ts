import { pgTable, serial, text, integer, timestamp, varchar, jsonb, primaryKey, date, boolean } from 'drizzle-orm/pg-core';

// --- Better Auth Tables (Standard) ---
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});


export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

// --- App Specific Tables ---

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey().references(() => user.id),
  targetUniversity: varchar("target_university", { length: 255 }),
  targetMajor: varchar("target_major", { length: 255 }),
  targetScore: integer("target_score").default(0),
});

export const syllabusCategories = pgTable("syllabus_categories", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
});

export const syllabusTopics = pgTable("syllabus_topics", {
  id: varchar("id", { length: 50 }).primaryKey(),
  categoryId: varchar("category_id", { length: 50 }).notNull().references(() => syllabusCategories.id),
  name: varchar("name", { length: 100 }).notNull(),
});

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").notNull().references(() => user.id),
  topicId: varchar("topic_id", { length: 50 }).notNull().references(() => syllabusTopics.id),
  status: varchar("status", { length: 20 }).notNull().default('belum'), // 'belum', 'teori', 'latihan', 'mastered'
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return [
    primaryKey({ columns: [table.userId, table.topicId] }),
  ];
});

export const tryouts = pgTable("tryouts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  date: date("date").notNull(),
  totalScore: integer("total_score").notNull(),
  scores: jsonb("scores").notNull(), // { pu: 700, pbm: 650, ... }
});

export const errorLogs = pgTable("error_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  date: date("date").notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  reason: text("reason").notNull(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  date: timestamp("date").notNull().defaultNow(),
  duration: integer("duration").notNull(), // in seconds
  topic: varchar("topic", { length: 100 }),
});
