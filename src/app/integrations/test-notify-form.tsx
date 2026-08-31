"use client";

import { useState, useTransition } from "react";
import { Button, Callout, Code, Flex, Text } from "@radix-ui/themes";
import { sendTestSeatChange } from "./actions";

/**
 * Fires a sample seat-change message to the configured #customer-success channel, so
 * you can confirm the pipe works once Slack is connected. The channel is set
 * server-side (SLACK_CUSTOMER_SUCCESS_CHANNEL) — the button just triggers it.
 */
export function TestNotifyForm({ channelLabel }: { channelLabel: string }) {
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function onClick() {
    setResult(null);
    startTransition(async () => {
      setResult(await sendTestSeatChange());
    });
  }

  return (
    <Flex direction="column" gap="3">
      <Text size="2" color="gray">
        Posts to <Code>{channelLabel}</Code>.
      </Text>
      <Flex>
        <Button type="button" onClick={onClick} disabled={pending}>
          {pending ? "Sending…" : "Send test"}
        </Button>
      </Flex>
      {result && (
        <Callout.Root color={result.ok ? "green" : "red"} size="1">
          <Callout.Text>
            {result.ok ? "Sent — check the channel in Slack." : result.error}
          </Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}
