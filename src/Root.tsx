import React from "react";
import { Composition, Still } from "remotion";
import { WordOfTheDayStill } from "./WordOfTheDay/Still";
import { WordOfTheDayStory } from "./WordOfTheDay/Story";
import { WordOfTheDayVideo } from "./WordOfTheDay/Video";
import { TheProblem } from "./Promo/TheProblem";
import { AppWalkthrough } from "./Promo/AppWalkthrough";
import { WhyArday } from "./Promo/WhyArday";

const FPS = 30;
const VIDEO_DURATION = 10 * FPS; // 10 seconds

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Still
        id="WordStill"
        component={WordOfTheDayStill}
        width={1080}
        height={1080}
        defaultProps={{ index: 0 }}
      />

      <Still
        id="WordStory"
        component={WordOfTheDayStory}
        width={1080}
        height={1920}
        defaultProps={{ index: 0 }}
      />

      <Composition
        id="WordVideo"
        component={WordOfTheDayVideo}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={VIDEO_DURATION}
        defaultProps={{ index: 0 }}
      />

      <Composition
        id="PromoTheProblem"
        component={TheProblem}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={15 * FPS}
        defaultProps={{}}
      />

      <Composition
        id="PromoWalkthrough"
        component={AppWalkthrough}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={30 * FPS}
        defaultProps={{}}
      />

      <Composition
        id="PromoWhyArday"
        component={WhyArday}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={20 * FPS}
        defaultProps={{}}
      />
    </>
  );
};
