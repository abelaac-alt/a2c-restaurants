import React from "react";
import { Series } from "remotion";
import { SceneFade } from "./components";
import {
  ForcesScene,
  MythScene,
  NewtonScene,
  PressureScene,
  SummaryScene,
  TakeoffScene,
  TitleScene,
  WingScene,
} from "./scenes";

const SCENES: [React.FC, number][] = [
  [TitleScene, 150],
  [ForcesScene, 330],
  [WingScene, 360],
  [PressureScene, 350],
  [NewtonScene, 310],
  [MythScene, 400],
  [TakeoffScene, 340],
  [SummaryScene, 260],
];

export const AVIONES_DURATION = SCENES.reduce((a, [, d]) => a + d, 0);

export const PorQueVuelan: React.FC = () => (
  <Series>
    {SCENES.map(([Scene, d], i) => (
      <Series.Sequence key={i} durationInFrames={d}>
        <SceneFade duration={d}>
          <Scene />
        </SceneFade>
      </Series.Sequence>
    ))}
  </Series>
);
