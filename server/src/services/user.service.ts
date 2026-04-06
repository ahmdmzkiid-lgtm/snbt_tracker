import { db } from "../db/index.js";
import { profiles } from "../db/schema.js";
import { eq } from "drizzle-orm";

export class UserService {
  static async getProfile(userId: string) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || null;
  }

  static async updateProfile(userId: string, data: { name?: string, targetUniversity?: string, targetMajor?: string, targetScore?: number }) {
    const existing = await this.getProfile(userId);
    if (existing) {
      const [updated] = await db.update(profiles).set(data).where(eq(profiles.userId, userId)).returning();
      return updated;
    } else {
      const [inserted] = await db.insert(profiles).values({ userId, ...data }).returning();
      return inserted;
    }
  }
}
