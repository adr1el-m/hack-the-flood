import React, { useState, useRef, useEffect } from 'react';
import { Camera, Hand, RotateCcw, X, Save } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function ReportView({ onClose, onSave, project }) {
  const { t } = useLanguage();
  const [image, setImage] = useState(null);
  const [sentiment, setSentiment] = useState('');
  const cameraInputRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // Handle File Input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }

        setImage(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Blur Logic
  const blurRegion = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 50;
    const halfSize = size / 2;
    const startX = Math.max(0, x - halfSize);
    const startY = Math.max(0, y - halfSize);
    const w = Math.min(canvas.width - startX, size);
    const h = Math.min(canvas.height - startY, size);

    if (w <= 0 || h <= 0) return;

    const sampleSize = 12;

    for (let i = 0; i < w; i += sampleSize) {
      for (let j = 0; j < h; j += sampleSize) {
        const sampleX = startX + i;
        const sampleY = startY + j;

        const pixelData = ctx.getImageData(sampleX + sampleSize / 2, sampleY + sampleSize / 2, 1, 1).data;
        ctx.fillStyle = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
        ctx.fillRect(sampleX, sampleY, sampleSize, sampleSize);
      }
    }
  };

  // Event Handlers for Canvas
  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStart = (e) => {
    if (!image) return;
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = getCoords(e);
    blurRegion(x, y);
  };

  const handleMove = (e) => {
    if (!isDrawing.current || !image) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    blurRegion(x, y);
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const maxWidth = 600;
    let width = image.width;
    let height = image.height;

    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
  }, [image]);

  const handleSave = () => {
    if (!canvasRef.current) return;
    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.6);
    const timestamp = new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    onSave({
      id: Date.now(),
      timestamp,
      image: imageData,
      sentiment: sentiment.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white z-30 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-sm font-medium px-2 py-1">
          {t('cancel')}
        </button>
        <div className="text-center">
          <h2 className="font-semibold text-slate-800">{t('new_report')}</h2>
          {project && (
            <p className="text-[10px] text-slate-500 max-w-[150px] truncate mx-auto">
              {project.desc}
            </p>
          )}
        </div>
        {image && (
          <button onClick={handleSave} className="text-gov-blue font-bold text-sm px-2 py-1">
            {t('save')}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
        
        {/* Project Context Card */}
        {project && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs">
             <h4 className="font-bold text-blue-900 mb-1">Reporting Project:</h4>
             <p className="text-blue-800 font-medium mb-1">{project.desc}</p>
             <div className="flex gap-2 text-blue-600">
               <span>📍 {project.location}</span>
               <span>🏗️ {project.contractor}</span>
             </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 relative flex flex-col items-center justify-center min-h-[300px]">
          
          {!image ? (
            <div className="text-center p-8 max-w-xs w-full">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                <Camera size={32} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{t('take_evidence')}</h3>
              <p className="text-xs text-slate-500 mb-6">{t('take_evidence_desc')}</p>
              
              <button 
                onClick={() => cameraInputRef.current.click()}
                className="w-full bg-gov-blue text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
              >
                <Camera size={18} /> {t('open_camera')}
              </button>
            </div>
          ) : (
            <>
              <canvas 
                ref={canvasRef}
                className="w-full object-contain touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg pointer-events-none">
                <Hand size={14} /> {t('blur_tooltip')}
              </div>
            </>
          )}
        </div>

        {image && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-20">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t('sentiment_label')}
            </label>
            <textarea 
              rows="4" 
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder={t('sentiment_placeholder')}
            ></textarea>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {image && (
        <div className="p-4 bg-white border-t border-slate-100">
          <button 
            onClick={() => { setImage(null); cameraInputRef.current.click(); }}
            className="w-full py-3 text-slate-500 font-medium text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> {t('retake')}
          </button>
        </div>
      )}

      <input 
        type="file" 
        ref={cameraInputRef}
        accept="image/*" 
        capture="environment" 
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
