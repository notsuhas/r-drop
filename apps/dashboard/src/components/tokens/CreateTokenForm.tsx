import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Notice from "@/components/ui/Notice";

interface ICreateTokenForm {
  onCreate: (name: string) => void;
  pending: boolean;
  error?: string;
}

export default function CreateTokenForm(props: ICreateTokenForm) {
  const { onCreate, pending, error } = props;
  const [name, setName] = useState("");
  const trimmed = name.trim();

  return (
    <div className="max-w-md">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!trimmed) return;
          onCreate(trimmed);
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
