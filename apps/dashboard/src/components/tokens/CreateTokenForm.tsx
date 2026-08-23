import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Notice from "@/components/ui/Notice";

interface ICreateTokenForm {
  onCreate: (name: string, expiresInDays?: number) => void;
  pending: boolean;
  error?: string;
}

// Undefined is "never" — the honest default for an asset CDN token that lives
// in an agent's config, but an expiring one should be one select away.
const EXPIRY_CHOICES: { label: string; days?: number }[] = [
  { label: "No expiry", days: undefined },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
];

export default function CreateTokenForm(props: ICreateTokenForm) {
  const { onCreate, pending, error } = props;
  const [name, setName] = useState("");
  const [expiryIndex, setExpiryIndex] = useState(0);
  const trimmed = name.trim();

  return (
    <div className="max-w-md">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!trimmed) return;
          onCreate(trimmed, EXPIRY_CHOICES[expiryIndex].days);
          setName("");
        }}
      >
        <Input
          value={name}
          onChange={setName}
          mono
          aria-label="Token name"
          placeholder="ci, staging-deploy, my-laptop"
          className="flex-1"
        />
        <select
          value={expiryIndex}
          onChange={(e) => setExpiryIndex(Number(e.target.value))}
          aria-label="Token expiry"
          className="rounded-md border border-line bg-surface-2 px-2 text-xs text-ink-2 outline-none focus-visible:border-accent"
        >
          {EXPIRY_CHOICES.map((choice, i) => (
            <option key={choice.label} value={i}>
              {choice.label}
            </option>
          ))}
        </select>
        <Button variant="primary" type="submit" loading={pending} disabled={!trimmed}>
          Create token
        </Button>
      </form>
      <p className="mt-1.5 text-xs text-ink-3">
        Name it after where it runs — that's how you'll know which one to revoke later.
      </p>
      {error && (
        <div className="mt-2.5">
          <Notice>{error}</Notice>
        </div>
      )}
    </div>
  );
}
