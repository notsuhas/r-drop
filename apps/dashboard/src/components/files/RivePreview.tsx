import { useRive } from "@rive-app/react-canvas";
import { useEffect, useState } from "react";

interface IRivePlayer {
  url: string;
  stateMachine?: string;
}

function RivePlayer(props: IRivePlayer) {
  const { url, stateMachine } = props;
  const { RiveComponent } = useRive({ src: url, autoplay: true, stateMachines: stateMachine });
  return <RiveComponent className="h-full w-full" />;
}

export default function RivePreview(props: { url: string }) {
  const { url } = props;
  // A state machine is the file's intended runtime behavior — prefer it over
  // bare animation autoplay whenever one exists. The probe instance loads
  // once; the remounted player reuses the browser-cached (immutable) bytes.
  const [stateMachine, setStateMachine] = useState<string>();
  const { rive, RiveComponent } = useRive({ src: url, autoplay: true });

  useEffect(() => {
    if (rive && rive.stateMachineNames.length > 0) setStateMachine(rive.stateMachineNames[0]);
  }, [rive]);

  if (stateMachine) return <RivePlayer url={url} stateMachine={stateMachine} />;
  return <RiveComponent className="h-full w-full" />;
}
