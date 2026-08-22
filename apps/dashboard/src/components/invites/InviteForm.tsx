import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Notice from "@/components/ui/Notice";

interface IInviteForm {
  onInvite: (email: string) => void;
  pending: boolean;
  error?: string;
}

export default function InviteForm(props: IInviteForm) {
  const { onInvite, pending, error } = props;
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div className="max-w-md">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (!valid) return;
          onInvite(email.trim());
          setEmail("");
          setTouched(false);
        }}
      >
        <Input
          type="email"
          value={email}
          onChange={setEmail}
          mono
          aria-label="Google account email"
          placeholder="person@gmail.com"
          invalid={touched && email.length > 0 && !valid}
          className="flex-1"
        />
        <Button variant="primary" type="submit" loading={pending} disabled={!valid}>
          Send invite
        </Button>
      </form>
      {touched && email.length > 0 && !valid && (
        <p className="mt-1.5 text-xs text-danger">That doesn't look like an email address yet.</p>
      )}
      {error && (
        <div className="mt-2.5">
          <Notice>{error}</Notice>
        </div>
      )}
    </div>
  );
}
