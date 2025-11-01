/**
 * EmotionalStateVisualization Component
 * 
 * A comprehensive, animated visualization of Nema's emotional state
 * Inspired by HUD/diagnostic interface aesthetics with monochrome design
 * Features timeline visualization with discrete points for each state
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

const EmotionalStateVisualization = ({
    emotionalState,
    className = '',
    variant = 'full', // 'full', 'compact', 'minimal'
    showHistory = false,
    historyData = [] // Array of historical emotional states
}) => {
    const timelineRef = useRef(null);
    const [previousState, setPreviousState] = useState(null);
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [animatedValues, setAnimatedValues] = useState({});

    // Emotion configuration based on Plutchik's 8 primary emotions
    const emotionConfig = {
        joy: {
            label: 'Joy',
            color: '#05FFF3', // nema-cyan
            description: 'Positive valence, high energy',
            abbreviation: 'JOY'
        },
        sadness: {
            label: 'Sadness',
            color: '#FFFFFF',
            description: 'Negative valence, low energy',
            abbreviation: 'SAD'
        },
        anger: {
            label: 'Anger',
            color: '#FF6347',
            description: 'Negative valence, high energy',
            abbreviation: 'ANG'
        },
        fear: {
            label: 'Fear',
            color: '#FFFFFF',
            description: 'Negative valence, high arousal',
            abbreviation: 'FEA'
        },
        disgust: {
            label: 'Disgust',
            color: '#FFFFFF',
            description: 'Negative valence, moderate energy',
            abbreviation: 'DIS'
        },
        surprise: {
            label: 'Surprise',
            color: '#05FFF3',
            description: 'Neutral valence, high energy',
            abbreviation: 'SUR'
        },
        anticipation: {
            label: 'Anticipation',
            color: '#05FFF3',
            description: 'Positive valence, moderate energy',
            abbreviation: 'ANT'
        },
        trust: {
            label: 'Trust',
            color: '#05FFF3',
            description: 'Positive valence, low energy',
            abbreviation: 'TRU'
        }
    };

    // Normalize emotional state with defaults
    const normalizedState = useMemo(() => {
        if (!emotionalState) {
            return Object.keys(emotionConfig).reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {});
        }
        return emotionalState;
    }, [emotionalState]);

    // Get dominant emotion
    const dominantEmotion = useMemo(() => {
        if (!normalizedState) return null;
        const entries = Object.entries(normalizedState);
        const maxEntry = entries.reduce((max, [key, value]) =>
            value > max[1] ? [key, value] : max,
            ['joy', 0]
        );
        return { name: maxEntry[0], value: maxEntry[1], ...emotionConfig[maxEntry[0]] };
    }, [normalizedState]);

    // Set initial selected emotion to dominant
    useEffect(() => {
        if (dominantEmotion && !selectedEmotion) {
            setSelectedEmotion(dominantEmotion.name);
        }
    }, [dominantEmotion, selectedEmotion]);

    // Get currently displayed emotion (selected or dominant)
    const displayedEmotion = useMemo(() => {
        if (!selectedEmotion || !normalizedState) return dominantEmotion;
        return {
            name: selectedEmotion,
            value: normalizedState[selectedEmotion] || 0,
            ...emotionConfig[selectedEmotion]
        };
    }, [selectedEmotion, normalizedState, dominantEmotion]);

    // Animate values when they change
    useEffect(() => {
        if (!normalizedState) return;

        const updates = {};
        Object.keys(normalizedState).forEach(emotion => {
            const currentValue = animatedValues[emotion] ?? normalizedState[emotion];
            const targetValue = normalizedState[emotion] || 0;

            if (Math.abs(currentValue - targetValue) > 0.1) {
                updates[emotion] = {
                    current: currentValue,
                    target: targetValue,
                    startTime: Date.now()
                };
            }
        });

        if (Object.keys(updates).length > 0) {
            const animate = () => {
                const now = Date.now();
                const newValues = { ...animatedValues };
                let stillAnimating = false;

                Object.keys(updates).forEach(emotion => {
                    const { current, target, startTime } = updates[emotion];
                    const duration = 800; // 800ms animation
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing function
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const newValue = current + (target - current) * eased;

                    newValues[emotion] = newValue;

                    if (progress < 1) {
                        stillAnimating = true;
                    } else {
                        newValues[emotion] = target;
                    }
                });

                setAnimatedValues(newValues);

                if (stillAnimating) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [normalizedState, animatedValues]);

    // Initialize animated values
    useEffect(() => {
        if (normalizedState && Object.keys(animatedValues).length === 0) {
            setAnimatedValues(normalizedState);
        }
    }, [normalizedState]);

    // Detect changes for animations
    useEffect(() => {
        if (previousState && normalizedState) {
            const hasChanged = Object.keys(normalizedState).some(
                key => Math.abs((previousState[key] || 0) - (normalizedState[key] || 0)) > 1
            );
            if (hasChanged) {
                // Trigger re-render of timeline
            }
        }
        setPreviousState(normalizedState);
    }, [normalizedState, previousState]);

    // Draw timeline with discrete points for each state
    useEffect(() => {
        if (!timelineRef.current || !showHistory || historyData.length === 0 || !displayedEmotion) return;

        const svg = d3.select(timelineRef.current);
        svg.selectAll('*').remove();

        const width = timelineRef.current.clientWidth || 400;
        const height = 80;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain([0, historyData.length - 1])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([innerHeight, 0]);

        // Extract emotion values from history
        const timelineData = historyData.map((state, i) => {
            const emotionalState = state.emotional_state || state.emotionalState || {};
            return {
                x: i,
                y: emotionalState[displayedEmotion.name] || 0,
                timestamp: state.updated_at || state.updatedAt
            };
        });

        // Draw connecting line
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveCatmullRom.alpha(0.5));

        g.append('path')
            .datum(timelineData)
            .attr('fill', 'none')
            .attr('stroke', displayedEmotion.color)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.6)
            .attr('d', line);

        // Draw discrete points for each state
        timelineData.forEach((point, i) => {
            // Draw point
            g.append('circle')
                .attr('cx', xScale(point.x))
                .attr('cy', yScale(point.y))
                .attr('r', 3)
                .attr('fill', displayedEmotion.color)
                .attr('opacity', 0.8)
                .attr('stroke', '#05FFF3')
                .attr('stroke-width', 1);

            // Draw value label (only for significant points or every nth)
            if (i % Math.max(1, Math.floor(timelineData.length / 8)) === 0 || i === timelineData.length - 1) {
                g.append('text')
                    .attr('x', xScale(point.x))
                    .attr('y', yScale(point.y) - 8)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#05FFF3')
                    .attr('font-size', '8px')
                    .attr('font-family', 'monospace')
                    .text(Math.round(point.y));
            }
        });

        // Draw background area
        const area = d3.area()
            .x(d => xScale(d.x))
            .y0(innerHeight)
            .y1(d => yScale(d.y))
            .curve(d3.curveCatmullRom.alpha(0.5));

        g.append('path')
            .datum(timelineData)
            .attr('fill', displayedEmotion.color)
            .attr('opacity', 0.15)
            .attr('d', area);
    }, [historyData, showHistory, displayedEmotion]);

    // Get intensity label
    const getIntensityLabel = (value) => {
        if (value < 20) return 'Minimal';
        if (value < 40) return 'Low';
        if (value < 60) return 'Moderate';
        if (value < 80) return 'High';
        return 'Intense';
    };

    if (variant === 'minimal') {
        return (
            <div className={`${className}`}>
                <div className="flex items-center gap-2">
                    {dominantEmotion && (
                        <>
                            <div className="w-2 h-2 rounded-full bg-nema-cyan animate-pulse"></div>
                            <span className="text-xs text-nema-white font-anonymous">
                                {dominantEmotion.label}: {Math.round(animatedValues[dominantEmotion.name] || dominantEmotion.value)}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        // Compact variant - only circles for all emotions (point in time view)
        const emotionEntries = Object.entries(normalizedState);

        return (
            <div className={`border border-nema-gray p-4 ${className}`}>
                <div className="mb-3">
                    <h3 className="text-sm font-intranet text-nema-cyan mb-2">EMOTIONAL STATE</h3>
                    {displayedEmotion && (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-lg font-anonymous text-nema-white font-medium">
                                {displayedEmotion.label}
                            </div>
                            <div className="flex-1 h-2 bg-nema-black border border-nema-gray/50 overflow-hidden">
                                <div
                                    className="h-full bg-nema-cyan transition-all duration-500"
                                    style={{ width: `${animatedValues[displayedEmotion.name] || displayedEmotion.value}%` }}
                                ></div>
                            </div>
                            <div className="text-sm font-anonymous text-nema-white font-mono">
                                {Math.round(animatedValues[displayedEmotion.name] || displayedEmotion.value)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Circular indicators for ALL emotions - clickable */}
                <div className="grid grid-cols-4 gap-3">
                    {emotionEntries.map(([emotion, value]) => {
                        const config = emotionConfig[emotion];
                        const animatedValue = animatedValues[emotion] ?? value;
                        const percentage = animatedValue || 0;
                        const isSelected = selectedEmotion === emotion;
                        const radius = 18;
                        const circumference = 2 * Math.PI * radius;
                        const offset = circumference * (1 - percentage / 100);

                        return (
                            <button
                                key={emotion}
                                onClick={() => setSelectedEmotion(emotion)}
                                className={`relative transition-all duration-200 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="flex flex-col items-center">
                                    <svg className="w-full aspect-square" viewBox="0 0 40 40">
                                        {/* Background circle */}
                                        <circle
                                            cx="20"
                                            cy="20"
                                            r={radius}
                                            fill="none"
                                            stroke="#05FFF3"
                                            strokeWidth="2"
                                            opacity="0.2"
                                        />
                                        {/* Progress circle */}
                                        <circle
                                            cx="20"
                                            cy="20"
                                            r={radius}
                                            fill="none"
                                            stroke="#05FFF3"
                                            strokeWidth="2"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={offset}
                                            strokeLinecap="round"
                                            transform="rotate(-90 20 20)"
                                            className="transition-all duration-700"
                                            opacity={isSelected ? 1 : percentage > 50 ? 0.8 : 0.6}
                                        />
                                        {/* Center dot */}
                                        <circle
                                            cx="20"
                                            cy="20"
                                            r="4"
                                            fill="#05FFF3"
                                            opacity={isSelected ? 1 : percentage > 50 ? 0.8 : 0.5}
                                        />
                                    </svg>
                                    {/* Label below circle */}
                                    <div className="mt-1.5 text-center">
                                        <span className={`text-[9px] font-anonymous leading-tight block ${isSelected ? 'text-nema-cyan font-bold' : 'text-nema-white'
                                            }`}>
                                            {config.abbreviation}
                                        </span>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-nema-cyan rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Full variant
    return (
        <div className={`border border-nema-gray p-6 bg-nema-black/30 ${className}`}>
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-xl font-intranet text-nema-cyan mb-4">EMOTIONAL STATE</h2>
            </div>

            {/* Timeline at the top - only real data */}
            {showHistory && historyData.length > 0 && displayedEmotion && (
                <div className="mb-6 border border-nema-gray/30 p-3 bg-nema-black/50">
                    <div className="text-xs font-anonymous text-nema-white mb-2">
                        EMOTIONAL TIMELINE - {displayedEmotion.label.toUpperCase()}
                    </div>
                    <svg ref={timelineRef} className="w-full h-24"></svg>
                </div>
            )}

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Left: Emotion Bars */}
                <div className="space-y-2">
                    {Object.entries(normalizedState).map(([emotion, value]) => {
                        const config = emotionConfig[emotion];
                        const animatedValue = animatedValues[emotion] ?? value;
                        const percentage = animatedValue || 0;
                        const isSelected = selectedEmotion === emotion;

                        return (
                            <button
                                key={emotion}
                                onClick={() => setSelectedEmotion(emotion)}
                                className={`w-full text-left space-y-1 p-2 rounded transition-all duration-200 ${isSelected ? 'bg-nema-cyan/10 border border-nema-cyan/50' : 'hover:bg-nema-black/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between text-xs font-anonymous">
                                    <span className={`uppercase ${isSelected ? 'text-nema-cyan font-bold' : 'text-nema-white'}`}>
                                        {config.label}
                                    </span>
                                    <span className={`font-mono ${isSelected ? 'text-nema-cyan' : 'text-nema-gray-darker'}`}>
                                        {Math.round(percentage)}
                                    </span>
                                </div>
                                <div className="relative h-2 bg-nema-black border border-nema-gray/30 overflow-hidden">
                                    <div
                                        className={`absolute inset-0 bg-nema-cyan transition-all duration-700 ${isSelected ? 'opacity-100' : 'opacity-60'
                                            }`}
                                        style={{ width: `${percentage}%` }}
                                    >
                                        <div className="absolute inset-0 opacity-30" style={{
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)'
                                        }}></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Circular Indicators - Clickable */}
                <div className="grid grid-cols-4 gap-3">
                    {Object.entries(normalizedState)
                        .sort(([, a], [, b]) => (b || 0) - (a || 0))
                        .map(([emotion, value]) => {
                            const config = emotionConfig[emotion];
                            const animatedValue = animatedValues[emotion] ?? value;
                            const percentage = animatedValue || 0;
                            const isSelected = selectedEmotion === emotion;
                            const radius = 20;
                            const circumference = 2 * Math.PI * radius;
                            const offset = circumference * (1 - percentage / 100);

                            return (
                                <button
                                    key={emotion}
                                    onClick={() => setSelectedEmotion(emotion)}
                                    className={`relative transition-all duration-200 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                                    style={{ cursor: 'pointer' }}
                                    title={config.label}
                                >
                                    <div className="flex flex-col items-center">
                                        <svg className="w-full aspect-square" viewBox="0 0 50 50">
                                            {/* Background circle */}
                                            <circle
                                                cx="25"
                                                cy="25"
                                                r={radius}
                                                fill="none"
                                                stroke="#05FFF3"
                                                strokeWidth="2"
                                                opacity="0.1"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="25"
                                                cy="25"
                                                r={radius}
                                                fill="none"
                                                stroke="#05FFF3"
                                                strokeWidth="2"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                                strokeLinecap="round"
                                                transform="rotate(-90 25 25)"
                                                className="transition-all duration-700"
                                                opacity={isSelected ? 1 : percentage > 50 ? 0.8 : 0.6}
                                            />
                                            {/* Center dot */}
                                            <circle
                                                cx="25"
                                                cy="25"
                                                r="4"
                                                fill="#05FFF3"
                                                opacity={isSelected ? 1 : percentage > 50 ? 0.8 : 0.5}
                                            />
                                        </svg>
                                        {/* Label below circle */}
                                        <div className="mt-1.5 text-center">
                                            <span className={`text-[8px] font-anonymous leading-tight block ${isSelected ? 'text-nema-cyan font-bold' : 'text-nema-white'
                                                }`}>
                                                {config.abbreviation}
                                            </span>
                                            <span className={`text-[7px] font-anonymous mt-0.5 block ${isSelected ? 'text-nema-cyan' : 'text-nema-gray-darker'
                                                }`}>
                                                {Math.round(percentage)}
                                            </span>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-nema-cyan rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default EmotionalStateVisualization;
