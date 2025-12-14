'use client'

import { relative } from 'path';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { LoadingHook } from '@/store/loading/hooks';


const LoadingAbsolute = ({ height, message }: { height?: number, message?: string }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frameId: number;
        const start = performance.now();

        const step = (now: number) => {
            const elapsed = now - start;

            // First 800ms: ramp quickly to ~95%
            if (elapsed < 800) {
                const fast = Math.min(95, (elapsed / 800) * 95);
                setProgress(fast);
            } else {
                // After that: very slowly approach 99%
                const slowElapsed = elapsed - 800;
                const extra = Math.min(4, (slowElapsed / 4000) * 4); // up to +4%
                setProgress(95 + extra);
            }

            frameId = requestAnimationFrame(step);
        };

        frameId = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md px-6">
                <div className="bg-gray-900/70 border border-white/10 rounded-xl px-6 py-5 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-primary text-opacity-90 text-3xl animate-spin">
                            <AiOutlineLoading3Quarters />
                        </span>
                        <p className="text-sm md:text-base text-gray-100 font-medium">
                            {message || 'Đang xử lý yêu cầu của bạn...'}
                        </p>
                    </div>
                    <div className="w-full h-2 bg-gray-700/60 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-sky-400 to-primary"
                            style={{ width: `${progress}%`, transition: 'width 200ms ease-out' }}
                        />
                    </div>
                    {/* <p className="mt-2 text-xs text-gray-300/80">
                        Chỉ mất một chút thời gian để chuẩn bị dữ liệu đẹp cho bạn ✨
                    </p> */}
                </div>
            </div>
        </div>
    )
};

export const ProgressLoading = () => {
    const state = LoadingHook.useLoading();
    return <>
        {state.loading && <progress style={{ height: 6, position: 'fixed', top: 0, width: '100%', zIndex: 99999 }} className="uk-progress" value={state.progress} max="100"></progress>}
    </>
}

export const Loading = ({ height }: { height?: number }) => {
    return (
        <div style={{minHeight: `${height || 100}px`}} className=" flex items-center justify-center">
            <span className="text-primary text-opacity-80 text-4xl animate-spin"><AiOutlineLoading3Quarters/></span>
        </div>
    )
};

export const FetchLoading = () => {
    const { loading, show_loading } = LoadingHook.useLoading();
    
    if (loading && show_loading) {
        return (
            <div style={{
                alignItems: 'center',
                display: 'flex',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                background: `rgba(0,0,0,0)`,
                justifyContent: 'center',
                paddingTop: 35
            }}>
                <div style= {
                    {
                        position: "absolute",
                        bottom: 20,
                        right: 50
                    }
                }>
                    <div className="loader">Loading...</div>
                </div>
            </div>
        )
    }

    return null;
}

export const HorizontalLoading = () => {

        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                zIndex: 2,
                background: `rgba(0,0,0,0)`,
            }}>
                 <div className="loader2">Loading...</div>
            </div>
        )
}


export default LoadingAbsolute; 