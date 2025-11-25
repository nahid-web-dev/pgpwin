"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Wallet,
  TrendingUp,
  RefreshCw,
  ArrowDownCircle,
  ArrowUpCircle,
  X,
  Check,
  Eye,
  CalendarDays,
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";

const channels = [
  {
    name: "okpay",
    method: "BKASH",
    deposit_limit: "100-25K",
    withdraw_limit: "100-50K",
    payin_api: "/api/create-payin/okpay",
    payout_api: "/api/create-payout/okpay",
  },
  {
    name: "okpay",
    method: "NAGAD",
    deposit_limit: "100-25K",
    withdraw_limit: "100-50K",
    payin_api: "/api/create-payin/okpay",
    payout_api: "/api/create-payout/okpay",
  },
];

// export const payment_server_url = "http://3.111.203.166:4000";
// export const payment_server_url = "http://3.111.203.166:4000";
const payment_server_url = process.env.NEXT_PUBLIC_SERVER_URL;

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState(100);
  const [account, setAccount] = useState("");
  const [userName, setUserName] = useState("");
  const [type, setType] = useState("deposit"); // deposit or withdraw
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // transactions section
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [showBonus, setShowBonus] = useState(false);

  const bonuses = [
    { bonus: 150, deposit: 300, percent: "50%" },
    { bonus: 250, deposit: 500, percent: "50%" },
    { bonus: 500, deposit: 1000, percent: "50%" },
    { bonus: 1000, deposit: 2000, percent: "50%" },
  ];

  useEffect(() => {
    fetchUserData();
    // fetch transactions when page changes
    fetchTransactions(currentPage);
  }, [currentPage]);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoadingTransactions(true);
      const res = await axios.get(
        `/api/user/transactions?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      if (res.data?.success) {
        setTransactions(res.data.data || []);
        setTotalTransactions(res.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const depositCount = await axios.get("/api/user/deposit-count");

      if (depositCount.data?.depositCount === 0) {
        setShowBonus(true);
      }

      setLoadingUser(true);

      const response = await fetch("/api/user/profile");
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      } else {
        toast.error("Failed to load user data");
      }
      setLoadingUser(false);
    } catch (error) {
      toast.error("Error loading user data");
    }
  };

  const handleSubmit = async () => {
    console.log("reached");
    if (!amount || !selectedChannel || !selectedMethod) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (type === "withdraw") {
      if (!account || account?.length !== 11) {
        toast.error("Account Number Must be of 11 digit!");
        return;
      }
      if (!userName) {
        toast.error("Your Name on account is required!");
        return;
      }
    }

    const channelDetails = channels.find(
      (ch) => ch.name === selectedChannel.name && ch.method === selectedMethod
    );

    if (type === "deposit") {
      if (
        amount < Number(channelDetails.deposit_limit.split("-")[0]) ||
        amount > parseFloat(channelDetails.deposit_limit.split("-")[1]) * 1000
      ) {
        console.log("failed limits");
        toast.error(
          `Deposit amount must be between ${channelDetails.deposit_limit}`
        );
        return;
      }
    } else {
      if (
        amount < Number(channelDetails.withdraw_limit.split("-")[0]) ||
        amount > parseFloat(channelDetails.withdraw_limit.split("-")[1]) * 1000
      ) {
        toast.error(
          `Withdraw amount must be between ${channelDetails.withdraw_limit}`
        );
        return;
      }
    }

    console.log("passed limits");

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      };

      const token = getCookie("auth_token");

      if (type === "deposit") {
        const response = await fetch(
          `${payment_server_url}${selectedChannel.payin_api}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              money: amount,
              pay_type: selectedMethod,
              token,
              returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet`,
            }),
          }
        );

        const data = await response.json();
        console.log("response data:", data, data?.success, data?.url);
        if (data?.success && data?.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.message);
        }
      } else if (type === "withdraw") {
        const response = await fetch(
          `${payment_server_url}${selectedChannel.payout_api}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              money: amount,
              pay_type: selectedMethod,
              account: account,
              userName: userName,
              token,
            }),
          }
        );
        const data = await response.json();
        console.log("withdraw response data:", data);
        if (data?.success) {
          toast.success("Payout request created successfully");
        } else {
          toast.error(data.message || "Failed to create payout");
        }
      }
    } catch (error) {
      console.log("error:", error);
      toast.error("Failed to process payment");
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-900 p-4">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wallet className="w-6 h-6 text-orange-500 mr-2" />
              <h2 className="text-xl font-bold">Wallet</h2>
            </div>
            <button
              onClick={fetchUserData}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingUser ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Balance
              </p>
              <p className="text-2xl font-bold">৳{user?.balance || 0}</p>
            </div>
            <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Turnover</span>
              </div>
              <p className="text-2xl font-bold">৳{user?.turn_over || 0}</p>
            </div>
          </div>
        </div>

        {/* Bonus Offers */}
        {showBonus && (
          <div className="h-dvh w-full bg-black/40 dark:bg-white/10 fixed top-0 left-0 ">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white fixed max-w-[400px] w-[95vw] min-w-[310px] -translate-1/2 top-1/2 left-1/2 dark:bg-slate-900 rounded-xl p-6 mb-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-600">
                  Welcome Bonus Offers! 🎉
                </h3>
                <button
                  onClick={() => setShowBonus(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-7 h-7 rounded-full border-2 border-red-600 text-red-600" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bonuses.map((b, i) => (
                  <div
                    onClick={() => {
                      setAmount(b.deposit);
                      setShowBonus(false);
                    }}
                    key={i}
                    className="bg-linear-to-br from-orange-100 to-orange-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          ৳{b.bonus}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bonus on ৳{b.deposit}
                        </p>
                      </div>
                      <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        {b.percent} Bonus
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Transaction Type */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setType("deposit")}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl ${
              type === "deposit"
                ? "bg-green-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            <ArrowDownCircle className="w-5 h-5" />
            Deposit
          </button>
          <button
            onClick={() => setType("withdraw")}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl ${
              type === "withdraw"
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            <ArrowUpCircle className="w-5 h-5" />
            Withdraw
          </button>
        </div>

        {/* Amount Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
          {/* <div>
            <label className="block text-sm font-medium mt-2 mb-1">
              Amount (৳)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              onWheel={(e) => {
                e.currentTarget.blur();
              }}
              className="w-full p-2 rounded-lg bg-orange-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium mt-2 mb-1">
              Amount (৳)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              onWheel={(e) => {
                e.currentTarget.blur();
              }}
              className="w-full p-2 rounded-lg bg-orange-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <div className="flex justify-around space-x-2 mt-5">
              {[100, 300, 500, 1000].map((item, idx) => {
                return (
                  <div
                    className="font-semibold p-2 rounded-lg bg-gray-200 dark:bg-slate-700  "
                    key={idx}
                    onClick={() => setAmount(item)}
                  >
                    {item}৳
                  </div>
                );
              })}
            </div>
          </div>
          {type == "withdraw" && (
            <>
              <div>
                <label className="block text-sm font-medium mt-2 mb-1">
                  Account Number
                </label>
                <input
                  type="number"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="eg. 01747-032XXX"
                  onWheel={(e) => {
                    e.currentTarget.blur();
                  }}
                  className="w-full p-2 rounded-lg bg-orange-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mt-2 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="eg. Rahim Badsah"
                  onWheel={(e) => {
                    e.currentTarget.blur();
                  }}
                  className="w-full p-2 rounded-lg bg-orange-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Payment Channels */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">
            Select Payment Channel
          </h3>
          <div className="flex justify-center items-center gap-4">
            {channels.map((channel, idx) => (
              <div key={idx} className="space-y-3 w-32 max-w-40">
                <button
                  onClick={() => {
                    setSelectedChannel(channel);
                    setSelectedMethod(channel.method);
                    setShowConfirmation(true);
                  }}
                  className={` p-2 py-4 rounded-lg border-2 transition-all ${
                    selectedChannel?.name === channel.name &&
                    selectedMethod.method === channel.method
                      ? "border-orange-500 bg-orange-50 dark:bg-gray-700"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex flex-col justify-cehnter items-center">
                    <Image
                      alt="img"
                      src={
                        channel.method == "BKASH"
                          ? "/bkash.png"
                          : channel.method == "NAGAD"
                          ? "/nagad.png"
                          : ""
                      }
                      width={60}
                      height={60}
                      className=" aspect-square object-cover "
                    />
                    <span className="text-xs uppercase flex justify-center">
                      {channel.name}-{channel.method}
                    </span>
                    <span className="text-sm">
                      {type === "deposit"
                        ? channel.deposit_limit
                        : channel.withdraw_limit}
                    </span>
                    {/* {selectedChannel?.name === channel.name && (
                      <Check className="w-5 h-5 text-orange-500" />
                    )} */}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Transactions List */}
      <div className=" max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg my-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Recent Transactions</h3>
          <RefreshCw
            className={`w-4 h-4 cursor-pointer ${
              loadingTransactions ? "animate-spin" : ""
            }`}
            onClick={fetchTransactions}
          />
        </div>

        <div className="space-y-2">
          {/**
           * Client-side pagination: show only ITEMS_PER_PAGE transactions per page
           */}
          {(() => {
            const totalPages = Math.max(
              1,
              Math.ceil(totalTransactions / ITEMS_PER_PAGE)
            );
            // ensure current page is within bounds
            if (currentPage > totalPages) setCurrentPage(totalPages);
            const pageItems = transactions; // already the current page

            return (
              <>
                {pageItems.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-gray-700"
                  >
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          transaction.type === "deposit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {transaction.type === "deposit" ? "+" : "-"}৳
                        {transaction.amount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(
                          new Date(transaction.createdAt),
                          "MMM d, h:mm a"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-sm font-medium ${
                          transaction.type === "deposit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {transaction.type === "deposit" ? "+" : "-"}৳
                        {transaction.amount}
                      </p>
                      <div
                        className={`px-2 py-0.5 text-xs rounded ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : transaction.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {transaction.status}
                      </div>
                      <Eye
                        className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setSelectedTransaction(transaction)}
                      />
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && !loadingTransactions && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                    No transactions found
                  </p>
                )}

                {/* Pagination controls */}
                {/* {totalTransactions > 0 && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      Prev
                    </button>

                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      {currentPage} of{" "}
                      {Math.max(
                        1,
                        Math.ceil(totalTransactions / ITEMS_PER_PAGE)
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(
                            Math.max(
                              1,
                              Math.ceil(totalTransactions / ITEMS_PER_PAGE)
                            ),
                            p + 1
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.max(
                          1,
                          Math.ceil(totalTransactions / ITEMS_PER_PAGE)
                        )
                      }
                      className={`px-3 py-1 rounded ${
                        currentPage ===
                        Math.max(
                          1,
                          Math.ceil(totalTransactions / ITEMS_PER_PAGE)
                        )
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )} */}
              </>
            );
          })()}
        </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedTransaction(null)}
            />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative max-w-md w-full bg-white dark:bg-slate-900 dark:border-white border-2 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Type
                    </p>
                    <p className="text-sm font-medium capitalize">
                      {selectedTransaction.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Method
                    </p>
                    <p className="text-sm font-medium uppercase">
                      {selectedTransaction.method}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Amount
                    </p>
                    <p className="text-sm font-medium">
                      ৳{selectedTransaction.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <div
                      className={`inline-block px-2 py-0.5 text-xs rounded ${
                        selectedTransaction.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : selectedTransaction.status === "pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {selectedTransaction.status}
                    </div>
                  </div>
                </div>

                {selectedTransaction.trx_id && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Transaction ID
                    </p>
                    <p className="text-sm font-medium break-all">
                      {selectedTransaction.trx_id}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CalendarDays className="w-4 h-4" />
                  {format(new Date(selectedTransaction.createdAt), "PPpp")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Confirm Payment</h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Amount
                    </span>
                    <span className="font-semibold">৳{amount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Method
                    </span>
                    <span className="font-semibold">{selectedMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Limit
                    </span>
                    <span className="font-semibold">
                      {type === "deposit"
                        ? selectedChannel?.deposit_limit
                        : selectedChannel?.withdraw_limit}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
