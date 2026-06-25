"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  FileButton,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMapPin, IconPhoto } from "@tabler/icons-react";

import { HelpMapPanel } from "@/components/help-map-panel";
import { createHelpRequest } from "@/lib/api/help-requests";
import { uploadImage } from "@/lib/api/uploads";
import { SEVERITY_OPTIONS } from "@/lib/constants";
import type { HelpRequestSeverity, LatLng } from "@/lib/types/help-request";

type ReportHelpModalProps = {
  opened: boolean;
  onClose: () => void;
  onSubmitted: () => void;
};

export function ReportHelpModal({
  opened,
  onClose,
  onSubmitted,
}: ReportHelpModalProps) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<HelpRequestSeverity>("urgent");
  const [description, setDescription] = useState("");
  const [draftLocation, setDraftLocation] = useState<LatLng | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const resetOnClose = useRef(false);

  useEffect(() => {
    if (!opened || draftLocation || !navigator.geolocation) {
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
  }, [opened, draftLocation]);

  function resetForm() {
    setTitle("");
    setSeverity("urgent");
    setDescription("");
    setDraftLocation(null);
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
        message: "Marca tu ubicación en el mapa o usa el botón de geolocalización.",
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
        title: trimmedTitle,
        latitude: draftLocation.lat,
        longitude: draftLocation.lng,
        severity,
        description: description.trim(),
        attachment_ids: attachmentIds,
      });

      notifications.show({
        color: "green",
        title: "Solicitud enviada",
        message: "Tu pedido de ayuda fue registrado en el mapa.",
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
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Pedir ayuda"
      size="lg"
      centered
    >
      <Stack gap="md">
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
                : "Toca el mapa para marcar tu ubicación."}
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
          <Box
            style={{
              height: 220,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid var(--mantine-color-dark-4)",
            }}
          >
            <HelpMapPanel
              requests={[]}
              height={220}
              interactive
              draftLocation={draftLocation}
              onDraftLocationChange={setDraftLocation}
            />
          </Box>
        </Stack>

        <Textarea
          label="Detalles adicionales (opcional)"
          placeholder="Información extra que pueda ayudar a quienes respondan."
          minRows={3}
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Fotos (opcional)
          </Text>
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
                Adjuntar fotos
              </Button>
            )}
          </FileButton>
          {photos.length > 0 ? (
            <Text size="sm" c="dimmed">
              {photos.length}{" "}
              {photos.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}
            </Text>
          ) : null}
        </Stack>

        <Button onClick={handleSubmit} loading={submitting} size="md" color="red">
          Enviar solicitud
        </Button>
      </Stack>
    </Modal>
  );
}
