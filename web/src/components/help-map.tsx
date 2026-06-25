"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

import { DEFAULT_ZOOM, VENEZUELA_CENTER, severityColor } from "@/lib/constants";
import type { HelpRequest, LatLng } from "@/lib/types/help-request";

import "leaflet/dist/leaflet.css";

type HelpMapProps = {
  requests: HelpRequest[];
  interactive?: boolean;
  draftLocation?: LatLng | null;
  onDraftLocationChange?: (location: LatLng) => void;
  onRequestSelect?: (request: HelpRequest) => void;
  focusRequest?: HelpRequest | null;
};

function FocusedRequestController({ request }: { request: HelpRequest }) {
  const map = useMap();
  const lat = Number(request.latitude);
  const lng = Number(request.longitude);

  useEffect(() => {
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return;
    }
    map.flyTo([lat, lng], 15, { duration: 0.5 });
  }, [lat, lng, map, request.id]);

  return null;
}

function DraftLocationController({ location }: { location: LatLng }) {
  const map = useMap();

  useEffect(() => {
    const targetZoom = map.getZoom() < 12 ? 14 : map.getZoom();
    map.flyTo([location.lat, location.lng], targetZoom, { duration: 0.4 });
  }, [location.lat, location.lng, map]);

  return null;
}

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
  onRequestSelect,
  focusRequest = null,
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
      {focusRequest ? <FocusedRequestController request={focusRequest} /> : null}
      {interactive && onDraftLocationChange ? (
        <MapClickHandler onDraftLocationChange={onDraftLocationChange} />
      ) : null}
      {interactive && draftLocation ? (
        <>
          <DraftLocationController location={draftLocation} />
          <CircleMarker
            center={[draftLocation.lat, draftLocation.lng]}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#228be6",
              fillOpacity: 1,
            }}
          />
        </>
      ) : null}
      {requests.map((request) => {
        const lat = Number(request.latitude);
        const lng = Number(request.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          return null;
        }
        const isFocused = focusRequest?.id === request.id;
        return (
          <CircleMarker
            key={request.id}
            center={[lat, lng]}
            radius={isFocused ? 14 : interactive ? 10 : 8}
            pathOptions={{
              color: "#ffffff",
              weight: isFocused ? 3 : 2,
              fillColor: severityColor(request.severity),
              fillOpacity: 0.92,
            }}
            eventHandlers={
              onRequestSelect
                ? {
                    click: () => {
                      onRequestSelect(request);
                    },
                  }
                : undefined
            }
          />
        );
      })}
    </MapContainer>
  );
}
