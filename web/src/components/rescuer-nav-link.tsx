"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Anchor, Button, Group } from "@mantine/core";
import {
  getRescuerToken,
  getRescuerUser,
  isRescuerLoggedIn,
} from "@/lib/rescuer-auth-storage";

export function RescuerNavLink() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(isRescuerLoggedIn());
    const user = getRescuerUser();
    setName(user?.first_name || user?.email || null);
  }, []);

  if (!loggedIn || !getRescuerToken()) {
    return (
      <Group gap="sm" wrap="nowrap">
        <Anchor component={Link} href="/rescatista/entrar" size="sm">
          Entrar
        </Anchor>
        <Button component={Link} href="/rescatista/registro" size="xs" variant="light">
          Ser rescatista
        </Button>
      </Group>
    );
  }

  return (
    <Group gap="sm" wrap="nowrap">
      {name ? (
        <Anchor component={Link} href="/rescatista/perfil" size="sm" c="dimmed">
          {name}
        </Anchor>
      ) : null}
      <Button component={Link} href="/rescatista/perfil" size="xs" variant="light">
        Mi perfil
      </Button>
    </Group>
  );
}
