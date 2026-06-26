"use client";

import { useEffect } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { DEFAULT_ZOOM, VENEZUELA_CENTER, severityColor } from "@/lib/constants";
import { circleBounds } from "@/lib/geo";
import type { HelpRequest, LatLng } from "@/lib/types/help-request";

import "leaflet/dist/leaflet.css";

type HelpMapProps = {
  requests: HelpRequest[];
  interactive?: boolean;
  draftLocation?: LatLng | null;
  onDraftLocationChange?: (location: LatLng) => void;
  onRequestSelect?: (request: HelpRequest) => void;
  focusRequest?: HelpRequest | null;
  showMarkerTitles?: boolean;
  panToLocation?: LatLng | null;
  flyToLocation?: LatLng | null;
  /** When set with draftLocation, draws a geodesic circle and fits the map to it. */
  actionRadiusKm?: number | null;
};

function PanToLocationController({ location }: { location: LatLng }) {
  const map = useMap();

  useEffect(() => {
    const targetZoom = map.getZoom() < 11 ? 12 : map.getZoom();
    map.flyTo([location.lat, location.lng], targetZoom, { duration: 0.4 });
  }, [location.lat, location.lng, map]);

  return null;
}

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

function ActionRadiusFitController({
  location,
  radiusKm,
}: {
  location: LatLng;
  radiusKm: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (radiusKm <= 0) {
      return;
    }

    const bounds = circleBounds(location, radiusKm);
    map.whenReady(() => {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15, animate: true });
    });
  }, [location.lat, location.lng, radiusKm, map]);

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
  showMarkerTitles = false,
  panToLocation = null,
  flyToLocation = null,
  actionRadiusKm = null,
}: HelpMapProps) {
  const showActionRadius =
    draftLocation != null &&
    actionRadiusKm != null &&
    actionRadiusKm > 0;

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
          {showActionRadius ? (
            <ActionRadiusFitController
              location={draftLocation}
              radiusKm={actionRadiusKm}
            />
          ) : (
            <DraftLocationController location={draftLocation} />
          )}
          {showActionRadius ? (
            <Circle
              center={[draftLocation.lat, draftLocation.lng]}
              radius={actionRadiusKm * 1000}
              pathOptions={{
                color: "#1864ab",
                weight: 2,
                fillColor: "#228be6",
                fillOpacity: 0.2,
              }}
            />
          ) : null}
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
          >
            {showMarkerTitles ? (
              <Tooltip direction="top" offset={[0, -8]} opacity={0.92}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{request.title}</span>
              </Tooltip>
            ) : null}
          </CircleMarker>
        );
      })}
      {panToLocation ? (
        <>
          <PanToLocationController location={panToLocation} />
          <CircleMarker
            center={[panToLocation.lat, panToLocation.lng]}
            radius={12}
            pathOptions={{
              color: "#ffffff",
              weight: 4,
              fillColor: "#1971c2",
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Tu ubicación</span>
            </Tooltip>
          </CircleMarker>
        </>
      ) : null}
      {flyToLocation ? <PanToLocationController location={flyToLocation} /> : null}
    </MapContainer>
  );
}
