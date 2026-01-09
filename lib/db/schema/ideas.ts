import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const ideas = pgTable("ideas", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  bannerImage: text("banner_image"),
  tags: text("tags").array(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

