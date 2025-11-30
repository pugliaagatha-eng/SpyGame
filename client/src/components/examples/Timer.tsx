import Timer from '../game/Timer';

export default function TimerExample() {
  return (
    <div className="flex items-center justify-center p-8 bg-background min-h-[200px]">
      <Timer
        duration={90}
        onComplete={() => console.log('Timer complete')}
        onTimeUpdate={(time) => console.log('Time:', time)}
      />
    </div>
  );
}
