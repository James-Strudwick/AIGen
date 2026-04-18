import { useCurrentFrame, useVideoConfig, Series } from 'remotion';
import { BeforeAfterReveal } from './BeforeAfterReveal';
import { TimelineSlider } from './TimelineSlider';

function TransitionSlide() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const opacity = frame < fps * 0.3 ? frame / (fps * 0.3)
    : frame > fps * 1.7 ? 1 - (frame - fps * 1.7) / (fps * 0.3)
    : 1;

  return (
    <div style={{
      width, height, background: '#0a0a0a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      opacity,
    }}>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', textAlign: 'center', margin: '0 48px', lineHeight: 1.3 }}>
        Now watch what your prospect sees...
      </p>
    </div>
  );
}

export const FullWalkthrough: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={300}>
        <BeforeAfterReveal />
      </Series.Sequence>
      <Series.Sequence durationInFrames={60}>
        <TransitionSlide />
      </Series.Sequence>
      <Series.Sequence durationInFrames={390}>
        <TimelineSlider />
      </Series.Sequence>
    </Series>
  );
};
