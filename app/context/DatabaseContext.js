import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// REMOVED: import { SUBJECTS_DATA... } from '../data/subjects'; <-- This caused the dependency

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
    const [subjects, setSubjects] = useState([]);
    const [videos, setVideos] = useState([]);
    const [activities, setActivities] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeDatabase();
    }, []);

    const initializeDatabase = async () => {
        try {
            const isSeeded = await AsyncStorage.getItem('is_seeded');
            if (isSeeded !== 'true') {
                await seedDatabase();
            }
            await loadData();
        } catch (error) {
            console.error('Failed to initialize database:', error);
        } finally {
            setLoading(false);
        }
    };

    const seedDatabase = async () => {
        console.log('Seeding initial static data...');

        // Keep these if you want default Subjects/Videos before the backend loads
        // If you fetch EVERYTHING from backend, you can make these empty arrays []
        const initialSubjects = [
            { key: 'mathematics', title: 'Mathematics', icon: 'calculator', color: '#FFC107' },
            { key: 'chemistry', title: 'Chemistry', icon: 'flask', color: '#FF9800' },
            { key: 'physics', title: 'Physics', icon: 'magnet', color: '#FF5722' },
            { key: 'english', title: 'English', icon: 'book', color: '#8BC34A' },
        ];

        // Placeholder videos (You can remove these if fetching from backend)
        const initialVideos = [
            { id: 'math1', videoId: 'UrECQM2zHPQ', title: 'Mathematics Video 1', subject: 'mathematics' },
        ];

        // Placeholder activities
        const initialActivities = [];

        // NO QUESTIONS SEEDED (Since they come from backend)
        const initialQuestions = [];

        const multiSetPairs = [
            ['subjects', JSON.stringify(initialSubjects)],
            ['videos', JSON.stringify(initialVideos)],
            ['activities', JSON.stringify(initialActivities)],
            ['questions', JSON.stringify(initialQuestions)],
            ['is_seeded', 'true']
        ];

        await AsyncStorage.multiSet(multiSetPairs);
    };

    const loadData = async () => {
        const keys = ['subjects', 'videos', 'activities', 'questions'];
        const result = await AsyncStorage.multiGet(keys);
        const data = {};
        result.forEach(([key, value]) => {
            data[key] = value ? JSON.parse(value) : [];
        });

        setSubjects(data.subjects);
        setVideos(data.videos);
        setActivities(data.activities);
        setQuestions(data.questions);
    };

    return (
        <DatabaseContext.Provider value={{ subjects, videos, activities, questions, loading }}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => useContext(DatabaseContext);
