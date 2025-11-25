"use client";
import { Check, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

// const server_url = "https://payment.pgpwin.site";
const server_url = process.env.NEXT_PUBLIC_SERVER_URL;

const SupportPage = () => {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Initialize: fetch profile & historical messages, then connect socket
    const init = async () => {
      try {
        // fetch current user profile to determine id
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          const uid =
            profileJson?.user?.id ?? profileJson?.user?.userId ?? null;
          setCurrentUserId(uid ? String(uid) : null);
        }

        // fetch historical messages
        const res = await fetch("/api/user/messages");
        if (res.ok) {
          const json = await res.json();
          const msgs = Array.isArray(json?.data) ? json.data : [];
          // API returns newest first; show oldest at top, newest at bottom
          msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setMessages(msgs);
        }
      } catch (err) {
        console.error("Failed to load messages/profile:", err);
      }

      // socket connection
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
      };

      const token = getCookie("auth_token");

      const socket = io(server_url, {
        query: { token: token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("connect", () => console.log("Connected:", socket.id));

      socket.on("receive_message", (message) => {
        // append incoming message to the end (newest at bottom)
        setMessages((prev) => [...prev, message]);
      });

      socket.on("message_seen", (msg) => {
        console.log("reached inside message seen", msg);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, seen: true } : m))
        );
      });

      return () => socket.disconnect();
    };

    init();
  }, []);

  const handleSend = () => {
    (async () => {
      if (!msg.trim() && !file) return; // nothing to send
      if (!socketRef.current) return;

      let fileUrl = null;

      try {
        if (file) {
          setUploading(true);
          const formData = new FormData();
          formData.append("file", file);

          const upRes = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          const upJson = await upRes.json();
          // support different response shapes
          fileUrl =
            upJson?.url ?? upJson?.data?.url ?? upJson?.secure_url ?? null;
        }

        const message = {
          content: msg,
          fileUrl,
        };

        socketRef.current.emit("send_message", message);
        // reset input and file after sending
        setMsg("");
        setFile(null);
        setFilePreview(null);
      } catch (err) {
        console.error("Failed to send message/upload file:", err);
        alert("Failed to send message or upload image");
      } finally {
        setUploading(false);
      }
    })();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentUserId || !socketRef.current) return;

    const unseenMessages = messages
      .filter((m) => m.sender !== currentUserId && !m.seen)
      .map((m) => m.id);

    if (unseenMessages.length > 0) {
      socketRef.current.emit("mark_seen", unseenMessages);

      setMessages((prev) =>
        prev.map((m) =>
          unseenMessages.includes(m.id) ? { ...m, seen: true } : m
        )
      );
    }
  }, [messages, currentUserId]);

  return (
    <div className="flex flex-col h-[calc(100dvh-128px)] border rounded">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-500">No messages</div>
        )}

        {messages.map((m, i) => {
          const isMe = String(m.sender) === String(currentUserId);
          const isUnseen = m.seen === false;

          return (
            <div
              key={m.id ?? i}
              className={`flex items-start space-x-1 max-w-md rounded-lg border-2 ${
                isMe
                  ? "self-end border-green-400"
                  : "self-start border-orange-400"
              } p-1 py-2 relative`}
            >
              <div>
                <div className="whitespace-pre-wrap inline-block">
                  {m.content}{" "}
                  {isMe ? (
                    isUnseen ? (
                      <div className="opacity-80 inline-block relative w-6 h-4">
                        <Check
                          className={` h-4 w-4 absolute left-0 bottom-0 `}
                        />
                        <Check
                          className={` h-4 w-4 absolute left-1 bottom-0 `}
                        />
                      </div>
                    ) : (
                      <div className="opacity-80 inline-block relative w-6 h-4">
                        <Check
                          className={` h-4 w-4 absolute left-0 bottom-0 text-green-500 `}
                        />
                        <Check
                          className={` h-4 w-4 absolute left-1 bottom-0 text-green-500 `}
                        />
                      </div>
                    )
                  ) : null}
                </div>
                <div className="flex flex-col items-center space-x-2 text-xs ">
                  <p>{new Date(m.createdAt).toLocaleString()}</p>

                  {m.fileUrl && (
                    <>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setPreview(m.fileUrl ? m.fileUrl : null)}
                      >
                        <Image
                          src={m.fileUrl}
                          alt="attachment"
                          width={260}
                          height={200}
                          className="rounded-md object-cover"
                        />
                      </div>

                      {preview && (
                        <div
                          className="fixed top-0 left-0 py-10 px-2 inset-0 bg-black/70 flex flex-col items-center justify-center z-50"
                          onClick={() => setPreview(null)}
                        >
                          <div className=" relative w-full h-full ">
                            <Image
                              src={preview}
                              alt="Full preview"
                              fill
                              className="object-contain cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-1 border-t flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f) {
              setFile(f);
              try {
                const url = URL.createObjectURL(f);
                setFilePreview(url);
              } catch (err) {
                setFilePreview(null);
              }
            } else {
              setFile(null);
              setFilePreview(null);
            }
          }}
        />

        <input
          className=" grow border rounded px-1 py-1"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 broder-foreground border rounded-md "
          title="Attach image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          className=" px-2 py-1 bg-blue-500 rounded disabled:opacity-60"
          onClick={handleSend}
          disabled={uploading}
        >
          {uploading ? "S.." : "Send"}
        </button>
      </div>
      {filePreview && (
        <div className="p-2 pl-2">
          <div className="flex items-center gap-2">
            <img
              src={filePreview}
              alt="preview"
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <div className="text-sm">{file?.name}</div>
              <button
                className="text-xs text-red-500 mt-1"
                onClick={() => {
                  setFile(null);
                  setFilePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = null;
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
