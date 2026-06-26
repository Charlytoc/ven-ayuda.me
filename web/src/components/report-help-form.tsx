"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMapPin } from "@tabler/icons-react";

import { HelpMapPanel } from "@/components/help-map-panel";
import { MapPlaceSearch } from "@/components/map-place-search";
import {
  PhotoAttachmentsField,
  usePhotoAttachments,
} from "@/components/photo-attachments-field";
import { createHelpRequest } from "@/lib/api/help-requests";
import { uploadImage } from "@/lib/api/uploads";
import { SEVERITY_OPTIONS } from "@/lib/constants";
import { roundGeoCoord } from "@/lib/geo";
import { helpRequestPath } from "@/lib/help-request-path";
import type { HelpRequestSeverity, LatLng } from "@/lib/types/help-request";

const MAP_HEIGHT = 320;

export function ReportHelpForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<HelpRequestSeverity>("urgent");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [draftLocation, setDraftLocation] = useState<LatLng | null>(null);
  const { photos, setPhotos, clearPhotos } = usePhotoAttachments();
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (draftLocation || !navigator.geolocation) {
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraftLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [draftLocation]);

  async function useMyLocation() {
    if (!navigator.geolocation) {
      notifications.show({
        color: "red",
        title: "Ubicación no disponible",
        message: "Tu navegador no soporta geolocalización.",
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraftLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        notifications.show({
          color: "red",
          title: "No se pudo obtener la ubicación",
          message: "Permite el acceso a la ubicación o marca un punto en el mapa.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      notifications.show({
        color: "red",
        title: "Título requerido",
        message: "Escribe un título breve (mínimo 3 caracteres).",
      });
      return;
    }

    if (!draftLocation) {
      notifications.show({
        color: "red",
        title: "Ubicación requerida",
        message:
          "Busca un lugar, pega coordenadas, marca el mapa o usa geolocalización.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const attachmentIds: string[] = [];
      for (const photo of photos) {
        attachmentIds.push(await uploadImage(photo.file));
      }

      const created = await createHelpRequest({
        title: trimmedTitle,
        latitude: roundGeoCoord(draftLocation.lat),
        longitude: roundGeoCoord(draftLocation.lng),
        severity,
        description: description.trim(),
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        attachment_ids: attachmentIds,
      });

      notifications.show({
        color: "green",
        title: "Solicitud enviada",
        message: "Tu pedido de ayuda fue registrado en el mapa.",
      });

      clearPhotos();
      router.push(helpRequestPath(created.id));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar la solicitud.";
      notifications.show({
        color: "red",
        title: "Error",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={2}>Pedir ayuda</Title>
        <Text size="sm" c="dimmed">
          Puedes reportar una emergencia para ti o para otra persona. Marca la
          ubicación exacta donde se necesita asistencia.
        </Text>
      </Stack>

      <TextInput
        label="Título"
        placeholder="Ej.: Familia atrapada, falta agua, herido grave…"
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
        required
      />

      <Select
        label="Gravedad de la emergencia"
        data={SEVERITY_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        value={severity}
        onChange={(value) => {
          if (value) {
            setSeverity(value as HelpRequestSeverity);
          }
        }}
      />

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Ubicación
        </Text>
        {draftLocation ? (
          <Text size="sm" c="dimmed">
            {draftLocation.lat.toFixed(5)}, {draftLocation.lng.toFixed(5)}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            {locating
              ? "Obteniendo tu ubicación…"
              : "Busca un lugar, pega coordenadas o toca el mapa."}
          </Text>
        )}
        <MapPlaceSearch onLocationSelect={setDraftLocation} />
        <Button
          variant="light"
          leftSection={<IconMapPin size={16} />}
          onClick={useMyLocation}
          loading={locating}
        >
          Usar mi ubicación
        </Button>
        <Box
          className="leaflet-contained"
          style={{
            height: MAP_HEIGHT,
            position: "relative",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--mantine-color-dark-4)",
          }}
        >
          <HelpMapPanel
            requests={[]}
            height={MAP_HEIGHT}
            contained
            interactive
            draftLocation={draftLocation}
            onDraftLocationChange={setDraftLocation}
          />
        </Box>
      </Stack>

      <Textarea
        label="Detalles adicionales (opcional)"
        placeholder="Información extra que pueda ayudar a quienes respondan."
        minRows={4}
        value={description}
        onChange={(event) => setDescription(event.currentTarget.value)}
      />

      <TextInput
        label="Nombre de contacto (opcional)"
        placeholder="Quién puede responder si llaman"
        value={contactName}
        onChange={(event) => setContactName(event.currentTarget.value)}
      />
      <TextInput
        label="Teléfono (opcional)"
        value={contactPhone}
        onChange={(event) => setContactPhone(event.currentTarget.value)}
      />
      <TextInput
        label="Correo (opcional)"
        type="email"
        value={contactEmail}
        onChange={(event) => setContactEmail(event.currentTarget.value)}
      />

      <PhotoAttachmentsField photos={photos} onChange={setPhotos} />

      <Button onClick={handleSubmit} loading={submitting} size="md" color="red">
        Enviar solicitud
      </Button>
    </Stack>
  );
}
