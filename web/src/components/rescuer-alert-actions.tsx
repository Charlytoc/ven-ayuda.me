"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconRoute } from "@tabler/icons-react";
import dayjs from "dayjs";

import {
  joinHelpRequest,
  resolveHelpRequest,
} from "@/lib/api/help-requests";
import {
  getRescuerToken,
  getRescuerUser,
  isRescuerLoggedIn,
} from "@/lib/rescuer-auth-storage";
import type { HelpRequest } from "@/lib/types/help-request";

type RescuerAlertActionsProps = {
  request: HelpRequest;
  onUpdated: (request: HelpRequest) => void;
};

export function RescuerAlertActions({
  request,
  onUpdated,
}: RescuerAlertActionsProps) {
  const [joining, setJoining] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  const loggedIn = isRescuerLoggedIn() && Boolean(getRescuerToken());
  const rescuerUser = getRescuerUser();
  const alreadyJoined =
    rescuerUser != null &&
    request.participants.some(
      (p) => p.rescuer_profile_id === rescuerUser.id,
    );

  if (!loggedIn || request.status === "resolved") {
    return null;
  }

  async function handleJoin() {
    setJoining(true);
    try {
      const updated = await joinHelpRequest(request.id);
      onUpdated(updated);
      notifications.show({
        color: "green",
        title: "En camino",
        message: "Te registraste para ir a esta alerta.",
      });
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: err instanceof Error ? err.message : "No se pudo registrar",
      });
    } finally {
      setJoining(false);
    }
  }

  async function handleResolve() {
    const note = resolutionNote.trim();
    if (!note) {
      notifications.show({
        color: "red",
        title: "Nota requerida",
        message: "Describe qué ocurrió antes de marcar la alerta como resuelta.",
      });
      return;
    }

    setResolving(true);
    try {
      const updated = await resolveHelpRequest(request.id, note);
      onUpdated(updated);
      setShowResolveForm(false);
      notifications.show({
        color: "green",
        title: "Alerta resuelta",
        message: "La emergencia fue marcada como atendida.",
      });
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: err instanceof Error ? err.message : "No se pudo resolver",
      });
    } finally {
      setResolving(false);
    }
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Text size="sm" fw={500}>
          Acciones de rescatista
        </Text>
        <Group gap="sm">
          <Button
            variant="light"
            leftSection={<IconRoute size={16} />}
            loading={joining}
            disabled={alreadyJoined}
            onClick={handleJoin}
          >
            {alreadyJoined ? "Ya vas en camino" : "Voy en camino"}
          </Button>
          {!showResolveForm ? (
            <Button
              variant="light"
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={() => setShowResolveForm(true)}
            >
              Marcar como resuelta
            </Button>
          ) : null}
        </Group>
        {showResolveForm ? (
          <Stack gap="sm">
            <Textarea
              label="Nota"
              description="Obligatoria: qué se hizo o qué se encontró al atender la emergencia."
              placeholder="Ej. personas evacuadas, heridos atendidos…"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.currentTarget.value)}
              minRows={2}
              required
            />
            <Group gap="sm">
              <Button
                color="green"
                loading={resolving}
                disabled={!resolutionNote.trim()}
                onClick={handleResolve}
              >
                Confirmar resolución
              </Button>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  setShowResolveForm(false);
                  setResolutionNote("");
                }}
              >
                Cancelar
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}

type HelpRequestStatusSectionProps = {
  request: HelpRequest;
};

export function HelpRequestStatusSection({
  request,
}: HelpRequestStatusSectionProps) {
  return (
    <Stack gap="sm">
      {request.participants.length > 0 ? (
        <Paper withBorder radius="md" p="md">
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              {request.participants.length === 1
                ? "1 rescatista en camino"
                : `${request.participants.length} rescatistas en camino`}
            </Text>
            <Text size="sm" c="dimmed">
              {request.participants.map((p) => p.display_name).join(", ")}
            </Text>
          </Stack>
        </Paper>
      ) : null}

      {request.status === "resolved" && request.resolved_by_name ? (
        <Paper withBorder radius="md" p="md">
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              Resuelta por {request.resolved_by_name}
            </Text>
            {request.resolved_at ? (
              <Text size="sm" c="dimmed">
                {dayjs(request.resolved_at).format("D MMM YYYY, HH:mm")}
              </Text>
            ) : null}
            {request.resolution_note ? (
              <Text size="sm">{request.resolution_note}</Text>
            ) : null}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
