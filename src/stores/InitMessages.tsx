"use client";
import React, { useEffect, useRef } from "react";

import { Imessage, useMessage } from "./messages";
import { LIMIT_MESSAGE } from "../lib/constant";

export default function InitMessages({ messages }: { messages: Imessage[] }) {
  const initState = useRef(false);
  const hasMore = messages.length >= LIMIT_MESSAGE;

  useEffect(() => {
    useMessage.setState({ messages, hasMore });
    // eslint-disable-next-line
  }, [messages, hasMore]);

  return <></>;
}
