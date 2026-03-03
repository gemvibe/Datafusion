"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface RescueCenter {
  id: string;
  name: string;
  type?: string;
  address: string;
  contact_phone: string;
  contact_email?: string;
  capacity: number;
  current_load?: number;
  operational_status?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export function useCenters() {
  const [centers, setCenters] = useState<RescueCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase client is available
    if (!supabase) {
      setError("Supabase client not initialized");
      setLoading(false);
      return;
    }

    // Fetch initial centers
    fetchCenters();

    // Set up real-time subscription
    const channel = supabase
      .channel("centers-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "rescue_shelters",
        },
        (payload) => {
          console.log("Real-time center update:", payload);

          if (payload.eventType === "INSERT") {
            // Add new center
            setCenters((current) => [payload.new as RescueCenter, ...current]);
          } else if (payload.eventType === "UPDATE") {
            // Update existing center
            setCenters((current) =>
              current.map((center) =>
                center.id === payload.new.id ? (payload.new as RescueCenter) : center
              )
            );
          } else if (payload.eventType === "DELETE") {
            // Remove deleted center
            setCenters((current) =>
              current.filter((center) => center.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchCenters() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching centers from Supabase...");
      
      const { data, error } = await supabase
        .from("rescue_shelters")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          full: error
        });
        throw new Error(
          error.message || 
          error.details || 
          error.hint ||
          "Failed to fetch centers from database. The table may not exist or RLS policies may be blocking access."
        );
      }

      if (!data) {
        console.warn("No data returned from rescue_shelters query");
        setCenters([]);
      } else {
        console.log(`✅ Successfully loaded ${data.length} rescue centers`);
        setCenters(data);
      }
    } catch (err) {
      console.error("Error fetching centers:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Network error: Failed to connect to Supabase. Please check your connection.";
      setError(errorMessage);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  }

  return { centers, loading, error, refetch: fetchCenters };
}
