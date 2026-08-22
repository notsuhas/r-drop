import { useRive } from "@rive-app/react-canvas";

interface IRivePreview {
  url: string;
}

export default function RivePreview(props: IRivePreview) {
  const { RiveComponent } = useRive({ src: props.url, autoplay: true });
  return <RiveComponent className="h-full w-full" />;
}
