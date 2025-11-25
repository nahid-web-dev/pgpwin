"use client";

import { motion } from "framer-motion";

export default function Loader() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  return (
    <div className="flex items-center justify-center h-full py-10 w-full bg:bg-light dark:bg-dark">
      <motion.div
        className="flex flex-col items-center gap-3"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-4 h-4 rounded-full bg-primary"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
        <p className="text-primary font-medium">Loading</p>
      </motion.div>
    </div>
  );
}

// model User {
//   id            Int           @id @default(autoincrement())
//   phone_number  String       @unique
//   user_code     String?
//   password      String
//   fp_id         String
//   ip            String
//   balance       Int          @default(0)
//   turn_over     Int          @default(0)
//   invited_by   String?
//   transactions  Transaction[]
//   createdAt     DateTime     @default(now())
//   updatedAt     DateTime     @updatedAt
// }

// enum TransactionStatus {
//   pending
//   completed
//   cancelled
// }

// enum TransactionType {
//   deposit
//   withdraw
// }

// model Transaction {
//   id        Int     @id @default(autoincrement())
//   amount    Int
//   type      TransactionType
//   trx_id    String?
//   status    TransactionStatus @default(pending)
//   user         User    @relation(fields: [user_id], references: [id])
//   createdAt     DateTime     @default(now())
//   updatedAt     DateTime     @updatedAt
// }
