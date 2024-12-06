import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: { text: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    const message = await ctx.db.insert("messages", {
      text: args.text,
      author: args.author,
      createdAt: Date.now(),
    });
    return message;
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .order("desc")
      .take(10);
  },
});
