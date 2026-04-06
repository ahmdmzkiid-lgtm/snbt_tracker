import { db } from "../db/index.js";
import { tryouts } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export class TryoutService {
  static async getTryouts(userId: string) {
    return await db.select().from(tryouts).where(eq(tryouts.userId, userId));
  }

  static async addTryout(userId: string, data: { date: string, totalScore: number, scores: any }) {
    const [inserted] = await db.insert(tryouts)
      .values({ userId, ...data } as any)
      .returning();
    return inserted;
  }

  static async deleteTryout(userId: string, id: number) {
    return await db.delete(tryouts).where(
      and(eq(tryouts.id, id), eq(tryouts.userId, userId))
    );
  }
}
