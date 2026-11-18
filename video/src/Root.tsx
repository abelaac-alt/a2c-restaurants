import { Composition } from "remotion";
import { HelloA2C } from "./HelloA2C";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HelloA2C"
    component={HelloA2C}
    durationInFrames={90}
    fps={30}
    width={1080}
    height={1920}
  />
);
