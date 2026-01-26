import React, { useEffect, useRef } from 'react';
import { useEditorContext } from './EditorContext';
import { BehavioralTrackingService, WritingPatternData } from '../../services/behavioralTrackingService';

interface BehavioralTrackerProps {
    projectId: string;
    userId: string;
}

const BehavioralTracker: React.FC<BehavioralTrackerProps> = ({ projectId, userId }) => {
    const { editor } = useEditorContext(); // Access the editor instance
    const keystrokeTimesRef = useRef<number[]>([]);
    const pauseDurationsRef = useRef<number[]>([]);
    const deletionCountsRef = useRef<number>(0);
    const correctionCountsRef = useRef<number>(0);
    const revisionCountsRef = useRef<number>(0);
    const typingSpeedsRef = useRef<number[]>([]);
    const lastActionTimeRef = useRef<number>(Date.now());
    const lastTypedWordTimeRef = useRef<number>(Date.now());
    const wordCountRef = useRef<number>(0);

    // Initialize behavioral tracking when component mounts
    useEffect(() => {
        if (!editor) return;

        // Track key presses for typing speed and pause patterns
        const handleKeyDown = () => {
            const currentTime = Date.now();
            const timeSinceLastAction = currentTime - lastActionTimeRef.current;

            // Record pause duration if it's more than 100ms (significant pause)
            if (timeSinceLastAction > 100) {
                pauseDurationsRef.current.push(timeSinceLastAction);
            }

            // Track typing speed based on time between keystrokes
            if (timeSinceLastAction < 1000) { // Only track rapid typing
                const typingSpeed = 60000 / timeSinceLastAction; // Approximate words per minute
                typingSpeedsRef.current.push(typingSpeed);
            }

            lastActionTimeRef.current = currentTime;
        };

        // Track text changes to monitor corrections and deletions
        const handleTextChange = () => {
            const content = editor.getText();
            const newWordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

            // Calculate word count difference to detect additions/deletions
            const wordDiff = newWordCount - wordCountRef.current;

            if (wordDiff < 0) {
                // Negative word diff indicates deletions/corrections
                deletionCountsRef.current += Math.abs(wordDiff);
                correctionCountsRef.current += 1;
            } else if (wordDiff > 0) {
                // Positive word diff indicates additions
                wordCountRef.current = newWordCount;
            }

            // Track revision patterns (editing the same content multiple times)
            revisionCountsRef.current += 1;
        };

        // Listen for editor events
        const editorView = editor.view;
        if (editorView?.dom) {
            editorView.dom.addEventListener('keydown', handleKeyDown);
            editor.on('transaction', handleTextChange);
        }

        // Clean up event listeners
        return () => {
            if (editorView?.dom) {
                editorView.dom.removeEventListener('keydown', handleKeyDown);
                editor.off('transaction', handleTextChange);
            }
        };
    }, [editor]);

    // Periodically send behavioral data to the backend
    useEffect(() => {
        const interval = setInterval(() => {
            if (projectId && userId) {
                const behaviorData: Partial<WritingPatternData> = {
                    projectId,
                    userId,
                    typingSpeedVariations: [...typingSpeedsRef.current],
                    pauseDurations: [...pauseDurationsRef.current],
                    deletionPatterns: [deletionCountsRef.current],
                    correctionFrequency: correctionCountsRef.current,
                    revisionPatterns: [revisionCountsRef.current],
                    errorRate: deletionCountsRef.current / (typingSpeedsRef.current.length || 1),
                    averageThinkTime: pauseDurationsRef.current.reduce((sum, val) => sum + val, 0) / (pauseDurationsRef.current.length || 1)
                };

                // Send data to backend
                BehavioralTrackingService.trackTypingBehavior(projectId, behaviorData);

                // Reset tracked values after sending
                typingSpeedsRef.current = [];
                pauseDurationsRef.current = [];
                deletionCountsRef.current = 0;
                revisionCountsRef.current = 0;
            }
        }, 30000); // Send data every 30 seconds

        return () => clearInterval(interval);
    }, [projectId, userId]);

    return null; // This component doesn't render anything visible
};

export default BehavioralTracker;