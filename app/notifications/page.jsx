"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Gift, CheckCircle, Clock } from "lucide-react";

const NotificationsPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/user/vouchers");
      if (res.data.success) {
        setVouchers(res.data.vouchers);
      }
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      toast.error("ভাউচার লোড করতে ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimVoucher = async (voucherId) => {
    try {
      setClaiming(voucherId);
      const res = await axios.post("/api/user/voucher/claim", { voucherId });
      if (res.data.success) {
        toast.success("ভাউচার সফলভাবে দাবি করা হয়েছে!");
        // Remove the claimed voucher from the list
        setVouchers(vouchers.filter((v) => v.id !== voucherId));
      }
    } catch (error) {
      console.error("Error claiming voucher:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("ভাউচার দাবি করতে ব্যর্থ");
      }
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="px-2 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-light">
          বিজ্ঞপ্তি ও ভাউচার
        </h1>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-300">লোড হচ্ছে...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">
              কোনও উপলব্ধ ভাউচার নেই
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vouchers.map((voucher) => {
              const collected = !!voucher.collected;

              return (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`p-4 rounded-xl border bg-white dark:bg-gray-800 
        border-gray-200 dark:border-gray-700 shadow-sm space-y-2
        ${collected ? "opacity-60" : "hover:shadow-md"}
      `}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-orange-600" />
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      কোড: {voucher.code}
                    </p>
                  </div>

                  {/* Message */}
                  {voucher.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {voucher.message}
                    </p>
                  )}

                  {/* Amount */}
                  <p
                    className={`text-lg font-bold text-center ${
                      collected ? "text-gray-500" : "text-green-600"
                    }`}
                  >
                    ৳{parseFloat(voucher.amount).toFixed(2)}
                  </p>

                  {/* Claim Button */}
                  <motion.button
                    whileTap={!collected ? { scale: 0.95 } : {}}
                    onClick={() => handleClaimVoucher(voucher.id)}
                    disabled={claiming === voucher.id || collected}
                    className={`w-full py-2 rounded-lg font-semibold text-sm transition
            ${
              collected
                ? "bg-gray-400 text-white cursor-not-allowed flex items-center justify-center gap-1"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }
          `}
                  >
                    {collected ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> সংগ্রহিত
                      </span>
                    ) : claiming === voucher.id ? (
                      "সংগ্রহ..."
                    ) : (
                      "সংগ্রহ করুন"
                    )}
                  </motion.button>

                  {/* Date */}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(voucher.createdAt).toLocaleString("bn-BD")}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
