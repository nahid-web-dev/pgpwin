"use client";

import axios from "axios";
import { Copy, CopyCheck, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ReferralPage = () => {
  const [selectedState, setSelectedState] = useState("referral");

  const [user, setUser] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (selectedState === "commission") {
      setShowModal(true);
    }
  }, [selectedState]);

  useEffect(() => {
    const fetchUser = async () => {
      const userRes = await axios.get("/api/user/profile");
      if (userRes.data.success) setUser(userRes.data.user);
    };

    const fetchReferredUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/user/referred-users");
        if (res.data.success) setReferredUsers(res.data.referred_users);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchReferredUsers();
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await axios.get("/api/user/referral-summary");
      if (res.data.success) setSummary(res.data);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className="px-2 py-10 text-gray-800 dark:text-gray-100">
      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 dark:bg-black/70"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 relative top-20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-3 top-3 text-gray-500 dark:text-gray-300 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <X size={16} />
            </button>

            <h2 className="text-base font-medium mb-3 text-gray-800 dark:text-gray-100">
              রেফারেল বোনাস ও কমিশন ডিটেইলস
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {[
                { d: 1000, b: 1500, s: 30 },
                { d: 5000, b: 7500, s: 157 },
                { d: 10000, b: 15000, s: 321 },
                { d: 20000, b: 25000, s: 657 },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-2 border border-orange-600 rounded-md bg-gray-50 dark:bg-gray-800"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Deposit
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    ৳{item.d}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bet: ৳{item.b}
                  </p>
                  <p className="text-xs font-semibold text-orange-600">
                    Salary: ৳{item.s}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BANNER */}
      <div className="relative left-1/2 -translate-x-1/2 inline-flex justify-center">
        <Image
          src="/referral_banner.png"
          alt="image"
          width={600}
          height={0}
          className="w-full max-w-[600px] h-auto rounded-t-2xl"
        />
        <p className="absolute top-2 left-2 text-white text-lg font-semibold drop-shadow">
          রেফারেল প্রোগ্রাম
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full h-14 text-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex">
        <button
          className={`w-1/2 ${
            selectedState === "referral"
              ? "text-orange-600 border-b-4 border-orange-600"
              : ""
          }`}
          onClick={() => setSelectedState("referral")}
        >
          আমার রেফারেল
        </button>
        <button
          className={`w-1/2 ${
            selectedState === "commission"
              ? "text-orange-600 border-b-4 border-orange-600"
              : ""
          }`}
          onClick={() => setSelectedState("commission")}
        >
          আমার কমিশন
        </button>
      </div>

      {/* REFERRAL AREA */}
      {selectedState === "referral" ? (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed py-4">
            এখনই আপনার বন্ধুর সাথে আপনার রেফারেল কোড শেয়ার করুন এবং আয় শুরু
            করুন।
          </p>

          <div className="font-semibold text-gray-800 dark:text-gray-100 my-2">
            রেফারেল কোড:
          </div>

          <div className="flex items-center gap-5 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span className="py-1 px-3 border-2 border-dashed border-orange-600 rounded-4xl">
              {user && user.phone_number}
            </span>

            {isCopied ? (
              <CopyCheck className="text-green-500" />
            ) : (
              <Copy
                className="cursor-pointer text-gray-700 dark:text-gray-200"
                onClick={() => {
                  navigator.clipboard.writeText(user.phone_number);
                  setIsCopied(true);
                  toast.success("কপি হয়েছে!");
                }}
              />
            )}
          </div>

          {/* REFERRED USERS */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              আপনার রেফার করা বন্ধুরা ({referredUsers.length})
            </h2>

            {loading ? (
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                লোড হচ্ছে...
              </p>
            ) : referredUsers.length === 0 ? (
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                এখনও কাউকে রেফার করেননি
              </p>
            ) : (
              <div className="space-y-3">
                {referredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {u.phone_number}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(u.joined_at).toLocaleDateString("bn-BD")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300">
                          বর্তমান ব্যালেন্স
                        </p>
                        <p className="text-lg font-semibold text-orange-600">
                          ৳{u.current_balance.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 dark:text-gray-300">
                          মোট বেট
                        </p>
                        <p className="text-lg font-semibold text-blue-600">
                          ৳{u.total_bet_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* COMMISSION AREA */}
          <div className="mt-10">
            <div className="font-semibold mb-1">ভাউচার রিডিম করুন :</div>

            <form className="flex flex-col items-center space-y-2">
              <input
                type="text"
                className="w-full py-2 px-2 text-sm bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 outline-orange-600 rounded-2xl"
                placeholder="jrtxk4do6wr..."
              />
              <button
                type="submit"
                className="w-full py-2 px-4 bg-orange-600 rounded-2xl font-semibold text-white"
              >
                রিডিম
              </button>
            </form>
          </div>

          {/* TODAY STATS */}
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
              আজকের রেফার্ড স্ট্যাটস
            </h3>

            {loadingSummary ? (
              <p className="text-gray-600">লোড হচ্ছে...</p>
            ) : summary?.referred_today ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    মোট বেট
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    ৳{summary.referred_today.total_bet.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    মোট ডিপোজিট
                  </p>
                  <p className="text-lg font-semibold text-orange-600">
                    ৳{summary.referred_today.total_deposit.toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">ডেটা নেই</p>
            )}
          </div>

          {/* EARNINGS */}
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-800">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
              আপনার আয়
            </h3>

            {loadingSummary ? (
              <p className="text-gray-600">লোড হচ্ছে...</p>
            ) : summary?.earnings ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      কমিশন মোট
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      ৳{summary.earnings.commissions_total.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      বেতন মোট
                    </p>
                    <p className="text-lg font-semibold text-indigo-600">
                      ৳{summary.earnings.salaries_total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* RECENT COMMISSIONS */}
                  <div>
                    <p className="text-sm font-semibold">সাম্প্রতিক কমিশন</p>

                    {summary.earnings.commissions.length === 0 ? (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        নেই
                      </p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {summary.earnings.commissions.slice(0, 5).map((t) => (
                          <div
                            key={t.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-700 dark:text-gray-200">
                              ৳{parseFloat(t.amount).toFixed(2)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(t.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* RECENT SALARIES */}
                  <div>
                    <p className="text-sm font-semibold">সাম্প্রতিক বেতন</p>

                    {summary.earnings.salaries.length === 0 ? (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        নেই
                      </p>
                    ) : (
                      <div className="mt-2 space-y-1">
                        {summary.earnings.salaries.slice(0, 5).map((t) => (
                          <div
                            key={t.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-700 dark:text-gray-200">
                              ৳{parseFloat(t.amount).toFixed(2)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(t.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-600">ডেটা নেই</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralPage;
