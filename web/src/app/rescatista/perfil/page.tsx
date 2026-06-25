"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AppShell,
  Box,
  Button,
  Container,
  Loader,
  Paper,
  Slider,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBell, IconMapPin } from "@tabler/icons-react";

import { HelpMapPanel } from "@/components/help-map-panel";
import { HomeNavbar } from "@/components/home-navbar";
import { fetchAuthMe, refreshRescuerSession } from "@/lib/api/auth";
import {
  fetchVapidPublicKey,
  savePushSubscription,
  updateRescuerProfile,
} from "@/lib/api/rescuers";
import {
  clearRescuerSession,
  getRescuerToken,
} from "@/lib/rescuer-auth-storage";
import type { AuthMeResponse } from "@/lib/types/rescuer";
import type { LatLng } from "@/lib/types/help-request";
import { roundGeoCoord } from "@/lib/geo";
import {
  subscribeToPush,
  subscriptionToPayload,
  unsubscribeFromPush,
} from "@/lib/web-push";

const MAP_HEIGHT = 320;
const RADIUS_MIN = 1;
const RADIUS_MAX = 50;

export default function RescatistaPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushActive, setPushActive] = useState(false);
  const [locating, setLocating] = useState(false);

  const loadProfile = useCallback(async () => {
    const token = getRescuerToken();
    if (!token) {
      router.replace("/rescatista/entrar");
      return;
    }

    try {
      const data = await fetchAuthMe(token);
      setMe(data);
      setRadiusKm(
        Math.min(
          RADIUS_MAX,
          Math.max(RADIUS_MIN, data.rescuer_profile.action_radius_km),
        ),
      );
      setNotificationsEnabled(data.rescuer_profile.notifications_enabled);
      if (
        data.rescuer_profile.latitude != null &&
        data.rescuer_profile.longitude != null
      ) {
        setLocation({
          lat: Number(data.rescuer_profile.latitude),
          lng: Number(data.rescuer_profile.longitude),
        });
      }
    } catch {
      clearRescuerSession();
      router.replace("/rescatista/entrar");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (location || !navigator.geolocation || loading) {
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [location, loading]);

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
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        notifications.show({
          color: "red",
          title: "Ubicación",
          message: "No se pudo obtener tu ubicación.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleSave() {
    const token = getRescuerToken();
    if (!token) {
      return;
    }
    if (!location) {
      notifications.show({
        color: "red",
        title: "Ubicación requerida",
        message: "Marca tu ubicación en el mapa.",
      });
      return;
    }

    setSaving(true);
    try {
      const profile = await updateRescuerProfile(token, {
        latitude: roundGeoCoord(location.lat),
        longitude: roundGeoCoord(location.lng),
        action_radius_km: radiusKm,
        notifications_enabled: notificationsEnabled,
        phone: me?.rescuer_profile.phone,
      });
      await refreshRescuerSession(token);
      setMe((prev) =>
        prev
          ? {
              ...prev,
              rescuer_profile: profile,
            }
          : prev,
      );
      notifications.show({
        color: "green",
        title: "Perfil guardado",
        message: "Tu radio de acción quedó actualizado.",
      });
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: err instanceof Error ? err.message : "No se pudo guardar",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEnablePush() {
    const token = getRescuerToken();
    if (!token) {
      return;
    }

    setPushLoading(true);
    try {
      const publicKey = await fetchVapidPublicKey();
      const subscription = await subscribeToPush(publicKey);
      await savePushSubscription(token, subscriptionToPayload(subscription));
      setPushActive(true);
      notifications.show({
        color: "green",
        title: "Notificaciones activadas",
        message: "Te avisaremos cuando haya alertas en tu zona.",
      });
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Notificaciones",
        message:
          err instanceof Error ? err.message : "No se pudieron activar",
      });
    } finally {
      setPushLoading(false);
    }
  }

  async function handleDisablePush() {
    const token = getRescuerToken();
    if (!token) {
      return;
    }

    setPushLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const { deletePushSubscription } = await import("@/lib/api/rescuers");
        await deletePushSubscription(token, subscription.endpoint);
        await unsubscribeFromPush();
      }
      setPushActive(false);
      notifications.show({
        color: "gray",
        title: "Notificaciones desactivadas",
        message: "Ya no recibirás avisos push en este dispositivo.",
      });
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: err instanceof Error ? err.message : "No se pudo desactivar",
      });
    } finally {
      setPushLoading(false);
    }
  }

  function handleLogout() {
    clearRescuerSession();
    router.push("/");
  }

  if (loading) {
    return (
      <AppShell header={{ height: 60 }}>
        <HomeNavbar title="Mi perfil" showBack />
        <AppShell.Main>
          <Stack align="center" py="xl">
            <Loader />
          </Stack>
        </AppShell.Main>
      </AppShell>
    );
  }

  return (
    <AppShell header={{ height: 60 }}>
      <HomeNavbar title="Mi perfil" showBack />
      <AppShell.Main>
        <Container size="md" py="xl">
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={2}>Perfil de rescatista</Title>
              {me ? (
                <Text size="sm" c="dimmed">
                  {me.first_name} · {me.email}
                </Text>
              ) : null}
            </Stack>

            <Paper withBorder radius="md" p="md">
              <Stack gap="md">
                <Text size="sm" fw={500}>
                  Tu ubicación base
                </Text>
                <Text size="xs" c="dimmed">
                  El círculo azul muestra tu radio de acción. Ajusta el control
                  para ver hasta dónde recibirás alertas.
                </Text>
                <Box
                  style={{
                    height: MAP_HEIGHT,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid var(--mantine-color-dark-4)",
                  }}
                >
                  <HelpMapPanel
                    requests={[]}
                    height={MAP_HEIGHT}
                    interactive
                    draftLocation={location}
                    onDraftLocationChange={(loc) =>
                      setLocation({
                        lat: roundGeoCoord(loc.lat),
                        lng: roundGeoCoord(loc.lng),
                      })
                    }
                    actionRadiusKm={location ? radiusKm : null}
                  />
                </Box>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    Radio de acción: {radiusKm} km
                  </Text>
                  <Slider
                    min={RADIUS_MIN}
                    max={RADIUS_MAX}
                    value={radiusKm}
                    onChange={setRadiusKm}
                    marks={[
                      { value: 1, label: "1" },
                      { value: 25, label: "25" },
                      { value: 50, label: "50" },
                    ]}
                  />
                </Stack>
                <Button
                  variant="light"
                  leftSection={<IconMapPin size={16} />}
                  loading={locating}
                  onClick={useMyLocation}
                >
                  Usar mi ubicación
                </Button>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md">
              <Stack gap="md">
                <Switch
                  label="Recibir notificaciones de alertas cercanas"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.currentTarget.checked)}
                />
                <Button onClick={handleSave} loading={saving}>
                  Guardar perfil
                </Button>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md">
              <Stack gap="md">
                <Text size="sm" fw={500}>
                  Notificaciones push en este dispositivo
                </Text>
                <Text size="xs" c="dimmed">
                  Guarda tu perfil primero, luego activa las notificaciones del
                  navegador.
                </Text>
                {pushActive ? (
                  <Button
                    variant="light"
                    color="gray"
                    leftSection={<IconBell size={16} />}
                    loading={pushLoading}
                    onClick={handleDisablePush}
                  >
                    Desactivar notificaciones push
                  </Button>
                ) : (
                  <Button
                    variant="light"
                    leftSection={<IconBell size={16} />}
                    loading={pushLoading}
                    onClick={handleEnablePush}
                  >
                    Activar notificaciones push
                  </Button>
                )}
              </Stack>
            </Paper>

            <Stack gap="sm">
              <Button component={Link} href="/pedir-ayuda" variant="subtle">
                Reportar una emergencia
              </Button>
              <Button variant="subtle" color="gray" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </Stack>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
