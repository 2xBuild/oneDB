import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const people = pgTable("people", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  socialMediaPlatform: text("social_media_platform").notNull(),
  socialMediaLink: text("social_media_link").notNull(),
  tags: text("tags").array(), // array of tags
  image: text("image"),
  followersCount: integer("followers_count"), // follower/subscriber count
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // soft delete
});

