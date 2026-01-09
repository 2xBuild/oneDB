import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const comments = pgTable("comments", {
  id: text("id").primaryKey().notNull(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(), // 'project' | 'idea'
  targetId: text("target_id").notNull(), // references either project or idea
  parentId: text("parent_id"), // for multi-thread comments (self-reference handled via foreign key constraint in migration)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isEdited: boolean("is_edited").default(false).notNull(), // tracks if comment was edited
});

