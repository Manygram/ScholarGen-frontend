import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUBJECTS_DATA, generateDemoQuestions } from '../data/subjects';

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
            // Check if seeded
            const isSeeded = await AsyncStorage.getItem('is_seeded');

            if (isSeeded !== 'true') {
                await seedDatabase();
            }

            // Load data into state
            await loadData();
        } catch (error) {
            console.error('Failed to initialize database:', error);
        } finally {
            setLoading(false);
        }
    };

    const seedDatabase = async () => {
        console.log('Seeding AsyncStorage...');

        // Subjects
        const initialSubjects = [
            { key: 'mathematics', title: 'Mathematics', icon: 'calculator', color: '#FFC107' },
            { key: 'chemistry', title: 'Chemistry', icon: 'flask', color: '#FF9800' },
            { key: 'physics', title: 'Physics', icon: 'magnet', color: '#FF5722' },
            { key: 'english', title: 'English', icon: 'book', color: '#8BC34A' },
        ];

        // Videos
        const initialVideos = [
            { id: 'math1', videoId: 'UrECQM2zHPQ', title: 'Mathematics Video 1', subject: 'mathematics', thumbnail: 'https://img.youtube.com/vi/UrECQM2zHPQ/hqdefault.jpg' },
            { id: 'math2', videoId: 'Ju1Nh2fb1as', title: 'Mathematics Video 2', subject: 'mathematics', thumbnail: 'https://img.youtube.com/vi/Ju1Nh2fb1as/hqdefault.jpg' },
            { id: 'chem1', videoId: 'O5DqBh9vCy4', title: 'Chemistry Video 1', subject: 'chemistry', thumbnail: 'https://img.youtube.com/vi/O5DqBh9vCy4/hqdefault.jpg' },
            { id: 'phy1', videoId: 'O5DqBh9vCy4', title: 'Physics Video 1', subject: 'physics', thumbnail: 'https://img.youtube.com/vi/O5DqBh9vCy4/hqdefault.jpg' },
            { id: 'eng1', videoId: 'P_-D6DZeHZU', title: 'English Video 1', subject: 'english', thumbnail: 'https://img.youtube.com/vi/P_-D6DZeHZU/hqdefault.jpg' },
        ];

        // Activities
        const initialActivities = [
            { id: 1, title: 'Mathematics Practice', subtitle: 'Completed 2 hours ago', score: '85%', color: '#4CAF50', date: new Date().toISOString() },
            { id: 2, title: 'English Language', subtitle: 'Completed yesterday', score: '92%', color: '#2196F3', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, title: 'Physics Quiz', subtitle: 'Completed 2 days ago', score: '78%', color: '#FF9800', date: new Date(Date.now() - 172800000).toISOString() },
        ];

        // Questions
        let initialQuestions = [];
        Object.entries(SUBJECTS_DATA).forEach(([category, subList]) => {
            subList.forEach(subject => {
                const qs = generateDemoQuestions(subject, category);
                initialQuestions = [...initialQuestions, ...qs];
            });
        });

        const multiSetPairs = [
            ['subjects', JSON.stringify(initialSubjects)],
            ['videos', JSON.stringify(initialVideos)],
            ['activities', JSON.stringify(initialActivities)],
            ['questions', JSON.stringify(initialQuestions)],
            ['is_seeded', 'true']
        ];

        await AsyncStorage.multiSet(multiSetPairs);
        console.log('Seeding complete.');
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
