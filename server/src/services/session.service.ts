import { db } from "../db/index.js";
import { studySessions } from "../db/schema.js";
import { eq } from "drizzle-orm";

export class SessionService {
  static async getSessions(userId: string) {
    return await db.select().from(studySessions).where(eq(studySessions.userId, userId));
  }

  static async addSession(userId: string, data: { duration: number, topic: string, date?: Date }) {
    const [inserted] = await db.insert(studySessions)
      .values({ userId, ...data })
      .returning();
    return inserted;
  }
}
