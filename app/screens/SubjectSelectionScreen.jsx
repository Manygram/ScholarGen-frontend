"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    FlatList,
    Alert,
    Modal,
    ActivityIndicator,
    Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_BASE_URL = "https://api.scholargens.com/api"
// Updated to include 2026
const YEARS = Array.from({ length: 2026 - 1994 + 1 }, (_, i) => (2026 - i).toString())

const SubjectSelectionScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()
    const { categoryTitle } = route.params

    const [dbSubjects, setDbSubjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSubjects, setSelectedSubjects] = useState([])
    const [subjectYears, setSubjectYears] = useState({})

    const [yearModalVisible, setYearModalVisible] = useState(false)
    const [currentSubjectForYear, setCurrentSubjectForYear] = useState(null)

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken")

                if (!token) {
                    setLoading(false)
                    return
                }

                const response = await axios.get(`${API_BASE_URL}/subjects`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                let subjects = response.data || []

                subjects = subjects.map((sub) => {
                    const subName = (sub.name || "").toLowerCase()
                    if (subName.includes("physics")) {
                        return { ...sub, _id: "695780098f1e7a1a3a935f07", name: "Physics" }
                    }
                    if (subName.includes("use of english") || subName === "english") {
                        return { ...sub, name: "English" }
                    }
                    return sub
                })

                setDbSubjects(subjects)

                const englishObj = subjects.find((s) => (s.name || "").toLowerCase().includes("english"))
                if (englishObj && englishObj._id) {
                    setSelectedSubjects([{ _id: englishObj._id.toString(), name: englishObj.name }])
                    setSubjectYears({ [englishObj._id.toString()]: "2023" })
                }
            } catch (error) {
                console.log("Error fetching subjects:", error)
                Alert.alert("Error", "Could not load subjects.")
            } finally {
                setLoading(false)
            }
        }
        fetchSubjects()
    }, [])

    const toggleSubject = (subject) => {
        const subId = (subject._id || "").toString()

        if (!subId) return

        if (subject.name.toLowerCase().includes("english")) {
            Alert.alert("Compulsory", "English is compulsory.")
            return
        }

        const isSelected = selectedSubjects.some((s) => s._id === subId)

        if (isSelected) {
            setSelectedSubjects((prev) => prev.filter((s) => s._id !== subId))
            setSubjectYears((prev) => {
                const newState = { ...prev }
                delete newState[subId]
                return newState
            })
        } else {
            if (selectedSubjects.length >= 4) {
                Alert.alert("Limit Reached", "Max 4 subjects allowed.")
            } else {
                const newSub = { _id: subId, name: subject.name }
                setSelectedSubjects((prev) => [...prev, newSub])
                setSubjectYears((prev) => ({
                    ...prev,
                    [subId]: "2023",
                }))
            }
        }
    }

    const openYearModal = (subject) => {
        const isSelected = selectedSubjects.some((s) => s._id === subject._id)
        if (!isSelected) {
            // For consistency with StudyScreen, though in toggle logic we auto-select year. 
            // But if user clicks dropdown on unselected (unlikely with this UI flow but safe to have)
            return
        }
        setCurrentSubjectForYear(subject)
        setYearModalVisible(true)
    }

    const selectYear = (year) => {
        if (currentSubjectForYear && currentSubjectForYear._id) {
            const subId = currentSubjectForYear._id.toString()
            setSubjectYears((prev) => ({
                ...prev,
                [subId]: year,
            }))
        }
        setYearModalVisible(false)
        setCurrentSubjectForYear(null)
    }

    const handleProceed = () => {
        if (selectedSubjects.length < 4) {
            Alert.alert("Incomplete", "Select 4 subjects to proceed.")
            return
        }
        navigation.navigate("ExamConfig", {
            selectedSubjects: selectedSubjects,
            subjectYears: subjectYears,
        })
    }

    const renderItem = ({ item }) => {
        const isSelected = selectedSubjects.some((s) => s._id === item._id)
        const selectedYear = subjectYears[item._id]

        return (
            <View
                style={[
                    styles.itemContainer,
                    { backgroundColor: theme.card, borderColor: isSelected ? theme.primary : theme.border },
                ]}
            >
                <TouchableOpacity style={styles.subjectRow} onPress={() => toggleSubject(item)}>
                    <View
                        style={[
                            styles.checkbox,
                            {
                                borderColor: isSelected ? theme.primary : theme.textSecondary,
                                backgroundColor: isSelected ? theme.primary : "transparent",
                            },
                        ]}
                    >
                        {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                    <Text style={[styles.itemText, { color: theme.text }]}>{item.name}</Text>
                </TouchableOpacity>

                {isSelected && (
                    <TouchableOpacity
                        style={[styles.yearDropdown, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={() => openYearModal(item)}
                    >
                        <Text style={[styles.yearText, { color: selectedYear ? theme.text : theme.textSecondary }]}>
                            {selectedYear || "2023"}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        )
    }

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color={theme.primary} />

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>{categoryTitle}</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={dbSubjects}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
            />

            <View style={[styles.footer, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                    style={[
                        styles.proceedButton,
                        { backgroundColor: selectedSubjects.length === 4 ? theme.primary : theme.disabled || "#ccc" }
                    ]}
                    onPress={handleProceed}
                    disabled={selectedSubjects.length !== 4}
                >
                    <Text style={styles.proceedButtonText}>Proceed</Text>
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={yearModalVisible}
                animationType="slide"
                onRequestClose={() => setYearModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                Select Year for {currentSubjectForYear ? currentSubjectForYear.name : ""}
                            </Text>
                            <TouchableOpacity onPress={() => setYearModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={YEARS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.yearItem, { borderBottomColor: theme.border }]} onPress={() => selectYear(item)}>
                                    <Text style={[styles.yearTextDropdown, { color: theme.text }]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 20,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    listContent: { padding: 20, paddingBottom: 100 },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        justifyContent: "space-between",
        minHeight: 60,
    },
    subjectRow: { flexDirection: "row", alignItems: "center", flex: 1 },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    itemText: { fontSize: 16, fontWeight: "500" },
    yearDropdown: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        marginLeft: 10,
        minWidth: 90,
        justifyContent: "space-between",
    },
    yearText: { fontSize: 12 },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
        position: "absolute", bottom: 0, left: 0, right: 0
    },
    proceedButton: {
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    proceedButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        height: "50%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold" },
    yearItem: { paddingVertical: 16, borderBottomWidth: 1 },
    yearTextDropdown: { fontSize: 16, textAlign: "center" },
})

export default SubjectSelectionScreen
