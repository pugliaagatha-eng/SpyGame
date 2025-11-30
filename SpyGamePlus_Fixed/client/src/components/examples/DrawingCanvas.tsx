import DrawingCanvas from '../game/DrawingCanvas';

export default function DrawingCanvasExample() {
  return (
    <DrawingCanvas
      playerName="João"
      word="HACKER"
      hint="Alguém que invade sistemas"
      duration={60}
      onSubmit={(data) => console.log('Drawing submitted', data.substring(0, 50))}
      isAgent={true}
    />
  );
}
