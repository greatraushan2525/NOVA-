import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import {
  createConversation,
  getConversationMessages,
  addMessage,
  deleteConversationMessages,
  getUserConversations,
  deleteConversation,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { conversationId, message } = input;

        // Verify conversation belongs to the user
        const db = await import("./db").then((m) => m.getDb());
        if (db) {
          const { conversations } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const conv = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);

          if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Conversation not found",
            });
          }
        }

        // Add user message to database
        await addMessage(conversationId, "user", message);

        // Get conversation history (last 10 messages for context)
        const allMessages = await getConversationMessages(conversationId);
        const contextMessages = allMessages.slice(-10);

        // Prepare messages for LLM
        const llmMessages: any[] = [
          {
            role: "system",
            content:
              "You are a helpful, friendly AI assistant. Answer questions clearly and concisely. If you don't know something, say so honestly.",
          },
          ...contextMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ];

        // Call LLM
        const response = await invokeLLM({
          messages: llmMessages,
        });

        const messageContent = response.choices[0]?.message?.content;
        const assistantReply =
          typeof messageContent === "string" ? messageContent : "I couldn't generate a response.";

        // Add assistant response to database
        await addMessage(conversationId, "assistant", assistantReply);

        return { reply: assistantReply };
      }),

    getHistory: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify conversation belongs to the user
        const db = await import("./db").then((m) => m.getDb());
        if (db) {
          const { conversations } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const conv = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, input.conversationId))
            .limit(1);

          if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Conversation not found",
            });
          }
        }

        const messages = await getConversationMessages(input.conversationId);
        return messages;
      }),

    createConversation: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await createConversation(ctx.user.id);
      return { conversationId: (result as any).insertId };
    }),

    resetConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (db) {
          const { conversations } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const conv = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, input.conversationId))
            .limit(1);

          if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Conversation not found",
            });
          }
        }

        await deleteConversationMessages(input.conversationId);
        return { success: true };
      }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      const conversations = await getUserConversations(ctx.user.id);
      return conversations;
    }),

    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteConversation(input.conversationId, ctx.user.id);
        return { success: true };
      }),

    searchConversations: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        const conversations = await getUserConversations(ctx.user.id);
        const query = input.query.toLowerCase();
        return conversations.filter(
          (conv: any) =>
            conv.title.toLowerCase().includes(query)
        );
      }),

    generateTitle: protectedProcedure
      .input(z.object({ conversationId: z.number(), firstMessage: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "Generate a short, descriptive title (max 50 characters) for a chat conversation based on the first user message. Return only the title, no quotes or explanation.",
              },
              { role: "user", content: input.firstMessage },
            ],
          });

          const title = (response.choices[0]?.message?.content as string)?.trim().substring(0, 50) || "New Chat";

          const db = await import("./db").then((m) => m.getDb());
          if (db) {
            const { conversations } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            await db
              .update(conversations)
              .set({ title })
              .where(eq(conversations.id, input.conversationId));
          }

          return { title };
        } catch (error) {
          console.error("Error generating title:", error);
          return { title: "New Chat" };
        }
      }),

    generateShareLink: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { conversations } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const conv = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, input.conversationId))
          .limit(1);

        if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        await db
          .update(conversations)
          .set({ shareToken, isPublic: "true" })
          .where(eq(conversations.id, input.conversationId));

        return { shareToken, shareUrl: `/share/${shareToken}` };
      }),

    exportConversation: protectedProcedure
      .input(z.object({ conversationId: z.number(), format: z.enum(["markdown", "json"]) }))
      .query(async ({ ctx, input }) => {
        const db = await import("./db").then((m) => m.getDb());
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const { conversations } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const conv = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, input.conversationId))
          .limit(1);

        if (conv.length === 0 || conv[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const messages = await getConversationMessages(input.conversationId);

        if (input.format === "markdown") {
          let markdown = `# ${conv[0].title}\n\n`;
          markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;
          messages.forEach((msg) => {
            const prefix = msg.role === "user" ? "**You:**" : "**Nova:**";
            markdown += `${prefix}\n${msg.content}\n\n`;
          });
          return { content: markdown, filename: `${conv[0].title}.md` };
        } else {
          const json = {
            title: conv[0].title,
            exportedAt: new Date().toISOString(),
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.createdAt,
            })),
          };
          return { content: JSON.stringify(json, null, 2), filename: `${conv[0].title}.json` };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
