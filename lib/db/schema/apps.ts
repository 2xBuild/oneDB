import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const apps = pgTable("apps", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(), // array of tags
  logo: text("logo"),
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // soft delete
});

