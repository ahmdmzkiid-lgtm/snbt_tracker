import { db } from "./src/db/index.js";
import { syllabusCategories, syllabusTopics } from "./src/db/schema.js";
import { getDefaultSyllabus } from "./src/data/syllabus.js";

async function seed() {
  console.log("Seeding syllabus data...");
  const syllabusData = getDefaultSyllabus();

  for (const category of syllabusData) {
    console.log(`Seeding category: ${category.name}`);
    await db.insert(syllabusCategories).values({
      id: category.id,
      name: category.name,
      icon: category.icon || null,
    }).onConflictDoUpdate({
      target: syllabusCategories.id,
      set: { name: category.name, icon: category.icon || null }
    });

    for (const topic of category.topics) {
      console.log(`  Seeding topic: ${topic.name}`);
      await db.insert(syllabusTopics).values({
        id: topic.id,
        categoryId: category.id,
        name: topic.name,
      }).onConflictDoUpdate({
        target: syllabusTopics.id,
        set: { name: topic.name, categoryId: category.id }
      });
    }
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
