"use client";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useUser } from "./user";

export default function InitUser({ user }: { user: User | undefined }) {
  useEffect(() => {
    useUser.setState({ user });
    // eslint-disable-next-line
  }, [user]);

  return <></>;
}
