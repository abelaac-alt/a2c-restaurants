import { Composition } from "remotion";
import { HelloA2C } from "./HelloA2C";
import { AVIONES_DURATION, PorQueVuelan } from "./aviones/Video";
import { ACTA_DURATION, ActaReel } from "./acta/ActaReel";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HelloA2C" component={HelloA2C} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition
      id="PorQueVuelan"
      component={PorQueVuelan}
      durationInFrames={AVIONES_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition id="ActaReel" component={ActaReel} durationInFrames={ACTA_DURATION} fps={30} width={1080} height={1920} />
  </>
);
