import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { people } from "./people";
import { resources } from "./resources";
import { apps } from "./apps";

export const votes = pgTable("votes", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  peopleId: text("people_id").references(() => people.id, { onDelete: "cascade" }),
  resourceId: text("resource_id").references(() => resources.id, { onDelete: "cascade" }),
  appId: text("app_id").references(() => apps.id, { onDelete: "cascade" }),
  voteType: text("vote_type").notNull(), // "upvote" or "downvote"
  reqType: text("req_type").notNull(), // "add", "edit", or "delete"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

