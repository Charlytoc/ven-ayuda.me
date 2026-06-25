"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { helpRequestPath } from "@/lib/help-request-path";
import type { HelpRequest } from "@/lib/types/help-request";

export function useOpenHelpRequest() {
  const router = useRouter();

  return useCallback(
    (request: HelpRequest) => {
      router.push(helpRequestPath(request.id));
    },
    [router],
  );
}
