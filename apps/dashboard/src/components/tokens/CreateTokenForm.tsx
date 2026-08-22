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

  return (
    <div>
      <form
        className="flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            onCreate(name.trim());
            setName("");
          }
        }}
      >
        <Input
          value={name}
          onChange={setName}
          placeholder="token name, e.g. ci"
          className="flex-1"
        />
        <Button variant="primary" type="submit" disabled={pending}>
          Create token
        </Button>
      </form>
      {error && (
        <div className="mt-2 max-w-md">
          <Notice>{error}</Notice>
        </div>
      )}
    </div>
  );
}
