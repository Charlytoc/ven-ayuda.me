"use client";

import {
  Anchor,
  Badge,
  Button,
  Group,
  Image,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconExternalLink, IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import dayjs from "dayjs";
import "dayjs/locale/es";

import { attachmentPublicUrl } from "@/lib/api/uploads";
import { severityColor, severityLabel } from "@/lib/constants";
import type { HelpRequest } from "@/lib/types/help-request";

dayjs.locale("es");

type HelpRequestDetailModalProps = {
  request: HelpRequest | null;
  opened: boolean;
  onClose: () => void;
};

function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function HelpRequestDetailModal({
  request,
  opened,
  onClose,
}: HelpRequestDetailModalProps) {
  if (!request) {
    return null;
  }

  const lat = Number(request.latitude);
  const lng = Number(request.longitude);
  const hasContact =
    request.contact_name || request.contact_phone || request.contact_email;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Detalle de la solicitud"
      size="lg"
      centered
    >
      <Stack gap="md">
        <Group gap="sm" align="flex-start">
          <Title order={3} style={{ flex: 1 }}>
            {request.title}
          </Title>
          <Badge
            variant="filled"
            style={{ backgroundColor: severityColor(request.severity) }}
          >
            {severityLabel(request.severity)}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          Reportado {dayjs(request.created).format("D MMM YYYY, HH:mm")}
        </Text>

        {request.description ? (
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              ¿Qué está pasando?
            </Text>
            <Text size="sm">{request.description}</Text>
          </Stack>
        ) : null}

        {hasContact ? (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Contacto
            </Text>
            {request.contact_name ? (
              <Text size="sm">{request.contact_name}</Text>
            ) : null}
            {request.contact_phone ? (
              <Anchor
                size="sm"
                href={`tel:${request.contact_phone}`}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <IconPhone size={14} />
                {request.contact_phone}
              </Anchor>
            ) : null}
            {request.contact_email ? (
              <Anchor
                size="sm"
                href={`mailto:${request.contact_email}`}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <IconMail size={14} />
                {request.contact_email}
              </Anchor>
            ) : null}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            Sin datos de contacto publicados.
          </Text>
        )}

        {!Number.isNaN(lat) && !Number.isNaN(lng) ? (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Ubicación
            </Text>
            <Text size="sm" c="dimmed">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </Text>
            <Button
              component="a"
              href={directionsUrl(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              leftSection={<IconMapPin size={16} />}
              rightSection={<IconExternalLink size={14} />}
            >
              Cómo llegar
            </Button>
          </Stack>
        ) : null}

        {request.attachment_ids.length > 0 ? (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Fotos
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
              {request.attachment_ids.map((id) => (
                <Anchor
                  key={id}
                  href={attachmentPublicUrl(id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={attachmentPublicUrl(id)}
                    alt="Adjunto"
                    radius="sm"
                    h={100}
                    fit="cover"
                  />
                </Anchor>
              ))}
            </SimpleGrid>
          </Stack>
        ) : null}
      </Stack>
    </Modal>
  );
}
