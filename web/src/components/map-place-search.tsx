"use client";

import { useEffect, useState } from "react";
import { Autocomplete, Loader } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";

import { searchPlaces } from "@/lib/geocode";
import { formatCoordinates, parseCoordinates } from "@/lib/parse-coordinates";
import type { LatLng } from "@/lib/types/help-request";

type MapPlaceSearchProps = {
  onLocationSelect: (location: LatLng) => void;
  label?: string;
  placeholder?: string;
};

type SearchOption = {
  value: string;
  label: string;
  location: LatLng;
};

function coordsOption(location: LatLng): SearchOption {
  const label = formatCoordinates(location);
  return {
    value: `coords:${label}`,
    label: `Coordenadas: ${label}`,
    location,
  };
}

export function MapPlaceSearch({
  onLocationSelect,
  label = "Buscar lugar o coordenadas",
  placeholder = "Ej.: Caracas o 10.611169, -67.017788",
}: MapPlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery] = useDebouncedValue(query, 400);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setOptions([]);
      setError(null);
      setLoading(false);
      return;
    }

    const coords = parseCoordinates(trimmed);
    if (coords) {
      setOptions([coordsOption(coords)]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void searchPlaces(trimmed)
      .then((results) => {
        if (cancelled) {
          return;
        }
        setOptions(
          results.map((result) => ({
            value: `place:${result.lat},${result.lng}:${result.label}`,
            label: result.label,
            location: { lat: result.lat, lng: result.lng },
          })),
        );
        if (results.length === 0) {
          setError("No se encontraron lugares.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOptions([]);
          setError("No se pudo buscar el lugar.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function selectOption(option: SearchOption) {
    onLocationSelect(option.location);
    setQuery(option.label.startsWith("Coordenadas:") ? formatCoordinates(option.location) : option.label);
    setError(null);
  }

  function tryApplyCoordinates(): boolean {
    const coords = parseCoordinates(query);
    if (!coords) {
      return false;
    }
    onLocationSelect(coords);
    setQuery(formatCoordinates(coords));
    setError(null);
    return true;
  }

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder}
      value={query}
      onChange={setQuery}
      data={options}
      filter={({ options: items }) => items}
      rightSection={loading ? <Loader size={16} /> : <IconSearch size={16} stroke={1.5} />}
      error={error}
      onOptionSubmit={(value) => {
        const option = options.find((item) => item.value === value);
        if (option) {
          selectOption(option);
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter") {
          return;
        }
        if (tryApplyCoordinates()) {
          event.preventDefault();
          return;
        }
        if (options.length === 1) {
          event.preventDefault();
          selectOption(options[0]);
        }
      }}
      onPaste={(event) => {
        const text = event.clipboardData.getData("text");
        const coords = parseCoordinates(text);
        if (!coords) {
          return;
        }
        event.preventDefault();
        onLocationSelect(coords);
        setQuery(formatCoordinates(coords));
        setOptions([coordsOption(coords)]);
        setError(null);
      }}
      onBlur={() => {
        tryApplyCoordinates();
      }}
    />
  );
}
