export * from "./users";
export * from "./accounts";
export * from "./projects";
export * from "./ideas";
export * from "./comments";
export * from "./likes";
export * from "./people";
export * from "./resources";
export * from "./apps";
export * from "./votes";

// Export relations for Drizzle query API
import { usersRelations } from "./users";
import { accountsRelations } from "./accounts";

export const relations = {
  users: usersRelations,
  accounts: accountsRelations,
};

