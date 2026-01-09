import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts } from "./accounts";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

