"use client";

import { useActionState } from "react";
import { claimDelivery } from "@/app/actions/driver";
import { SubmitButton } from "@/components/client";
import { useT } from "@/components/i18n";
import { MAX_ACTIVE_PER_DRIVER } from "@/lib/pricing";

export function ClaimButton({ id }: { id: string }) {
  const t = useT();
  const [state, action] = useActionState(claimDelivery, undefined);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <SubmitButton className="btn-primary w-full !py-4" pendingText={t("common.wait")}>
        {t("d.accept")}
      </SubmitButton>
      {state?.error && (
        <p className="animate-fade-up rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {state.error === "taken" ? t("d.taken") : t("d.max", { n: MAX_ACTIVE_PER_DRIVER })}
        </p>
      )}
    </form>
  );
}
