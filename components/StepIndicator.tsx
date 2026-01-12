
import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

const STEPS = [
    { id: 1, label: "Tên Đề Tài (Topic)" },
    { id: 2, label: "Mô Hình (Research Model)" },
    { id: 3, label: "Đề Cương (Outline)" }
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="w-full py-4 mb-6">
            <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isCompleted ? "bg-green-500 border-green-500 text-white" :
                                        isCurrent ? "bg-white border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]" :
                                            "bg-white border-slate-200 text-slate-300"
                                )}
                            >
                                {isCompleted ? <Check className="w-6 h-6" /> : <span className="font-bold">{step.id}</span>}
                            </div>
                            <span className={cn(
                                "mt-2 text-xs font-semibold uppercase tracking-wide transition-colors duration-300",
                                isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-400"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
