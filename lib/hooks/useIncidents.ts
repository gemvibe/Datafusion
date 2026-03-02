"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type IncidentStatus = 
  | "pending"
  | "assigned"
  | "en_route"
  | "on_scene"
  | "resolved"
  | "cancelled";

export type IncidentUrgency = "critical" | "high" | "medium" | "low";

export type IncidentType =
  | "flood"
  | "earthquake"
  | "cyclone"
  | "tsunami"
  | "landslide"
  | "heatwave";

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  urgency: IncidentUrgency;
  urgency_score: number;
  status: IncidentStatus;
  address: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  location_confidence?: number;
  people_affected: number;
  reported_by?: string;
  reporter_phone?: string;
  report_source: "manual" | "sms" | "voice" | "social" | "chatbot";
  ai_summary?: string;
  need_types?: string[];
  ai_confidence?: number;
  credibility_score?: number;
  is_fake_signal?: boolean;
  ai_reasoning?: string;
  created_at: string;
  updated_at?: string;
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial incidents
    fetchIncidents();

    // Set up real-time subscription
    const channel = supabase
      .channel("incidents-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "incidents",
        },
        (payload) => {
          console.log("Real-time incident update:", payload);

          if (payload.eventType === "INSERT") {
            // Add new incident
            setIncidents((current) => [payload.new as Incident, ...current]);
          } else if (payload.eventType === "UPDATE") {
            // Update existing incident
            setIncidents((current) =>
              current.map((incident) =>
                incident.id === payload.new.id ? (payload.new as Incident) : incident
              )
            );
          } else if (payload.eventType === "DELETE") {
            // Remove deleted incident
            setIncidents((current) =>
              current.filter((incident) => incident.id !== payload.old.id)
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

  async function fetchIncidents() {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to fetch incidents from database");
      }

      setIncidents(data || []);
      console.log(`Loaded ${data?.length || 0} incidents from database`);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch incidents";
      setError(errorMessage);
      // Don't throw - just set error state so UI can handle it
      setIncidents([]); // Set empty array to show demo markers
    } finally {
      setLoading(false);
    }
  }

  return { incidents, loading, error, refetch: fetchIncidents };
}
