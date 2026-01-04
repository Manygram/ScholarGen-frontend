"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
    Modal,
    Image,
    ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_BASE_URL = "https://api.scholargens.com/api"

const QuizScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()

    // subjects = [{ subjectId: "...", year: 2020 }]
    // originalSubjects = [{ _id: "...", name: "Physics" }]
    const { subjects, originalSubjects, mode, duration } = route.params

    // Merge for UI
    const [activeSubjects, setActiveSubjects] = useState([])

    useEffect(() => {
        if (subjects && originalSubjects) {
            const merged = subjects.map((apiSub) => {
                const original = originalSubjects.find((s) => s._id === apiSub.subjectId)
                return {
                    _id: apiSub.subjectId,
                    name: original ? original.name : "Unknown",
                    year: apiSub.year,
                }
            })
            setActiveSubjects(merged)
        }
    }, [subjects, originalSubjects])

    const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0)
    const [questionsState, setQuestionsState] = useState({})
    const [userAnswers, setUserAnswers] = useState({})
    const [subjectQuestionIndices, setSubjectQuestionIndices] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    // Timers & State...
    const [timeLeft, setTimeLeft] = useState(mode === "exam" ? duration * 60 : null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [timeSpentPerSubject, setTimeSpentPerSubject] = useState({})

    // UI Modals
    const [showExplanation, setShowExplanation] = useState(false)
    const [subscribeModalVisible, setSubscribeModalVisible] = useState(false)
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [finalScore, setFinalScore] = useState(0)
    const [finalTotal, setFinalTotal] = useState(0)
    const [quizId, setQuizId] = useState(null)

    const [studyShowAnswer, setStudyShowAnswer] = useState(false)

    // "isEvaluating" now effectively means "Is Checked" in Study Mode
    const [isEvaluating, setIsEvaluating] = useState(false)

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true)
            try {
                const token = await AsyncStorage.getItem("userToken")
                const authHeader = { headers: { Authorization: `Bearer ${token}` } }

                const payload = {
                    mode: mode,
                    subjects: subjects, // Pass the subjectId formatted list
                    durationInMinutes: mode === "exam" ? Number.parseInt(duration) : 0,
                }

                const response = await axios.post(`${API_BASE_URL}/quiz/start`, payload, authHeader)

                if (response.data && (response.data.quiz || response.data._id)) {
                    // Handle structure: response.data.quiz._id OR response.data._id depending on backend
                    const qId = response.data.quiz ? response.data.quiz._id : response.data._id
                    console.log("Quiz ID captured:", qId)
                    setQuizId(qId)

                    const groupedQuestions = response.data.quiz ? response.data.quiz.groupedQuestions : response.data.groupedQuestions

                    const mappedQuestions = {}
                    const initIndices = {}
                    const initAnswers = {}

                    subjects.forEach((sub) => {
                        const id = sub.subjectId
                        initIndices[id] = 0
                        initAnswers[id] = {}

                        const group = groupedQuestions.find((g) => g.subjectId === id)
                        const rawQuestions = group ? group.questions : []

                        mappedQuestions[id] = rawQuestions.map((q) => ({
                            ...q,
                            explanation: q.explanation || "No explanation provided.",
                            questionImage: q.images && q.images.length > 0 ? q.images[0] : null,
                            explanationImage: q.explanationImage || null,
                            options: q.options.map((opt) => ({ text: opt.text, image: opt.image })),
                        }))
                    })

                    setQuestionsState(mappedQuestions)
                    setSubjectQuestionIndices(initIndices)
                    setUserAnswers(initAnswers)

                    // Init timers
                    const initialTime = {}
                    subjects.forEach((s) => (initialTime[s.subjectId] = 0))
                    setTimeSpentPerSubject(initialTime)
                }
            } catch (error) {
                console.log("Quiz Start Error:", error)
                Alert.alert("Error", "Failed to load quiz.")
                navigation.goBack()
            } finally {
                setIsLoading(false)
            }
        }
        fetchQuestions()
    }, [])

    // ... Timer logic (same as previous)
    useEffect(() => {
        if (mode === "exam" && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleSubmit()
                        return 0
                    }
                    return prev - 1
                })

                if (!isSubmitting && activeSubjects.length > 0) {
                    const currentSubId = activeSubjects[currentSubjectIndex]?._id
                    if (currentSubId) {
                        setTimeSpentPerSubject((prev) => ({ ...prev, [currentSubId]: (prev[currentSubId] || 0) + 1 }))
                    }
                }
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft, mode, currentSubjectIndex, isSubmitting, activeSubjects])


    // Handlers
    const currentSubjectObj = activeSubjects[currentSubjectIndex]
    const currentSubjectId = currentSubjectObj?._id
    const currentQuestions = questionsState[currentSubjectId] || []
    const currentQIndex = subjectQuestionIndices[currentSubjectId] || 0
    const currentQuestion = currentQuestions[currentQIndex]

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

    const handleOptionSelect = (option) => {
        if ((showExplanation || isEvaluating) && mode !== "exam") return
        setUserAnswers((prev) => ({
            ...prev,
            [currentSubjectId]: { ...prev[currentSubjectId], [currentQIndex]: option },
        }))
    }

    const moveToNextQuestion = () => {
        if (currentQIndex < currentQuestions.length - 1) {
            setSubjectQuestionIndices((prev) => ({ ...prev, [currentSubjectId]: prev[currentSubjectId] + 1 }))
            setStudyShowAnswer(false)
            setShowExplanation(false)
            setIsEvaluating(false)
        } else if (currentSubjectIndex < activeSubjects.length - 1) {
            Alert.alert("Next Subject", `Switch to ${activeSubjects[currentSubjectIndex + 1].name}?`, [
                { text: "No", style: "cancel", onPress: () => setIsEvaluating(false) },
                {
                    text: "Yes",
                    onPress: () => {
                        setCurrentSubjectIndex((prev) => prev + 1)
                        setStudyShowAnswer(false)
                        setShowExplanation(false)
                        setIsEvaluating(false)
                    },
                },
            ])
        } else {
            handleSubmit()
        }
    }

    const handleNext = () => {
        const isPractice = mode === "practice" || mode === "study"
        const selectedOption = userAnswers[currentSubjectId]?.[currentQIndex]

        if (isPractice) {
            // "Check" State
            if (!isEvaluating) {
                if (!selectedOption) {
                    Alert.alert("Select an Option", "Please select an answer to check.")
                    return
                }
                // Show Feedback (Green/Red & Explanation)
                setIsEvaluating(true)
                setStudyShowAnswer(true)
                setShowExplanation(true)
                return
            }

            // "Next" State (Already Checked)
            if (isEvaluating) {
                moveToNextQuestion()
                return
            }
        }

        // Exam mode: Move immediately
        moveToNextQuestion()
    }

    const handlePrev = () => {
        // if (isEvaluating) return // Allow traversing back? usually yes
        if (currentQIndex > 0) {
            setSubjectQuestionIndices((prev) => ({ ...prev, [currentSubjectId]: prev[currentSubjectId] - 1 }))
            setStudyShowAnswer(false)
            setShowExplanation(false)
            setIsEvaluating(false)
        }
    }

    const handleSubmit = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)
        setIsEvaluating(false)

        try {
            const token = await AsyncStorage.getItem("userToken")
            const authHeader = { headers: { Authorization: `Bearer ${token}` } }

            // Construct answers map: { questionId: selectedOption }
            const formattedAnswers = {}
            let totalScore = 0
            let totalPossible = 0

            // Calculate detailed results locally for immediate display if needed, 
            // but primarily rely on backend or simple calc here for the "Score / 100" req.
            const subjectScores = {}

            activeSubjects.forEach(sub => {
                const subId = sub._id
                const questions = questionsState[subId] || []
                const answers = userAnswers[subId] || {}

                let subCorrect = 0

                questions.forEach((q, idx) => {
                    const selected = answers[idx]
                    if (selected) {
                        formattedAnswers[q._id] = selected
                    }
                    if (selected === q.correctOption) {
                        subCorrect++
                    }
                })

                // Calculate score / 100
                const percentage = questions.length > 0 ? (subCorrect / questions.length) * 100 : 0
                subjectScores[sub.name] = Math.round(percentage)
                totalScore += subCorrect
                totalPossible += questions.length
            })

            // Just for total display
            const totalAvg = activeSubjects.length > 0
                ? Object.values(subjectScores).reduce((a, b) => a + b, 0) / activeSubjects.length
                : 0

            setFinalScore(Math.round(totalAvg)) // Overall average percentage
            setFinalTotal(100)

            const payload = {
                answers: formattedAnswers,
                timeSpentPerSubject: timeSpentPerSubject
            }

            if (!quizId) {
                console.error("No Quiz ID found. Cannot submit.")
                Alert.alert("Error", "Quiz ID missing. Cannot submit results.")
                setIsSubmitting(false)
                return
            }

            console.log(`Submitting quiz ${quizId} to ${API_BASE_URL}/quiz/${quizId}/submit...`, payload)

            const response = await axios.post(`${API_BASE_URL}/quiz/${quizId}/submit`, payload, authHeader)

            // You might want to pass the result data to the modal or navigation
            setResultModalVisible(true)

        } catch (error) {
            console.error("Quiz Submit Error:", error)
            const errMsg = error.response ? `Status: ${error.response.status}` : error.message
            Alert.alert("Submission Failed", `Could not submit quiz results. ${errMsg}`)
            setIsSubmitting(false)
        }
    }

    const getOptionStyle = (optionText) => {
        const selected = userAnswers[currentSubjectId]?.[currentQIndex] === optionText
        const isStudy = mode === "study" || mode === "practice"
        const correct = currentQuestion?.correctOption === optionText

        // Only show Green/Red if IsEvaluating (i.e., Checked) OR manually toggled Explanation
        if (isStudy && (isEvaluating || studyShowAnswer)) {
            if (correct) return { borderColor: "#4CAF50", backgroundColor: "rgba(76, 175, 80, 0.1)" }
            if (selected && !correct) return { borderColor: "#F44336", backgroundColor: "rgba(244, 67, 54, 0.1)" }
        }

        return {
            borderColor: selected ? theme.primary : theme.border,
            backgroundColor: selected ? "rgba(255, 193, 7, 0.05)" : "transparent",
        }
    }

    const renderCircularProgress = (value, total, label, color) => (
        <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.textSecondary }}>{label}</Text>
            <Text style={{ color: theme.text, fontWeight: "bold", fontSize: 16 }}>{value}</Text>
        </View>
    )

    if (isLoading) return <ActivityIndicator size="large" style={{ flex: 1 }} color={theme.primary} />
    if (!currentQuestion)
        return (
            <View style={styles.container}>
                <Text>No Questions</Text>
            </View>
        )

    const mainImageUrl = currentQuestion.questionImage?.url
    const explanationImageUrl = currentQuestion.explanationImage?.url

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={[styles.topBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.timerContainer}>
                    {mode === "exam" && (
                        <View style={styles.timerChip}>
                            <Ionicons name="time-outline" size={16} color={theme.primary} />
                            <Text style={[styles.timerText, { color: theme.primary }]}>{formatTime(timeLeft)}</Text>
                        </View>
                    )}
                    <Text style={[styles.modeBadge, { color: theme.textSecondary }]}>{mode.toUpperCase()}</Text>
                </View>

                <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.tabsContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {activeSubjects.map((sub, index) => (
                        <TouchableOpacity
                            key={sub._id}
                            style={[
                                styles.tab,
                                currentSubjectIndex === index && { borderBottomWidth: 2, borderColor: theme.primary },
                            ]}
                            onPress={() => setCurrentSubjectIndex(index)}
                        >
                            <Text style={{ color: currentSubjectIndex === index ? theme.primary : theme.text }}>{sub.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.questionHeader}>
                    <Text style={[styles.questionNumber, { color: theme.primary }]}>Question {currentQIndex + 1}</Text>
                    <Text style={[styles.subjectIndicator, { color: theme.textSecondary }]}>
                        {currentSubjectObj?.name} • {currentSubjectObj?.year}
                    </Text>
                </View>

                <Text style={[styles.questionText, { color: theme.text }]}>{currentQuestion.question}</Text>

                {mainImageUrl && <Image source={{ uri: mainImageUrl }} style={styles.questionImage} resizeMode="contain" />}

                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.optionButton, getOptionStyle(opt.text)]}
                            onPress={() => handleOptionSelect(opt.text)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.optionLabel,
                                    {
                                        backgroundColor:
                                            userAnswers[currentSubjectId]?.[currentQIndex] === opt.text ? theme.primary : theme.border,
                                    },
                                ]}
                            >
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>{String.fromCharCode(65 + idx)}</Text>
                            </View>

                            <View style={{ flex: 1 }}>
                                {opt.text && <Text style={[styles.optionText, { color: theme.text }]}>{opt.text}</Text>}
                                {opt.image && opt.image.url && (
                                    <Image source={{ uri: opt.image.url }} style={styles.optionImage} resizeMode="contain" />
                                )}
                            </View>

                            {mode === "study" && (isEvaluating || studyShowAnswer) && currentQuestion.correctOption === opt.text && (
                                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                            )}
                            {mode === "study" &&
                                (isEvaluating || studyShowAnswer) &&
                                userAnswers[currentSubjectId]?.[currentQIndex] === opt.text &&
                                currentQuestion.correctOption !== opt.text && (
                                    <Ionicons name="close-circle" size={24} color="#F44336" />
                                )}
                        </TouchableOpacity>
                    ))}
                </View>

                {mode === "study" && (
                    <TouchableOpacity
                        style={[styles.explanationToggle, { borderColor: theme.primary, backgroundColor: studyShowAnswer ? theme.primary : 'transparent' }]}
                        onPress={() => {
                            console.log("Toggling explanation. Current:", studyShowAnswer);
                            setStudyShowAnswer(!studyShowAnswer);
                        }}
                    >
                        <Text style={{ color: studyShowAnswer ? '#fff' : theme.primary, fontWeight: "bold" }}>
                            {studyShowAnswer ? "Hide Answer & Explanation" : "Show Answer & Explanation"}
                        </Text>
                    </TouchableOpacity>
                )}

                {(studyShowAnswer || (mode === "practice" && showExplanation)) && (
                    <View style={[styles.explanationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.explanationHeader}>
                            <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
                            <Text style={[styles.explanationTitle, { color: theme.text }]}>Explanation</Text>
                        </View>
                        <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
                            {currentQuestion.explanation || "No detailed explanation provided."}
                        </Text>
                        {explanationImageUrl && (
                            <Image source={{ uri: explanationImageUrl }} style={styles.explanationImage} resizeMode="contain" />
                        )}
                    </View>
                )}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <TouchableOpacity onPress={handlePrev} disabled={currentQIndex === 0}>
                    <Text style={{ color: theme.text }}>Prev</Text>
                </TouchableOpacity>
                <Text style={{ color: theme.text }}>
                    {currentQIndex + 1}/{currentQuestions.length}
                </Text>
                <TouchableOpacity onPress={handleNext}>
                    <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                        {(mode === 'study' || mode === 'practice') ? (isEvaluating ? "Next" : "Check") : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal visible={resultModalVisible} transparent={true}>
                <View style={[styles.container, { backgroundColor: theme.background, padding: 20, justifyContent: "center", alignItems: 'center' }]}>
                    <Ionicons name="trophy" size={80} color="#FFD700" />
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text, marginTop: 20 }}>Quiz Completed!</Text>

                    <View style={{ marginVertical: 30, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: theme.textSecondary }}>Your Score</Text>
                        <Text style={{ fontSize: 48, fontWeight: 'bold', color: theme.primary }}>{finalScore}%</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.primary, paddingHorizontal: 40, paddingVertical: 15 }]}
                        onPress={() => {
                            setResultModalVisible(false)
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'MainTabs' }],
                            })
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 18, fontWeight: 'bold' }}>Return Home</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingBottom: 12,
        paddingTop: 10,
        alignItems: "center",
        borderBottomWidth: 1,
    },
    backButton: { padding: 4 },
    timerContainer: { alignItems: "center" },
    timerChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 2,
    },
    timerText: { fontSize: 14, fontWeight: "bold", marginLeft: 4 },
    modeBadge: { fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
    submitButton: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
    submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

    tabsContainer: { height: 45, borderBottomWidth: 1 },
    tab: { paddingHorizontal: 16, justifyContent: "center", height: "100%" },

    content: { flex: 1 },
    questionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    questionNumber: { fontSize: 14, fontWeight: "bold" },
    subjectIndicator: { fontSize: 12 },
    questionText: { fontSize: 18, fontWeight: "600", paddingHorizontal: 20, lineHeight: 26, marginBottom: 20 },
    questionImage: { width: "90%", height: 180, alignSelf: "center", marginBottom: 20, borderRadius: 8 },

    optionsContainer: { paddingHorizontal: 20 },
    optionButton: {
        flexDirection: "row",
        padding: 12,
        borderWidth: 1.5,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: "center",
    },
    optionLabel: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    optionText: { fontSize: 16, flex: 1 },
    optionImage: { width: "100%", height: 100, marginTop: 5, borderRadius: 4 },

    explanationToggle: { margin: 20, padding: 12, borderWidth: 1, borderRadius: 10, alignItems: "center" },
    explanationCard: { margin: 20, padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 0 },
    explanationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    explanationTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
    explanationText: { fontSize: 14, lineHeight: 22 },
    explanationImage: { width: "100%", height: 150, marginTop: 12, borderRadius: 8 },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
        borderTopWidth: 1,
        paddingBottom: 25,
    },
    metricCard: { padding: 20, borderRadius: 16, alignItems: "center", width: "45%", elevation: 3 },
})

export default QuizScreen
