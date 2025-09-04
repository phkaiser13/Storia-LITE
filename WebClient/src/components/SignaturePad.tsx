import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export interface SignaturePadHandle {
  getSignature: () => string | null;
  clear: () => void;
}

const SignaturePad = forwardRef<SignaturePadHandle>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const getContext = () => canvasRef.current?.getContext('2d');

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = getContext();
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    [lastX.current, lastY.current] = [x, y];
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
     if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    [lastX.current, lastY.current] = [x, y];
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size based on its container for responsiveness
    const resizeCanvas = () => {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if(rect) {
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        const ctx = getContext();
        if (ctx) {
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = 2;
            ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#FFFFFF' : '#000000';
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getSignature: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      // Check if canvas is empty before returning data URL
      const context = getContext();
      if(context) {
        const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
        const isEmpty = !pixelBuffer.some(color => color !== 0);
        if (isEmpty) return null;
      }
      return canvas.toDataURL('image/png');
    },
    clear: clearCanvas,
  }));

  return (
    <div className="relative w-full h-48 mt-1 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 shadow-sm overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      <button
        type="button"
        onClick={clearCanvas}
        className="absolute top-2 right-2 p-2 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700 transition"
        aria-label="Limpar assinatura"
      >
        <FiRefreshCw className="h-5 w-5" />
      </button>
    </div>
  );
});

export default SignaturePad;