"use client";

import { Anchor, Code, List, Table, Text } from "@mantine/core";
import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownMessageProps = {
  content: string;
  /** Use on dark/colored chat bubbles (e.g. user messages). */
  inverted?: boolean;
  /** Smaller, dimmed text for inline task explanations. */
  compact?: boolean;
};

function buildComponents(inverted: boolean, compact: boolean): Components {
  const size = compact ? "xs" : "sm";
  const textColor = inverted ? "white" : compact ? "dimmed" : undefined;
  const dimColor = inverted ? "rgba(255,255,255,0.75)" : "dimmed";
  const linkColor = inverted ? "var(--mantine-color-blue-1)" : undefined;
  const borderColor = inverted ? "rgba(255,255,255,0.25)" : undefined;
  const blockMb = compact ? 0 : "xs";

  return {
    p: ({ children }) => (
      <Text size={size} c={textColor} component="p" mb={blockMb} style={{ whiteSpace: "pre-wrap" }}>
        {children}
      </Text>
    ),
    strong: ({ children }) => (
      <Text span size={size} c={textColor} fw={700}>
        {children}
      </Text>
    ),
    em: ({ children }) => (
      <Text span size={size} c={textColor} fs="italic">
        {children}
      </Text>
    ),
    ul: ({ children }) => (
      <List size={size} c={textColor} withPadding mb={blockMb}>
        {children}
      </List>
    ),
    ol: ({ children }) => (
      <List size={size} c={textColor} type="ordered" withPadding mb={blockMb}>
        {children}
      </List>
    ),
    li: ({ children }) => <List.Item>{children}</List.Item>,
    a: ({ href, children }) => (
      <Anchor href={href} target="_blank" rel="noopener noreferrer" size={size} c={linkColor} underline="always">
        {children}
      </Anchor>
    ),
    code: ({ className, children }) => {
      const isBlock = Boolean(className);
      if (isBlock) {
        return (
          <Code
            block
            mb="xs"
            style={{
              whiteSpace: "pre-wrap",
              background: inverted ? "rgba(0,0,0,0.2)" : undefined,
            }}
          >
            {children}
          </Code>
        );
      }
      return (
        <Code
          style={{
            background: inverted ? "rgba(0,0,0,0.2)" : undefined,
          }}
        >
          {children}
        </Code>
      );
    },
    pre: ({ children }) => <>{children}</>,
    blockquote: ({ children }) => (
      <Text
        component="blockquote"
        size={size}
        c={dimColor}
        pl="sm"
        mb={blockMb}
        style={{ borderLeft: "3px solid var(--mantine-color-default-border)" }}
      >
        {children}
      </Text>
    ),
    h1: ({ children }) => (
      <Text size="lg" c={textColor} fw={700} mb={blockMb}>
        {children}
      </Text>
    ),
    h2: ({ children }) => (
      <Text size="md" c={textColor} fw={700} mb={blockMb}>
        {children}
      </Text>
    ),
    h3: ({ children }) => (
      <Text size={size} c={textColor} fw={700} mb={blockMb}>
        {children}
      </Text>
    ),
    hr: () => (
      <hr
        style={{
          border: "none",
          borderTop: `1px solid ${inverted ? "rgba(255,255,255,0.25)" : "var(--mantine-color-default-border)"}`,
          margin: "8px 0",
        }}
      />
    ),
    table: ({ children }) => (
      <Table.ScrollContainer minWidth={200} mb={blockMb}>
        <Table
          withTableBorder
          withColumnBorders
          borderColor={borderColor}
          horizontalSpacing="sm"
          verticalSpacing="xs"
          style={{
            fontSize: `var(--mantine-font-size-${size})`,
            color: inverted ? "white" : undefined,
          }}
        >
          {children}
        </Table>
      </Table.ScrollContainer>
    ),
    thead: ({ children }) => <Table.Thead>{children}</Table.Thead>,
    tbody: ({ children }) => <Table.Tbody>{children}</Table.Tbody>,
    tr: ({ children }) => <Table.Tr>{children}</Table.Tr>,
    th: ({ children }) => (
      <Table.Th>
        <Text size={size} c={textColor} fw={600}>
          {children}
        </Text>
      </Table.Th>
    ),
    td: ({ children }) => (
      <Table.Td>
        <Text size={size} c={textColor}>
          {children}
        </Text>
      </Table.Td>
    ),
  };
}

export function MarkdownMessage({ content, inverted = false, compact = false }: MarkdownMessageProps) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  return (
    <Markdown remarkPlugins={[remarkGfm]} components={buildComponents(inverted, compact)} skipHtml>
      {trimmed}
    </Markdown>
  );
}
