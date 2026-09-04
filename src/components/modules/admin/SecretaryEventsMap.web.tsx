"use client";

import type { AttentionEvent } from "@/src/types/catalog";
import { useEffect, useMemo } from "react";
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

export function SecretaryEventsMap({
  events,
  requestCounts = {},
}: {
  events: AttentionEvent[];
  requestCounts?: Record<string, number>;
}) {
  const eventsWithLocation = useMemo(
    () =>
      events.flatMap((event) => {
        const latitude = Number(event.latitude);
        const longitude = Number(event.longitude);

        return Number.isFinite(latitude) && Number.isFinite(longitude)
          ? [{ ...event, latitude, longitude }]
          : [];
      }),
    [events],
  );

  return (
    <div style={{ height: 430, width: "100%", overflow: "hidden", borderRadius: 16 }}>
      <MapContainer center={[17.8409, -92.6189]} zoom={8} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitEvents events={eventsWithLocation} />
        {eventsWithLocation.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.latitude, event.longitude]}
            radius={9}
            pathOptions={{ color: "#7a1239", fillColor: "#b91c5c", fillOpacity: 0.85 }}
          >
            <Popup>
              <div style={{ minWidth: 230, lineHeight: 1.45 }}>
              <strong style={{ fontSize: 15 }}>{event.name}</strong><br />
              <span style={{ color: event.active && new Date(event.endsAt).getTime() >= Date.now() ? "#15803d" : "#71717a", fontWeight: 600 }}>
                {event.active && new Date(event.endsAt).getTime() >= Date.now() ? "Activo" : "Finalizado"}
              </span>
              <hr style={{ border: 0, borderTop: "1px solid #e4e4e7", margin: "8px 0" }} />
              <strong>Ubicación:</strong> {event.venue || event.locality}<br />
              {event.address ? <><span>{event.address}</span><br /></> : null}
              <span>{event.locality}, {event.municipality}</span><br />
              <strong>Inicio:</strong> {new Date(event.startsAt).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
                dateStyle: "medium",
                timeStyle: "short",
              })}<br />
              <strong>Término:</strong> {new Date(event.endsAt).toLocaleString("es-MX", {
                timeZone: "America/Mexico_City",
                dateStyle: "medium",
                timeStyle: "short",
              })}<br />
              <strong>Folio:</strong> {event.folioPrefix}<br />
              <strong>Solicitudes:</strong> {requestCounts[event.id] || 0}
              {event.notes ? <><hr style={{ border: 0, borderTop: "1px solid #e4e4e7", margin: "8px 0" }} /><span>{event.notes}</span></> : null}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
