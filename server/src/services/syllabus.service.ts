import { db } from "../db/index.js";
import { syllabusCategories, syllabusTopics, userProgress } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export class SyllabusService {
  static async getSyllabus(userId: string) {
    const categories = await db.select().from(syllabusCategories);
    const topics = await db.select().from(syllabusTopics);
    const progress = await db.select().from(userProgress).where(eq(userProgress.userId, userId));

    return categories.map(cat => ({
      ...cat,
      topics: topics
        .filter(t => t.categoryId === cat.id)
        .map(t => {
          const p = progress.find(pg => pg.topicId === t.id);
          return { ...t, status: p ? p.status : 'belum' };
        })
    }));
  }

  static async updateProgress(userId: string, topicId: string, status: string) {
    const [existing] = await db.select().from(userProgress).where(
      and(eq(userProgress.userId, userId), eq(userProgress.topicId, topicId))
    );

    if (existing) {
      const [updated] = await db.update(userProgress)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(userProgress.userId, userId), eq(userProgress.topicId, topicId)))
        .returning();
      return updated;
    } else {
      const [inserted] = await db.insert(userProgress)
        .values({ userId, topicId, status })
        .returning();
      return inserted;
    }
  }
}
