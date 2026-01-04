import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView, Alert, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Game Data
const MILLIONAIRE_QUESTIONS = [
    {
        question: "Which country contributes the most to the United Nations budget?",
        options: ["China", "Russia", "United States", "United Kingdom"],
        answer: "United States",
        prize: "₦50,000"
    },
    {
        question: "What is the chemical symbol for Gold?",
        options: ["Au", "Ag", "Fe", "Hg"],
        answer: "Au",
        prize: "₦250,000"
    },
    {
        question: "Who was the first female Prime Minister of the United Kingdom?",
        options: ["Theresa May", "Margaret Thatcher", "Liz Truss", "Angela Merkel"],
        answer: "Margaret Thatcher",
        prize: "₦1,000,000"
    }
];

const COUNTRY_QUESTIONS = [
    {
        type: 'fact',
        content: "This country is known as the 'Giant of Africa'.",
        options: ["Ghana", "Nigeria", "South Africa", "Kenya"],
        answer: "Nigeria"
    },
    {
        type: 'fact',
        content: "Home to the Eiffel Tower.",
        options: ["Italy", "Spain", "Germany", "France"],
        answer: "France"
    },
    {
        type: 'fact',
        content: "The largest country in the world by land area.",
        options: ["Canada", "China", "USA", "Russia"],
        answer: "Russia"
    }
];

const GamesScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [activeGame, setActiveGame] = useState(null); // 'MILLIONAIRE' or 'COUNTRY'
    const [gameIndex, setGameIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    const resetGame = () => {
        setActiveGame(null);
        setGameIndex(0);
        setScore(0);
        setGameOver(false);
        setGameWon(false);
    };

    const startGame = (gameType) => {
        setActiveGame(gameType);
        setGameIndex(0);
        setScore(0);
        setGameOver(false);
        setGameWon(false);
    };

    const handleAnswer = (selectedOption) => {
        let isCorrect = false;
        let questions = activeGame === 'MILLIONAIRE' ? MILLIONAIRE_QUESTIONS : COUNTRY_QUESTIONS;

        if (selectedOption === questions[gameIndex].answer) {
            isCorrect = true;
            setScore(prev => prev + 1);
        } else {
            setGameOver(true);
            return;
        }

        if (gameIndex < questions.length - 1) {
            setGameIndex(prev => prev + 1);
        } else {
            setGameWon(true);
        }
    };

    const renderMillionaireGame = () => {
        const q = MILLIONAIRE_QUESTIONS[gameIndex];
        return (
            <View style={[styles.gameContainer, { backgroundColor: '#110F19' }]}>
                {/* Millionaire Header */}
                <View style={styles.milHeader}>
                    <View style={styles.milLogoContainer}>
                        <Ionicons name="trophy" size={32} color="#FFD700" />
                        <Text style={styles.milLogoText}>MILLIONAIRE</Text>
                    </View>
                    <View style={styles.milPrizeBadge}>
                        <Text style={styles.milPrizeLabel}>CURRENT PRIZE</Text>
                        <Text style={styles.milPrizeValue}>{q.prize}</Text>
                    </View>
                </View>

                {/* Progress Indicators */}
                <View style={styles.milProgressContainer}>
                    {MILLIONAIRE_QUESTIONS.map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.milProgressDot,
                                idx <= gameIndex && { backgroundColor: '#FFD700' },
                                idx === gameIndex && { transform: [{ scale: 1.2 }] }
                            ]}
                        />
                    ))}
                </View>

                {/* Question Card */}
                <View style={styles.milQuestionCard}>
                    <View style={styles.milQuestionInner}>
                        <Text style={styles.milQuestionText}>{q.question}</Text>
                    </View>
                    {/* Decorative Diamond Shapes */}
                    <View style={styles.milDiamondLeft} />
                    <View style={styles.milDiamondRight} />
                </View>

                {/* Options Grid */}
                <View style={styles.milOptionsGrid}>
                    {q.options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.milOptionButton}
                            onPress={() => handleAnswer(opt)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.milOptionHexagon}>
                                <Text style={styles.milOptionLabel}>{String.fromCharCode(65 + idx)}</Text>
                            </View>
                            <Text style={styles.milOptionText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderCountryGame = () => {
        const q = COUNTRY_QUESTIONS[gameIndex];
        return (
            <View style={[styles.gameContainer, { backgroundColor: '#E0F7FA' }]}>
                {/* Floating Shapes Background */}
                <View style={[styles.bgCircle, { top: -50, right: -50, width: 200, height: 200, backgroundColor: 'rgba(0,188,212,0.1)' }]} />
                <View style={[styles.bgCircle, { bottom: -100, left: -50, width: 300, height: 300, backgroundColor: 'rgba(0,150,136,0.1)' }]} />

                <View style={styles.countryHeader}>
                    <View style={styles.countryScoreBadge}>
                        <Ionicons name="star" size={20} color="#FFD700" />
                        <Text style={styles.countryScoreText}>{score}</Text>
                    </View>
                    <Text style={styles.countryTitle}>GUESS THE COUNTRY</Text>
                    <View style={{ width: 60 }} />
                </View>

                <View style={styles.countryCard}>
                    <View style={styles.countryIconContainer}>
                        <Ionicons name="earth" size={80} color="#00ACC1" />
                    </View>
                    <Text style={styles.countryClueLabel}>DID YOU KNOW?</Text>
                    <Text style={styles.countryClue}>{q.content}</Text>
                </View>

                <View style={styles.countryOptions}>
                    {q.options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.countryOptionButton,
                                { backgroundColor: idx % 2 === 0 ? '#00ACC1' : '#0097A7' }
                            ]}
                            onPress={() => handleAnswer(opt)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.countryOptionText}>{opt}</Text>
                            <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderResultModal = () => (
        <Modal transparent={true} visible={gameOver || gameWon} animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={[styles.resultCard, { backgroundColor: theme.card }]}>
                    <View style={[styles.resultIconCircle, { backgroundColor: gameWon ? 'rgba(255,215,0,0.2)' : 'rgba(244,67,54,0.2)' }]}>
                        <Ionicons
                            name={gameWon ? "trophy" : "close"}
                            size={50}
                            color={gameWon ? "#FFD700" : "#F44336"}
                        />
                    </View>
                    <Text style={[styles.resultTitle, { color: theme.text }]}>
                        {gameWon ? "VICTORY!" : "GAME OVER"}
                    </Text>
                    <Text style={[styles.resultMsg, { color: theme.textSecondary }]}>
                        {gameWon ? `You won ${activeGame === 'MILLIONAIRE' ? MILLIONAIRE_QUESTIONS[2].prize : 'the game'}!` : "Better luck next time!"}
                    </Text>

                    <View style={styles.resultActions}>
                        <TouchableOpacity
                            style={[styles.playAgainBtn, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}
                            onPress={resetGame}
                        >
                            <Text style={[styles.playAgainText, { color: theme.text }]}>Quit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.playAgainBtn, { backgroundColor: theme.primary, flex: 1.5 }]}
                            onPress={() => startGame(activeGame)}
                        >
                            <Text style={[styles.playAgainText, { color: '#fff' }]}>Play Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (activeGame) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: activeGame === 'MILLIONAIRE' ? '#110F19' : '#E0F7FA' }]}>
                {/* In-Game Header to Quit */}
                <TouchableOpacity style={styles.quitButton} onPress={resetGame}>
                    <Ionicons name="close-circle" size={32} color={activeGame === 'MILLIONAIRE' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                </TouchableOpacity>

                {activeGame === 'MILLIONAIRE' ? renderMillionaireGame() : renderCountryGame()}
                {renderResultModal()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Game Center</Text>
                <View style={styles.headerIcon} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Millionaire Card */}
                <TouchableOpacity
                    style={[styles.gameCard, styles.milCard]}
                    onPress={() => startGame('MILLIONAIRE')}
                    activeOpacity={0.9}
                >
                    <View style={styles.gameCardInner}>
                        <View style={styles.gameIconBadge}>
                            <Ionicons name="trophy" size={32} color="#FFD700" />
                        </View>
                        <View style={styles.gameTextContent}>
                            <Text style={styles.gameTitleLight}>Who Wants to be a</Text>
                            <Text style={styles.gameTitleBold}>Millionaire</Text>
                            <View style={styles.gameTag}>
                                <Text style={styles.gameTagText}>TRIVIA</Text>
                            </View>
                        </View>
                        <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
                    </View>
                    <Image
                        source={require('../../assets/images/games_bg.jpg')}
                        style={[StyleSheet.absoluteFill, { opacity: 0.1, borderRadius: 20 }]}
                    />
                </TouchableOpacity>

                {/* Country Card */}
                <TouchableOpacity
                    style={[styles.gameCard, styles.countryCardMenu]}
                    onPress={() => startGame('COUNTRY')}
                    activeOpacity={0.9}
                >
                    <View style={styles.gameCardInner}>
                        <View style={[styles.gameIconBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Ionicons name="earth" size={32} color="#fff" />
                        </View>
                        <View style={styles.gameTextContent}>
                            <Text style={styles.gameTitleLight}>Explore World</Text>
                            <Text style={styles.gameTitleBold}>Guess Country</Text>
                            <View style={[styles.gameTag, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                                <Text style={styles.gameTagText}>GEOGRAPHY</Text>
                            </View>
                        </View>
                        <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
        borderBottomWidth: 1,
    },
    headerIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    content: { padding: 20 },

    // Menu Cards
    gameCard: {
        borderRadius: 24,
        marginBottom: 20,
        height: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    milCard: { backgroundColor: '#211848' },
    countryCardMenu: { backgroundColor: '#00ACC1' },
    gameCardInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        zIndex: 2,
    },
    gameIconBadge: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    gameTextContent: { flex: 1 },
    gameTitleLight: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
    gameTitleBold: { color: '#fff', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
    gameTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
    },
    gameTagText: { fontSize: 10, fontWeight: 'bold', color: '#000' },

    // Game Common
    quitButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 50,
        right: 20,
        zIndex: 10,
    },
    gameContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },

    // Millionaire Styles
    milHeader: { marginBottom: 30, alignItems: 'center' },
    milLogoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    milLogoText: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
    milPrizeBadge: {
        backgroundColor: 'rgba(255,215,0,0.15)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)'
    },
    milPrizeLabel: { color: '#FFD700', fontSize: 10, textAlign: 'center', fontWeight: 'bold' },
    milPrizeValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
    milProgressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 30 },
    milProgressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3D3D5C' },

    milQuestionCard: {
        backgroundColor: '#1E1E2C',
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#FFD700',
        padding: 4,
        marginBottom: 30,
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        minHeight: 180,
        justifyContent: 'center',
    },
    milQuestionInner: {
        backgroundColor: '#161621',
        flex: 1,
        borderRadius: 20,
        justifyContent: 'center',
        padding: 20,
        alignItems: 'center',
    },
    milQuestionText: { color: '#fff', fontSize: 20, textAlign: 'center', fontWeight: '600', lineHeight: 28 },
    milDiamondLeft: { position: 'absolute', left: -10, top: '45%', width: 20, height: 20, backgroundColor: '#FFD700', transform: [{ rotate: '45deg' }] },
    milDiamondRight: { position: 'absolute', right: -10, top: '45%', width: 20, height: 20, backgroundColor: '#FFD700', transform: [{ rotate: '45deg' }] },

    milOptionsGrid: { gap: 12 },
    milOptionButton: {
        backgroundColor: '#2A2A40',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#4A4A6A',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4, // Inner padding for pill shape
        height: 60,
    },
    milOptionHexagon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#110F19',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    milOptionLabel: { color: '#FFD700', fontWeight: 'bold', fontSize: 18 },
    milOptionText: { color: '#fff', fontSize: 16, fontWeight: '500', marginLeft: 16, flex: 1 },

    // Country Game Styles
    bgCircle: { position: 'absolute', borderRadius: 999 },
    countryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    countryScoreBadge: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    countryScoreText: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    countryTitle: { fontSize: 16, fontWeight: '900', color: '#006064', letterSpacing: 1 },

    countryCard: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: "#00ACC1",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    countryIconContainer: { marginBottom: 20, padding: 20, backgroundColor: '#E0F7FA', borderRadius: 50 },
    countryClueLabel: { fontSize: 12, fontWeight: 'bold', color: '#00ACC1', marginBottom: 8, letterSpacing: 1 },
    countryClue: { fontSize: 22, textAlign: 'center', fontWeight: '700', color: '#37474F', lineHeight: 30 },

    countryOptions: { gap: 12 },
    countryOptionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    countryOptionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    // Result Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    resultCard: { width: '100%', maxWidth: 300, borderRadius: 30, padding: 30, alignItems: 'center' },
    resultIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    resultTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8 },
    resultMsg: { textAlign: 'center', marginBottom: 30, fontSize: 16 },
    resultActions: { flexDirection: 'row', gap: 12, width: '100%' },
    playAgainBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    playAgainText: { fontWeight: 'bold', fontSize: 16 },
});

export default GamesScreen;
