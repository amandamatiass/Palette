import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import {
  UploadCloud,
  Image as ImageIcon,
  Copy,
  RefreshCw,
  Palette,
  Github,
  Twitter } from 'lucide-react';
import { extractColors, Color } from './utils/colorExtractor';
import { useScreenInit } from './useScreenInit.js';

const DEMO_IMAGE =
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80';

export function App() {
  const screenInit = useScreenInit() as { view?: string };
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (screenInit?.view === 'results' && !imageSrc) {
      setImageSrc(DEMO_IMAGE);
    }
  }, [screenInit?.view]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, envie um arquivo de imagem');
      return;
    }

    const src = URL.createObjectURL(file);
    setImageSrc(src);
    setIsExtracting(true);

    try {
      const result = await extractColors(file, 8);
      setColors([result.dominantColor, ...result.palette]);
    } catch (error) {
      toast.error('Falha ao extrair cores');
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (imageSrc) return;
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) handleFile(file);
            break;
          }
        }
      }
    },
    [imageSrc]
  );

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`${hex} copiado para a área de transferência!`);
  };

  const reset = () => {
    setImageSrc(null);
    setColors([]);
  };

  const dominantColor = colors.length > 0 ? colors[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-teal-100 selection:text-teal-900">
      <Toaster position="top-center" />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
              <div className="bg-teal-600 p-2 rounded-lg">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Palette
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {!imageSrc ? (
          <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                Extraia paletas perfeitas{' '}
                <span className="text-teal-600">instantaneamente.</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
                Faça upload de uma imagem e descubra sua paleta de cores em segundos. Extraímos as cores dominantes e apresentamos os códigos prontos para uso em seus projetos.
              </p>
            </div>

            <div className="w-full max-w-2xl mx-auto">
              <div
                className={`relative group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-24 transition-all duration-300 ease-in-out bg-white shadow-sm overflow-hidden ${isDragging ? 'border-teal-500 bg-teal-50/50 scale-[1.02] shadow-md' : 'border-slate-300 hover:border-teal-400 hover:shadow-md'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative z-10 text-center cursor-pointer flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <UploadCloud className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <div className="flex text-lg leading-6 text-slate-600 justify-center mb-2">
                    <span className="relative cursor-pointer rounded-md bg-transparent font-semibold text-teal-600 focus-within:outline-none hover:text-teal-500">
                      <span>Clique para enviar</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFile(e.target.files[0]);
                          }
                        }}
                      />
                    </span>
                    <p className="pl-2">ou arraste e solte</p>
                  </div>
                  <p className="text-sm text-slate-500">Suporta JPG, PNG, WEBP, GIF</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow bg-slate-50">
            <div
              className="w-full h-64 absolute top-16 left-0 z-0 opacity-10 transition-colors duration-1000 ease-in-out"
              style={{ backgroundColor: dominantColor?.hex || '#f8fafc' }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Análise de Cores</h1>
                  <p className="text-slate-500 mt-1">Paleta extraída da sua imagem</p>
                </div>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  Analisar outra imagem
                </button>
              </div>

              {isExtracting ? (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-20 flex flex-col items-center justify-center min-h-[500px]">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Analisando imagem...</h3>
                  <p className="text-slate-500">Extraindo a paleta de cores</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Imagem enviada
                        </h3>
                      </div>
                      <div className="p-6 flex items-center justify-center min-h-[300px]">
                        <img
                          src={imageSrc}
                          alt="Pré-visualização da imagem"
                          className="max-w-full max-h-[400px] object-contain rounded-xl shadow-md"
                        />
                      </div>
                    </div>

                    {dominantColor && (
                      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <h3 className="text-sm font-semibold text-slate-700">Cor dominante</h3>
                        </div>
                        <div className="p-6">
                          <button
                            onClick={() => copyToClipboard(dominantColor.hex)}
                            className="w-full group text-left focus:outline-none"
                          >
                            <div className="flex items-center gap-6">
                              <div
                                className="w-24 h-24 rounded-2xl shadow-inner ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-105"
                                style={{ backgroundColor: dominantColor.hex }}
                              />
                              <div className="flex-grow">
                                <p className="text-3xl font-bold text-slate-900 uppercase tracking-tight group-hover:text-teal-600 transition-colors">
                                  {dominantColor.hex}
                                </p>
                                <p className="text-slate-500 font-mono text-sm">
                                  rgb({dominantColor.rgb.r}, {dominantColor.rgb.g}, {dominantColor.rgb.b})
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Paleta de cores
                        </h3>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {colors.length} cores extraídas
                        </span>
                      </div>

                      <div className="p-6">
                        {colors.length === 0 ? (
                          <div className="text-center py-20">
                            <p className="text-slate-500">Nenhuma cor encontrada.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {colors.map((color, index) => (
                              <button
                                key={index}
                                onClick={() => copyToClipboard(color.hex)}
                                className="group flex flex-col items-center text-left rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 bg-white"
                              >
                                <div
                                  className="w-full h-32 transition-transform duration-500 group-hover:scale-110 origin-bottom"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <div className="w-full p-4 bg-white z-10 relative flex justify-between items-center border-t border-slate-100">
                                  <div>
                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-wider group-hover:text-teal-600 transition-colors">
                                      {color.hex}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 font-mono">
                                      {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                                    </p>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-teal-600 bg-slate-50 p-1.5 rounded-md">
                                    <Copy className="h-4 w-4" />
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-teal-600" />
            <span className="font-semibold text-slate-900">Palette</span>
          </div>
          <p className="text-sm text-slate-500">
            {new Date().getFullYear()} © Desenvolvido por Amanda Matias
          </p>
        </div>
      </footer>
    </div>
  );
}