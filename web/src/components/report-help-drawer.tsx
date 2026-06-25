"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Drawer,
  FileButton,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMapPin, IconPhoto } from "@tabler/icons-react";

import { createHelpRequest } from "@/lib/api/help-requests";
import { uploadImage } from "@/lib/api/uploads";
import { SEVERITY_OPTIONS } from "@/lib/constants";
import type { HelpRequestSeverity } from "@/lib/types/help-request";

type LatLng = { lat: number; lng: number };

type ReportHelpDrawerProps = {
  opened: boolean;
  onClose: () => void;
  draftLocation: LatLng | null;
  onDraftLocationChange: (location: LatLng) => void;
  onSubmitted: () => void;
};

export function ReportHelpDrawer({
  opened,
  onClose,
  draftLocation,
  onDraftLocationChange,
  onSubmitted,
}: ReportHelpDrawerProps) {
  const [severity, setSeverity] = useState<HelpRequestSeverity>("urgent");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const resetOnClose = useRef(false);

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (draftLocation || !navigator.geolocation) {
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onDraftLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [opened, draftLocation, onDraftLocationChange]);

  function resetForm() {
    setSeverity("urgent");
    setDescription("");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setPhotos([]);
  }

  function handleClose() {
    if (!submitting) {
      onClose();
      if (resetOnClose.current) {
        resetForm();
        resetOnClose.current = false;
      }
    }
  }

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
        onDraftLocationChange({
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
    if (!draftLocation) {
      notifications.show({
        color: "red",
        title: "Ubicación requerida",
        message: "Marca un punto en el mapa o usa tu ubicación actual.",
      });
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 10) {
      notifications.show({
        color: "red",
        title: "Descripción muy corta",
        message: "Describe la situación con al menos 10 caracteres.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const attachmentIds: string[] = [];
      for (const photo of photos) {
        attachmentIds.push(await uploadImage(photo));
      }

      await createHelpRequest({
        latitude: draftLocation.lat,
        longitude: draftLocation.lng,
        severity,
        description: trimmedDescription,
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        attachment_ids: attachmentIds,
      });

      notifications.show({
        color: "green",
        title: "Solicitud enviada",
        message: "Tu pedido de ayuda fue registrado.",
      });

      resetOnClose.current = true;
      onSubmitted();
      handleClose();
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
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="bottom"
      size="85%"
      title="Pedir ayuda"
      overlayProps={{ opacity: 0.35 }}
    >
      <Stack gap="md">
        <Stack gap={4}>
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
                : "Toca el mapa o usa el botón de abajo."}
            </Text>
          )}
          <Button
            variant="light"
            leftSection={<IconMapPin size={16} />}
            onClick={useMyLocation}
            loading={locating}
          >
            Usar mi ubicación
          </Button>
        </Stack>

        <Select
          label="Urgencia"
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

        <Textarea
          label="Descripción"
          placeholder="¿Qué necesitas? Sé específico para que puedan ayudarte."
          minRows={4}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          required
        />

        <TextInput
          label="Nombre (opcional)"
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

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Fotos (opcional)
          </Text>
          <Group>
            <FileButton
              onChange={(files) => {
                if (files) {
                  setPhotos((current) => [...current, ...files]);
                }
              }}
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
            >
              {(props) => (
                <Button {...props} variant="default" leftSection={<IconPhoto size={16} />}>
                  Agregar fotos
                </Button>
              )}
            </FileButton>
          </Group>
          {photos.length > 0 ? (
            <Text size="sm" c="dimmed">
              {photos.length}{" "}
              {photos.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}
            </Text>
          ) : null}
        </Stack>

        <Button onClick={handleSubmit} loading={submitting} size="md">
          Enviar solicitud
        </Button>
      </Stack>
    </Drawer>
  );
}
