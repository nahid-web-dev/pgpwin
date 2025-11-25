"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Copy,
  Wallet,
  InfoIcon,
  User2Icon,
  X,
  Eye,
  EyeOff,
  Check,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local Storage Security Fields
  const [displayName, setDisplayName] = useState("");
  const [verifiedHuman, setVerifiedHuman] = useState(false);
  const [dummy2fa, setDummy2fa] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetchUserData();

    setDisplayName(localStorage.getItem("displayName") || "");
    setVerifiedHuman(localStorage.getItem("verifiedHuman") === "true");
    setDummy2fa(localStorage.getItem("dummy2fa") === "true");
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) return router.push("/auth");

      const data = await response.json();
      setUser(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (!user?.phone_number) return;

    try {
      await navigator.clipboard.writeText(user.phone_number);
      setCopying(true);
      setTimeout(() => setCopying(false), 1800);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError("New passwords don't match");
    }

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="grow h-full p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="grow h-full bg-orange-50 dark:bg-gray-900 p-4">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg"
      >
        <div className="bg-orange-500 p-6 text-white flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-full">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">প্রোফাইল</h1>
            <p className="text-orange-100">আপনার অ্যাকাউন্ট ব্যবস্থাপনা।</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Balance */}
          <div className="bg-orange-50 dark:bg-gray-700 p-4 flex justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ব্যালেন্স
                </p>
                <p className="text-xl font-bold">৳{user?.balance || 0}</p>
              </div>
            </div>

            <div>
              <div
                className="flex gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                onClick={() =>
                  toast.success(
                    "ব্যালান্স ৫০ এর নিচে থাকলে টাকা জমা দিলে পুরনো টার্নওভার মুছে যাবে।"
                  )
                }
              >
                টার্নওভার <InfoIcon className="text-orange-600 text-xl" />
              </div>
              <p className="font-medium">৳{user?.turn_over || 0}</p>
            </div>
          </div>

          {/* User info */}
          <div className="space-y-4">
            <InfoRow
              icon={<User2Icon className="text-orange-600" />}
              label="ইউজারনেম"
              value={user?.user_code || "N/A"}
            />

            <div className="flex justify-between items-center">
              <InfoRow
                icon={<Phone className="text-orange-600" />}
                label="ফোন নম্বর (রেফারেল)"
                value={user?.phone_number}
              />
              <button
                onClick={copyInviteCode}
                className="p-2 hover:bg-orange-100 dark:hover:bg-gray-700 rounded-full"
              >
                {copying ? (
                  <Check className="text-green-500" />
                ) : (
                  <Copy className="text-orange-600" />
                )}
              </button>
            </div>

            <InfoRow
              icon={<User className="text-orange-600" />}
              label="আমন্ত্রণকারী"
              value={user?.invited_by || "N/A"}
            />
          </div>
        </div>
      </motion.div>

      {/* Security Section */}
      <div className="max-w-md mx-auto mt-6 bg-white dark:bg-gray-800 rounded shadow-sm">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">Account Security</h2>
          <p className="text-sm text-gray-500">Local-only settings.</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Open Password Modal */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Change Password</p>
              <p className="text-xs text-gray-500">Opens password dialog.</p>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-3 py-2 bg-orange-500 text-white rounded"
            >
              Change
            </button>
          </div>

          <ChangeNameRow
            displayName={displayName}
            setDisplayName={setDisplayName}
          />

          <VerifyHumanRow
            verifiedHuman={verifiedHuman}
            setVerifiedHuman={setVerifiedHuman}
          />

          <DummyToggleRow dummy2fa={dummy2fa} setDummy2fa={setDummy2fa} />
        </div>
      </div>

      {/* Password Modal */}
      {showChangePassword && (
        <PasswordModal
          error={error}
          success={success}
          setError={setError}
          setSuccess={setSuccess}
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          showPasswords={showPasswords}
          setShowPasswords={setShowPasswords}
          onClose={() => setShowChangePassword(false)}
          onSubmit={handlePasswordChange}
        />
      )}
    </div>
  );
}

