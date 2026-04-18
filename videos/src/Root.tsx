import { Composition } from 'remotion';
import { BeforeAfterReveal } from './BeforeAfterReveal';
import { TimelineSlider } from './TimelineSlider';
import { FullWalkthrough } from './FullWalkthrough';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1080x1920 = Instagram / TikTok Reel portrait */}
      <Composition
        id="BeforeAfterReveal"
        component={BeforeAfterReveal}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TimelineSlider"
        component={TimelineSlider}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FullWalkthrough"
        component={FullWalkthrough}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 1080x1080 = Instagram square post */}
      <Composition
        id="BeforeAfterReveal-Square"
        component={BeforeAfterReveal}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="TimelineSlider-Square"
        component={TimelineSlider}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
