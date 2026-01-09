import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const projects = pgTable("projects", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  tagline: text("tagline"), // optional for backward compatibility, but required for new submissions
  description: text("description"),
  githubLink: text("github_link"),
  liveLink: text("live_link"),
  projectImage: text("project_image"),
  tags: text("tags").array(),
  status: text("status").notNull().default("published"), // published, archived
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

