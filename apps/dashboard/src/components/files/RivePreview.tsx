import { EventType, useRive } from "@rive-app/react-canvas";
import { useEffect, useState } from "react";

// One-shot animations stop after a single pass; previews should loop forever.
function useLoopedRive(url: string, stateMachine?: string) {
  const { rive, RiveComponent } = useRive({
    src: url,
    autoplay: true,
    stateMachines: stateMachine,
  });

  useEffect(() => {
    if (!rive) return;
    const restart = () => {
      rive.reset();
      rive.play();
    };
    rive.on(EventType.Stop, restart);
    return () => rive.off(EventType.Stop, restart);
  }, [rive]);

  return { rive, RiveComponent };
}

function RivePlayer(props: { url: string; stateMachine: string }) {
  const { url, stateMachine } = props;
  const { RiveComponent } = useLoopedRive(url, stateMachine);
  return <RiveComponent className="h-full w-full" />;
}

export default function RivePreview(props: { url: string }) {
  const { url } = props;
  // A state machine is the file's intended runtime behavior — prefer it over
  // bare animation autoplay whenever one exists. The probe instance loads
  // once; the remounted player reuses the browser-cached (immutable) bytes.
  const [stateMachine, setStateMachine] = useState<string>();
  const { rive, RiveComponent } = useLoopedRive(url);

  useEffect(() => {
    if (rive && rive.stateMachineNames.length > 0) setStateMachine(rive.stateMachineNames[0]);
  }, [rive]);

  if (stateMachine) return <RivePlayer url={url} stateMachine={stateMachine} />;
  return <RiveComponent className="h-full w-full" />;
}
