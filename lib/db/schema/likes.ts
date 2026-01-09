import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const likes = pgTable("likes", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(), // 'project' | 'idea' | 'person' | 'resource' | 'app'
  targetId: text("target_id").notNull(), // references the id of the target entity
  isLike: boolean("is_like").notNull(), // true for like, false for dislike
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

