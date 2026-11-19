import { Composition, Still } from "remotion";
import { HelloA2C } from "./HelloA2C";
import { AVIONES_DURATION, PorQueVuelan } from "./aviones/Video";
import { ACTA_DURATION, ActaReel } from "./acta/ActaReel";
import { ActaCover } from "./acta/Cover";
import { STORY_DURATION, StoryReel } from "./acta2/StoryReel";
import { StoryCover } from "./acta2/Cover";
import { CASERO_DURATION, CaseroReel } from "./acta3/Reel";
import { CaseroCover } from "./acta3/Cover";
import { PLATOS_DURATION, PlatosReel } from "./acta4/Reel";
import { PlatosCover } from "./acta4/Cover";

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
    <Still id="ActaCover" component={ActaCover} width={1080} height={1920} defaultProps={{ guides: false }} />
    <Composition id="ActaHistoria" component={StoryReel} durationInFrames={STORY_DURATION} fps={30} width={1080} height={1920} />
    <Still id="ActaHistoriaCover" component={StoryCover} width={1080} height={1920} defaultProps={{ guides: false }} />
    <Composition id="ActaCasero" component={CaseroReel} durationInFrames={CASERO_DURATION} fps={30} width={1080} height={1920} />
    <Still id="ActaCaseroCover" component={CaseroCover} width={1080} height={1920} defaultProps={{ guides: false }} />
    <Composition id="ActaPlatos" component={PlatosReel} durationInFrames={PLATOS_DURATION} fps={30} width={1080} height={1920} />
    <Still id="ActaPlatosCover" component={PlatosCover} width={1080} height={1920} defaultProps={{ guides: false }} />
  </>
);
