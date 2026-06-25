"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core";
import { readStoredAuth } from "@/lib/auth-storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { token, user } = readStoredAuth();
    router.replace(token && user ? "/chat" : "/login");
  }, [router]);

  return (
    <Center h="100vh" bg="var(--mantine-color-body)">
      <Loader size="sm" />
    </Center>
  );
}
