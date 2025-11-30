import SplashScreen from '../game/SplashScreen';

export default function SplashScreenExample() {
  return (
    <SplashScreen 
      onSelectMode={(mode) => console.log('Mode selected:', mode)} 
    />
  );
}
