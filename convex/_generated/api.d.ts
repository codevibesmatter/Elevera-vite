/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin_mutations from "../admin/mutations.js";
import type * as admin_queries from "../admin/queries.js";
import type * as admin from "../admin.js";
import type * as files_helpers from "../files/helpers.js";
import type * as files_mutations from "../files/mutations.js";
import type * as files_queries from "../files/queries.js";
import type * as initialSuperUser from "../initialSuperUser.js";
import type * as messages from "../messages.js";
import type * as teams_mutations from "../teams/mutations.js";
import type * as teams_queries from "../teams/queries.js";
import type * as teams from "../teams.js";
import type * as users_helpers from "../users/helpers.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "admin/mutations": typeof admin_mutations;
  "admin/queries": typeof admin_queries;
  admin: typeof admin;
  "files/helpers": typeof files_helpers;
  "files/mutations": typeof files_mutations;
  "files/queries": typeof files_queries;
  initialSuperUser: typeof initialSuperUser;
  messages: typeof messages;
  "teams/mutations": typeof teams_mutations;
  "teams/queries": typeof teams_queries;
  teams: typeof teams;
  "users/helpers": typeof users_helpers;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
