import React from "react";
import { Audio, Series, staticFile } from "remotion";
import { SceneFade } from "./components";
import {
  ForcesScene,
  MythScene,
  NewtonScene,
  PressureScene,
  SceneProps,
  SummaryScene,
  TakeoffScene,
  TitleScene,
  WingScene,
} from "./scenes";
import timing from "./timing.json";

// Tiempos generados por audio/build_audio.py a partir de la duración de cada frase narrada
const SCENES: React.FC<SceneProps>[] = [
  TitleScene,
  ForcesScene,
  WingScene,
  PressureScene,
  NewtonScene,
  MythScene,
  TakeoffScene,
  SummaryScene,
];

export const AVIONES_DURATION = timing.total;

export const PorQueVuelan: React.FC = () => (
  <>
    <Audio src={staticFile("aviones/mix.wav")} />
    <Series>
      {SCENES.map((Scene, i) => {
        const sc = timing.scenes[i] as { dur: number; cues: SceneProps["cues"]; liftoff?: number };
        return (
          <Series.Sequence key={i} durationInFrames={sc.dur}>
            <SceneFade duration={sc.dur}>
              <Scene cues={sc.cues} dur={sc.dur} liftoff={sc.liftoff} />
            </SceneFade>
          </Series.Sequence>
        );
      })}
    </Series>
  </>
);
