"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import { Incident } from "@/lib/hooks/useIncidents";

// Fix for default marker icons in React-Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Enhanced custom marker icons for First72 severity levels
const createIncidentIcon = (urgency: number, isNew: boolean = false) => {
  let color = "#10b981"; // Green for low
  let label = "SAFE";
  let pulseClass = "";

  if (urgency >= 8) {
    color = "#ef4444"; // Red for critical
    label = "CRITICAL";
    pulseClass = isNew ? "animate-pulse" : "";
  } else if (urgency >= 6) {
    color = "#f97316"; // Orange for high
    label = "HIGH";
  } else if (urgency >= 4) {
    color = "#eab308"; // Yellow for medium
    label = "MODERATE";
  }

  return L.divIcon({
    className: "custom-incident-marker",
    html: `
      <div class="${pulseClass}" style="position: relative;">
        <div style="
          background-color: ${color}; 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 16px;
        ">
          ${urgency >= 8 ? "🆘" : urgency >= 6 ? "⚠️" : "📍"}
        </div>
        ${isNew ? `<div style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white;">NEW</div>` : ""}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Rescue Shelter icon (shelters, fire stations, etc.)
const createRescueShelterIcon = () => {
  return L.divIcon({
    className: "rescue-shelter-marker",
    html: `
      <div style="
        background-color: #3b82f6; 
        width: 36px; 
        height: 36px; 
        border-radius: 8px; 
        border: 3px solid white; 
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">
        🏥
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

interface RescueShelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  status: string;
  capacity?: number;
  contact?: string;
}

interface IncidentMapProps {
  incidents?: Incident[];
  rescueShelters?: RescueShelter[];
  center?: [number, number];
  zoom?: number;
  showRouting?: boolean;
  highlightCritical?: boolean;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest rescue shelter to an incident
function findNearestCenter(incident: Incident, centers: RescueShelter[]) {
  if (!incident.latitude || !incident.longitude || centers.length === 0) return null;
  
  let nearest = centers[0];
  let minDistance = calculateDistance(
    incident.latitude, 
    incident.longitude, 
    centers[0].latitude, 
    centers[0].longitude
  );

  centers.forEach(center => {
    const distance = calculateDistance(
      incident.latitude!, 
      incident.longitude!, 
      center.latitude, 
      center.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = center;
    }
  });

  return { center: nearest, distance: minDistance };
}

export function IncidentMap({ 
  incidents = [], 
  rescueShelters = [],
  center = [11.1271, 78.6569], // Center of Tamil Nadu
  zoom = 7,
  showRouting = false,
  highlightCritical = true
}: IncidentMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if incident is new (created in last 5 minutes)
  const isNewIncident = (createdAt: string) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(createdAt) > fiveMinutesAgo;
  };

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading First72 Map...</div>
      </div>
    );
  }

  // Demo rescue shelters if none provided - Tamil Nadu locations
  const defaultCenters: RescueShelter[] = [
    { id: "1", name: "Chennai Emergency Hub", latitude: 13.0827, longitude: 80.2707, type: "hospital", status: "active" },
    { id: "2", name: "Coimbatore Response Center", latitude: 11.0168, longitude: 76.9558, type: "fire_station", status: "active" },
    { id: "3", name: "Madurai Relief Station", latitude: 9.9252, longitude: 78.1198, type: "shelter", status: "active" },
    { id: "4", name: "Trichy Medical Center", latitude: 10.7905, longitude: 78.7047, type: "hospital", status: "active" },
  ];

  const centersToShow = rescueShelters.length > 0 ? rescueShelters : defaultCenters;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="w-full h-[600px] rounded-lg shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Rescue Shelters - First Responder Locations */}
      {centersToShow.map((rescueShelter) => (
        <Marker
          key={rescueShelter.id}
          position={[rescueShelter.latitude, rescueShelter.longitude]}
          icon={createRescueShelterIcon()}
        >
          <Popup>
            <div className="p-3 min-w-[220px]">
              <div className="font-bold text-blue-600 mb-2 flex items-center gap-2">
                🏥 {rescueShelter.name}
              </div>
              <div className="text-sm space-y-1">
                <div>📍 Type: <span className="capitalize">{rescueShelter.type.replace("_", " ")}</span></div>
                <div>📊 Status: <span className="text-green-600 font-semibold capitalize">{rescueShelter.status}</span></div>
                {rescueShelter.capacity && (
                  <div>👥 Capacity: {rescueShelter.capacity} people</div>
                )}
                {rescueShelter.contact && (
                  <div>📞 {rescueShelter.contact}</div>
                )}
              </div>
            </div>
          </Popup>
          {/* Coverage radius circle */}
          <Circle
            center={[rescueShelter.latitude, rescueShelter.longitude]}
            radius={10000} // 10km coverage
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.05,
              weight: 1,
              dashArray: "5, 5",
            }}
          />
        </Marker>
      ))}

      {/* Incident Markers */}
      {incidents.map((incident) => {
        if (!incident.latitude || !incident.longitude) return null;
        
        const isNew = isNewIncident(incident.created_at);
        const isCritical = (incident.urgency_score || 0) >= 8;
        const nearestInfo = findNearestCenter(incident, centersToShow);

        return (
          <div key={incident.id}>
            <Marker
              position={[incident.latitude, incident.longitude]}
              icon={createIncidentIcon(incident.urgency_score || 5, isNew)}
              eventHandlers={{
                click: () => setSelectedIncident(incident.id),
              }}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-gray-900">
                      Incident #{incident.id.slice(0, 8)}
                    </div>
                    {isNew && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* AI Summary */}
                  <div className="text-sm mb-3 text-gray-700 font-medium">
                    {incident.ai_summary || incident.description || "Emergency reported"}
                  </div>

                  {/* Details Grid */}
                  <div className="text-xs space-y-2 border-t pt-2">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="text-gray-600">{incident.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span>🔥</span>
                      <span className={`font-bold ${
                        (incident.urgency_score || 0) >= 8 ? "text-red-600" :
                        (incident.urgency_score || 0) >= 6 ? "text-orange-600" :
                        (incident.urgency_score || 0) >= 4 ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        Urgency: {incident.urgency_score || "N/A"}/10
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>📊</span>
                      <span className="capitalize">{incident.status}</span>
                    </div>

                    {incident.need_types && incident.need_types.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span>🏥</span>
                        <span className="flex-1">{incident.need_types.join(", ")}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span className="text-gray-500">
                        {new Date(incident.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Nearest Center Info */}
                    {nearestInfo && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs font-semibold text-blue-700 mb-1">
                          📍 Smart Dispatch
                        </div>
                        <div className="text-xs text-gray-600">
                          Nearest: <span className="font-medium">{nearestInfo.center.name}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Distance: <span className="font-medium">{nearestInfo.distance.toFixed(1)} km</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 font-medium">
                      Assign Team
                    </button>
                    <button className="flex-1 text-xs border border-gray-300 px-3 py-2 rounded hover:bg-gray-50 font-medium">
                      View Full
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Show routing line if requested and critical */}
            {showRouting && isCritical && nearestInfo && (
              <Polyline
                positions={[
                  [incident.latitude, incident.longitude],
                  [nearestInfo.center.latitude, nearestInfo.center.longitude],
                ]}
                pathOptions={{
                  color: "#ef4444",
                  weight: 2,
                  opacity: 0.6,
                  dashArray: "10, 10",
                }}
              />
            )}

            {/* Highlight circle for critical incidents */}
            {highlightCritical && isCritical && (
              <Circle
                center={[incident.latitude, incident.longitude]}
                radius={2000}
                pathOptions={{
                  color: "#ef4444",
                  fillColor: "#ef4444",
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            )}
          </div>
        );
      })}

      {/* Demo markers if no real incidents - Tamil Nadu locations */}
      {incidents.length === 0 && (
        <>
          <Marker position={[13.0827, 80.2707]} icon={createIncidentIcon(9, true)}>
            <Popup>
              <div className="p-2">
                <div className="font-bold text-red-600">🆘 CRITICAL - Demo</div>
                <div className="text-sm">Flood Emergency - Chennai</div>
                <div className="text-xs text-gray-600">Urgency: 9/10</div>
              </div>
            </Popup>
          </Marker>
          <Marker position={[11.0168, 76.9558]} icon={createIncidentIcon(7)}>
            <Popup>
              <div className="p-2">
                <div className="font-bold text-orange-600">⚠️ HIGH - Demo</div>
                <div className="text-sm">Earthquake Alert - Coimbatore</div>
                <div className="text-xs text-gray-600">Urgency: 7/10</div>
              </div>
            </Popup>
          </Marker>
          <Marker position={[9.9252, 78.1198]} icon={createIncidentIcon(5)}>
            <Popup>
              <div className="p-2">
                <div className="font-bold text-yellow-600">📍 MODERATE - Demo</div>
                <div className="text-sm">Supplies Needed - Madurai</div>
                <div className="text-xs text-gray-600">Urgency: 5/10</div>
              </div>
            </Popup>
          </Marker>
          <Marker position={[10.7905, 78.7047]} icon={createIncidentIcon(4)}>
            <Popup>
              <div className="p-2">
                <div className="font-bold text-yellow-600">📍 MODERATE - Demo</div>
                <div className="text-sm">Road Block - Trichy</div>
                <div className="text-xs text-gray-600">Urgency: 4/10</div>
              </div>
            </Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}
