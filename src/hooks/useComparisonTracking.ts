import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';

export const useComparisonTracking = (userId: string | undefined) => {
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [trackingId, setTrackingId] = useState<string | null>(null);
    const isTrackingRef = useRef(false);

    const startTracking = async (systems: string[]) => {
        console.log('Starting tracking with userId:', userId);
        console.log('Systems to compare:', systems);
        
        // Don't start new tracking if one is already in progress
        if (isTrackingRef.current) {
            console.log('Tracking already in progress, skipping');
            return;
        }
        
        if (!userId) {
            console.log('No userId provided, skipping tracking');
            return;
        }
        
        const start = new Date();
        setStartTime(start);
        isTrackingRef.current = true;
        
        try {
            const insertData = {
                user_id: userId,
                comparison_start: start.toISOString(),
                systems_compared: systems
            };
            console.log('Inserting data:', insertData);
            
            const { data, error } = await supabase
                .from('user_comparison_report')
                .insert([insertData])
                .select('id')
                .single();
                
            if (error) {
                console.error('Error starting comparison tracking:', error);
                return;
            }
            
            console.log('Successfully inserted tracking data:', data);
            setTrackingId(data.id);
        } catch (error) {
            console.error('Error in startTracking:', error);
            isTrackingRef.current = false;
        }
    };

    const endTracking = async () => {
        console.log('Ending tracking:', { startTime, trackingId, userId });
        
        if (!startTime || !trackingId || !userId || !isTrackingRef.current) {
            console.log('Skipping end tracking:', { 
                noStartTime: !startTime, 
                noTrackingId: !trackingId, 
                noUserId: !userId,
                notTracking: !isTrackingRef.current 
            });
            return;
        }
        
        try {
            const endTime = new Date();
            const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            
            const updateData = {
                comparison_end: endTime.toISOString(),
                duration_seconds: durationSeconds
            };
            console.log('Updating with data:', updateData);
            
            const { error } = await supabase
                .from('user_comparison_report')
                .update(updateData)
                .eq('id', trackingId);

            if (error) {
                console.error('Error ending comparison tracking:', error);
            } else {
                console.log('Successfully ended tracking');
            }
        } catch (error) {
            console.error('Error in endTracking:', error);
        } finally {
            // Reset all state
            setTrackingId(null);
            setStartTime(null);
            isTrackingRef.current = false;
        }
    };

    // Cleanup on unmount only if we haven't already ended tracking
    useEffect(() => {
        return () => {
            if (isTrackingRef.current) {
                console.log('Cleanup: ending tracking on unmount');
                endTracking();
            }
        };
    }, []);

    return { startTracking, endTracking };
};
