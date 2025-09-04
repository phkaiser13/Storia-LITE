import api from './api';
import { RegisterMovementRequestDto, MovementType } from '../types';

const OFFLINE_QUEUE_KEY = 'offline-movement-queue';

interface QueuedMovement {
    type: MovementType;
    payload: RegisterMovementRequestDto;
    timestamp: number;
}

export const getOfflineQueue = (): QueuedMovement[] => {
    try {
        const queueJson = localStorage.getItem(OFFLINE_QUEUE_KEY);
        return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
        console.error("Failed to parse offline queue:", error);
        localStorage.removeItem(OFFLINE_QUEUE_KEY); // Clear corrupted data
        return [];
    }
};

export const addToOfflineQueue = (type: MovementType, payload: RegisterMovementRequestDto) => {
    const queue = getOfflineQueue();
    queue.push({ type, payload, timestamp: Date.now() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const syncOfflineMovements = async (): Promise<{ success: number; failed: number }> => {
    if (!navigator.onLine) {
        console.log("Offline, skipping sync.");
        return { success: 0, failed: 0 };
    }

    const queue = getOfflineQueue();
    if (queue.length === 0) {
        return { success: 0, failed: 0 };
    }

    console.log(`Syncing ${queue.length} offline movements...`);

    const results = await Promise.allSettled(
        queue.map(item => {
            const endpoint = item.type === MovementType.CHECKIN ? '/api/movements/checkin' : '/api/movements/checkout';
            return api.post(endpoint, item.payload);
        })
    );

    const newQueue: QueuedMovement[] = [];
    let successCount = 0;

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            successCount++;
        } else {
            console.error("Failed to sync movement:", queue[index], result.reason);
            // Keep failed requests (e.g., due to server error 500) in the queue for retry later
            newQueue.push(queue[index]); 
        }
    });

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
    
    console.log(`Sync complete. Successful: ${successCount}, Failed: ${newQueue.length}`);
    return { success: successCount, failed: newQueue.length };
};
