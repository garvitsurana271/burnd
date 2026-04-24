import { Composition } from 'remotion';
import { BurndVideo } from './BurndVideo';
import { ThumbA, ThumbB, ThumbC } from './Thumbnails';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BurndVideo"
        component={BurndVideo}
        durationInFrames={1050}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition id="ThumbA" component={ThumbA} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{}} />
      <Composition id="ThumbB" component={ThumbB} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{}} />
      <Composition id="ThumbC" component={ThumbC} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{}} />
    </>
  );
};
