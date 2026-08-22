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
  // Files driven only by a state machine don't autoplay as plain animations;
  // probe the loaded artboard and remount with its first state machine.
  // The second load is served from the browser cache (assets are immutable).
  const [stateMachine, setStateMachine] = useState<string>();
  const { rive, RiveComponent } = useRive({ src: url, autoplay: true });

  useEffect(() => {
    if (rive && !rive.isPlaying && rive.stateMachineNames.length > 0)
      setStateMachine(rive.stateMachineNames[0]);
  }, [rive]);

  if (stateMachine) return <RivePlayer url={url} stateMachine={stateMachine} />;
  return <RiveComponent className="h-full w-full" />;
}