/* ------------------ REUSABLE SMALL COMPONENT ------------------ */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

/* ------------------ SECURITY COMPONENTS ------------------ */

function ChangeNameRow({ displayName, setDisplayName }) {
  const [showModal, setShowModal] = useState(false);
  const [temp, setTemp] = useState(displayName || "");

  const save = () => {
    if (!temp.trim()) return toast.error("Name cannot be empty");
    localStorage.setItem("displayName", temp);
    setDisplayName(temp);
    setShowModal(false);
    toast.success("Name updated");
  };

  return (
    <>
      {/* Row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{temp}</p>
          <p className="text-xs text-gray-500">Change Your Name</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
        >
          Edit
        </button>
      </div>

      {/* Popup */}
      {showModal && (
        <div className="h-dvh w-full fixed top-0 left-0 bg-black/40 dark:bg-white/10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-900 p-5 rounded-xl w-[90%] max-w-[380px] shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Change Display Name</h3>

            <input
              className="w-full px-3 py-2 border rounded mb-4"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              placeholder="Enter new name"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={save}
                className="px-4 py-2 rounded bg-orange-500 text-white"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

function VerifyHumanRow({ verifiedHuman, setVerifiedHuman }) {
  const verify = () => {
    localStorage.setItem("verifiedHuman", "true");
    setVerifiedHuman(true);
    toast.success("Verified");
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium">Verify Human</p>
        <p className="text-xs text-gray-500">Local check only.</p>
      </div>

      <button
        onClick={verify}
        disabled={verifiedHuman}
        className={`px-3 py-1 rounded text-sm ${
          verifiedHuman ? "bg-gray-400 text-white" : "bg-green-500 text-white"
        }`}
      >
        {verifiedHuman ? "Verified" : "Verify"}
      </button>
    </div>
  );
}

function DummyToggleRow({ dummy2fa, setDummy2fa }) {
  const toggle = () => {
    const next = !dummy2fa;
    localStorage.setItem("dummy2fa", String(next));
    setDummy2fa(next);
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="text-sm font-medium flex space-x-2">
          <p> Two-Factor </p>
          {dummy2fa ? <CheckCircle className="text-green-600 text-sm" /> : null}
        </div>
        <p className="text-xs text-gray-500">2FA Security.</p>
      </div>

      <button
        onClick={toggle}
        className={`px-3 py-1 rounded text-sm ${
          dummy2fa ? "bg-red-500 text-white" : "bg-blue-500 text-white"
        }`}
      >
        {dummy2fa ? "Disable" : "Enable"}
      </button>
    </div>
  );
}

/* ------------------ PASSWORD MODAL ------------------ */

function PasswordModal({
  error,
  success,
  setError,
  setSuccess,
  passwordForm,
  setPasswordForm,
  showPasswords,
  setShowPasswords,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">পাসওয়ার্ড পরিবর্তন</h2>
          <button
            onClick={() => {
              setError("");
              setSuccess("");
              onClose();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 text-sm">
              {success}
            </div>
          )}

          {["currentPassword", "newPassword", "confirmPassword"].map(
            (field, i) => (
              <PasswordInput
                key={field}
                label={i === 0 ? "বর্তমান পাসওয়ার্ড" : "নতুন পাসওয়ার্ড"}
                value={passwordForm[field]}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, [field]: e.target.value })
                }
                show={showPasswords[Object.keys(showPasswords)[i]]}
                toggle={() =>
                  setShowPasswords({
                    ...showPasswords,
                    [Object.keys(showPasswords)[i]]:
                      !showPasswords[Object.keys(showPasswords)[i]],
                  })
                }
              />
            )
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3"
          >
            পরিবর্তন
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, toggle }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          className="w-full border px-4 py-2 dark:bg-gray-700"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
