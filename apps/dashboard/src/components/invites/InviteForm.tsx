import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface IInviteForm {
  onInvite: (email: string) => void;
  pending: boolean;
  error?: string;
}

export default function InviteForm(props: IInviteForm) {
  const { onInvite, pending, error } = props;
  const [email, setEmail] = useState("");

  return (
    <div>
      <form
        className="flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.includes("@")) {
            onInvite(email);
            setEmail("");
          }
        }}
      >
        <Input
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="person@gmail.com"
          className="flex-1"
        />
        <Button variant="primary" type="submit" disabled={pending}>
          Invite
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
