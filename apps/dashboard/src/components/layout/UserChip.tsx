import SignOutButton from "@/components/auth/SignOutButton";

interface IUserChip {
  name?: string;
  email?: string;
  picture?: string | null;
}

export default function UserChip(props: IUserChip) {
  const { name, email, picture } = props;
  return (
    <div className="flex items-center gap-2.5">
      {picture && <img src={picture} alt="" className="h-7 w-7" referrerPolicy="no-referrer" />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{name ?? email}</p>
        <SignOutButton />
      </div>
    </div>
  );
}
