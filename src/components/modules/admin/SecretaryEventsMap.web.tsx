"use client";

import type { AttentionEvent } from "@/src/types/catalog";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";

if (typeof window !== "undefined") require("leaflet/dist/leaflet.css");

function FitEvents({ events }: { events: AttentionEvent[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = events.filter(
      (event) => Number.isFinite(event.latitude) && Number.isFinite(event.longitude),
    );
    if (valid.length) {
      map.fitBounds(
        latLngBounds(valid.map((event) => [event.latitude, event.longitude])),
        { padding: [35, 35], maxZoom: 14 },
      );
    } else {
      map.setView([17.8409, -92.6189], 8);
    }
  }, [events, map]);
  return null;
}

export function SecretaryEventsMap({ events }: { events: AttentionEvent[] }) {
  return (
    <div style={{ height: 430, width: "100%", overflow: "hidden", borderRadius: 16 }}>
      <MapContainer center={[17.8409, -92.6189]} zoom={8} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitEvents events={events} />
        {events.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.latitude, event.longitude]}
            radius={9}
            pathOptions={{ color: "#7a1239", fillColor: "#b91c5c", fillOpacity: 0.85 }}
          >
            <Popup>
              <strong>{event.name}</strong><br />
              {event.locality}, {event.municipality}<br />
              {new Date(event.startsAt).toLocaleString("es-MX")}<br />
              Folio: {event.folioPrefix}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
