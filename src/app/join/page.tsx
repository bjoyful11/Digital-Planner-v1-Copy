"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function JoinCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const joinCategory = async () => {
      const token = searchParams.get("token");
      const categoryId = searchParams.get("category");
      if (!token || !categoryId) {
        setStatus("error");
        setMessage("Invalid invite link.");
        return;
      }
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setStatus("error");
        setMessage("You must be logged in to join a category. Please sign in and try again.");
        return;
      }
      // Verify invite token and category
      const { data: category, error } = await supabase
        .from("categories")
        .select("id, invite_token, invite_expiry, shared_with")
        .eq("id", categoryId)
        .eq("invite_token", token)
        .single();
      if (error || !category) {
        setStatus("error");
        setMessage("Invalid or expired invite link.");
        return;
      }
      // Check expiry
      if (category.invite_expiry && new Date(category.invite_expiry) < new Date()) {
        setStatus("error");
        setMessage("This invite link has expired.");
        return;
      }
      // Add user to shared_with if not already
      const userId = session.user.id;
      const alreadyShared = Array.isArray(category.shared_with) && category.shared_with.includes(userId);
      if (!alreadyShared) {
        const { error: updateError } = await supabase
          .from("categories")
          .update({ shared_with: [...(category.shared_with || []), userId] })
          .eq("id", categoryId);
        if (updateError) {
          setStatus("error");
          setMessage("Failed to join the category. Please try again later.");
          return;
        }
      }
      setStatus("success");
      setMessage("You have successfully joined the category! You can now access it from your dashboard.");
      // Optionally, redirect after a delay
      // setTimeout(() => router.push("/"), 2000);
    };
    joinCategory();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full mt-20">
        <h1 className="text-2xl font-bold mb-4 text-center">Join Category</h1>
        {status === "loading" && <p className="text-gray-600 dark:text-gray-300 text-center">Verifying invite...</p>}
        {status !== "loading" && (
          <p className={status === "success" ? "text-green-600 dark:text-green-400 text-center" : "text-red-600 dark:text-red-400 text-center"}>{message}</p>
        )}
      </div>
    </div>
  );
} 