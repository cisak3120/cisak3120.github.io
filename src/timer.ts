class Timer {
  private intervalId: number | undefined;
  totalTime: number;

  constructor() {
    this.totalTime = 0;
  }

  start() {
    this.intervalId = window.setInterval(() => {
      this.totalTime++;
    }, 1000);
  }

  stop() {
    window.clearInterval(this.intervalId);
  }
}

export default Timer;
