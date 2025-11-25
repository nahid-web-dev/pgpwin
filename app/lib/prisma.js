import { PrismaClient } from "../generated/prisma/client";

export const prisma = new PrismaClient();

// export async function migrateDB() {
//   try {
//     await prisma.$executeRawUnsafe(`
//   ALTER TABLE "User"
//   ALTER COLUMN "turn_over" TYPE numeric(10,2) USING turn_over::numeric(10,2);
// `);

//     await prisma.$executeRawUnsafe(`
//   ALTER TABLE "Transaction"
//   ALTER COLUMN "amount" TYPE numeric(10,2) USING amount::numeric(10,2);
// `);

//     await prisma.$executeRawUnsafe(`
//   ALTER TABLE "GameTransaction"
//   ALTER COLUMN "amount" TYPE numeric(10,2) USING amount::numeric(10,2);
// `);

//     console.log("✅ Migration executed successfully!");
//   } catch (err) {
//     console.error("❌ Migration failed:", err);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
