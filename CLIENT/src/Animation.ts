export type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
  time: number
};

export type AnimationData = {
  frames: Frame[];
  repeat: boolean;
};

export default class Animation {
  private readonly drawFrame: (frame: Frame, position: [number, number]) => void;

  private position: [number, number] = [0, 0];

  private readonly animationData: AnimationData;

  private currentFrameIndex = 0;

  private isRunning: boolean = false;

  public constructor(drawFrame: (frame: Frame, position: [number, number]) => void, position: [number, number], animationData: AnimationData) {
    this.drawFrame = drawFrame;
    this.animationData = animationData;
    this.position = position;
  }

  public start(): void {
    console.log(this.animationData.frames);
    this.isRunning = true;
    this.iterate();
  }

  public iterate(): void {
    if (this.currentFrameIndex >= this.animationData.frames.length) {
      if (this.animationData.repeat) {
        this.currentFrameIndex = 0;
      } else {
        this.stop();
      }
    }

    if (!this.isRunning) {
      return;
    }

    this.drawFrame(this.animationData.frames[this.currentFrameIndex], this.position);

    setTimeout(() => this.iterate(), 300);

    this.currentFrameIndex++;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public setPosition(position: [number, number]): void {
    this.position = position;
  }

  public isAnimationRunning(): boolean {
    return this.isRunning;
  }
}
