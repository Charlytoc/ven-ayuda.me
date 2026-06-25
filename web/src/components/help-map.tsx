"use client";

import { useEffect } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

import { DEFAULT_ZOOM, VENEZUELA_CENTER, severityColor } from "@/lib/constants";
import type { HelpRequest, LatLng } from "@/lib/types/help-request";

import "leaflet/dist/leaflet.css";

type HelpMapProps = {
  requests: HelpRequest[];
  interactive?: boolean;
  draftLocation?: LatLng | null;
  onDraftLocationChange?: (location: LatLng) => void;
};

function MapClickHandler({
  onDraftLocationChange,
}: {
  onDraftLocationChange: (location: LatLng) => void;
}) {
  useMapEvents({
    click(event) {
      onDraftLocationChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });
  return null;
}

function DraftPin({ location }: { location: LatLng }) {
  const map = useMap();

  useEffect(() => {
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#228be6;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    const marker = L.marker([location.lat, location.lng], { icon }).addTo(map);
    return () => {
      marker.remove();
    };
  }, [location.lat, location.lng, map]);

  return null;
}

function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

export function HelpMap({
  requests,
  interactive = false,
  draftLocation = null,
  onDraftLocationChange,
}: HelpMapProps) {
  return (
    <MapContainer
      center={[VENEZUELA_CENTER.lat, VENEZUELA_CENTER.lng]}
      zoom={DEFAULT_ZOOM}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInvalidator />
      {interactive && onDraftLocationChange ? (
        <MapClickHandler onDraftLocationChange={onDraftLocationChange} />
      ) : null}
      {interactive && draftLocation ? <DraftPin location={draftLocation} /> : null}
      {requests.map((request) => {
        const lat = Number(request.latitude);
        const lng = Number(request.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          return null;
        }
        return (
          <CircleMarker
            key={request.id}
            center={[lat, lng]}
            radius={interactive ? 10 : 8}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: severityColor(request.severity),
              fillOpacity: 0.92,
            }}
          />
        );
      })}
    </MapContainer>
  );
}
