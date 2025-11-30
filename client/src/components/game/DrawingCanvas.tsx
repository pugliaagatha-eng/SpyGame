import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eraser, Pencil, RotateCcw, Check, Palette } from 'lucide-react';
import Timer from './Timer';

interface DrawingCanvasProps {
  playerName: string;
  word?: string;
  hint?: string;
  duration: number;
  onSubmit: (imageData: string) => void;
  isAgent: boolean;
}

const COLORS = [
  '#ffffff',
  '#00ffff',
  '#ff00ff',
  '#ffff00',
  '#ff0000',
  '#00ff00',
  '#0066ff',
  '#ff6600',
];

const BRUSH_SIZES = [2, 4, 8, 16];

export default function DrawingCanvas({
  playerName,
  word,
  hint,
  duration,
  onSubmit,
  isAgent,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#00ffff');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    if (!pos) return;
    
    setIsDrawing(true);
    lastPos.current = pos;
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPos.current) return;

    const pos = getPos(e);
    if (!pos) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isEraser ? '#0a0f19' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    if (!isEraser) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
    } else {
      ctx.shadowBlur = 0;
    }

    lastPos.current = pos;
  }, [isDrawing, isEraser, color, brushSize, getPos]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#0a0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSubmit(canvas.toDataURL());
  };

  const handleTimerComplete = () => {
    handleSubmit();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl neon-border">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{playerName}</span>
            <Timer duration={duration} onComplete={handleTimerComplete} />
          </div>
          <CardTitle className="font-serif text-xl">
            {isAgent ? (
              <span className="text-primary">
                Desenhe: <span className="neon-text">{word}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                Dica: <span className="text-secondary">{hint}</span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="relative rounded-lg overflow-hidden neon-border">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              data-testid="drawing-canvas"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={!isEraser ? 'default' : 'outline'}
                size="icon"
                onClick={() => setIsEraser(false)}
                data-testid="button-pencil"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant={isEraser ? 'default' : 'outline'}
                size="icon"
                onClick={() => setIsEraser(true)}
                data-testid="button-eraser"
              >
                <Eraser className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={clearCanvas}
                data-testid="button-clear"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{ backgroundColor: color }}
                  data-testid="button-color"
                >
                  <Palette className="w-4 h-4" style={{ color: color === '#ffffff' ? '#000' : '#fff' }} />
                </Button>
                
                {showColorPicker && (
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-lg border border-border shadow-lg grid grid-cols-4 gap-1">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        className="w-8 h-8 rounded-md border border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                        onClick={() => {
                          setColor(c);
                          setShowColorPicker(false);
                        }}
                        data-testid={`color-${c}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    brushSize === size 
                      ? 'border-primary bg-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setBrushSize(size)}
                  data-testid={`brush-size-${size}`}
                >
                  <div
                    className="rounded-full bg-primary"
                    style={{ width: size, height: size }}
                  />
                </button>
              ))}
            </div>

            <Button onClick={handleSubmit} data-testid="button-submit-drawing">
              <Check className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
