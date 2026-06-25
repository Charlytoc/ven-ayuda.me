"use client";

import { AppShell, Container } from "@mantine/core";

import { HomeNavbar } from "@/components/home-navbar";
import { ReportHelpForm } from "@/components/report-help-form";

export default function PedirAyudaPage() {
  return (
    <AppShell header={{ height: 60 }}>
      <HomeNavbar title="Pedir ayuda" showBack />

      <AppShell.Main>
        <Container size="md" py="xl">
          <ReportHelpForm />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
