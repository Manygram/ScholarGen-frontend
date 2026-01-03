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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const API_BASE_URL = "https://scholargenapi.onrender.com/api"
const YEARS = Array.from({ length: 2024 - 1994 + 1 }, (_, i) => (2024 - i).toString())

const SubjectSelectionScreen = ({ navigation, route }) => {
    const { theme } = useTheme()
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
                const response = await axios.get(`${API_BASE_URL}/subjects`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                let subjects = response.data || []

                subjects = subjects.map((sub) => {
                    const subName = (sub.name || "").toLowerCase()
                    // Physics strict ID fix
                    if (subName.includes("physics")) {
                        console.log("Applying Hardcoded ID for Physics:", sub.name)
                        return {
                            ...sub,
                            _id: "695780098f1e7a1a3a935f07",
                            name: "Physics",
                        }
                    }
                    // English consistency
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

        if (!subId) {
            console.error("Subject missing ID during toggle:", subject)
            Alert.alert("Error", `Cannot select ${subject.name} (Missing ID)`)
            return
        }

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
        setCurrentSubjectForYear(subject)
        setYearModalVisible(true)
    }

    const selectYear = (year) => {
        if (currentSubjectForYear && currentSubjectForYear._id) {
            const subId = currentSubjectForYear._id.toString()
            console.log(`Selecting Year: ${year} for Subject ID: ${subId} (${currentSubjectForYear.name})`)

            setSubjectYears((prev) => {
                const updated = {
                    ...prev,
                    [subId]: year,
                }
                console.log("Updated SubjectYears State:", JSON.stringify(updated))
                return updated
            })
        } else {
            console.error("selectYear called but currentSubjectForYear is invalid", currentSubjectForYear)
        }
        setYearModalVisible(false)
        setCurrentSubjectForYear(null)
    }

    const handleProceed = () => {
        if (selectedSubjects.length < 4) {
            Alert.alert("Incomplete", "Select 4 subjects to proceed.")
            return
        }

        console.log("Proceeding with:", JSON.stringify(selectedSubjects, null, 2))

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

                <TouchableOpacity
                    style={[styles.yearDropdown, { backgroundColor: theme.background }]}
                    onPress={() => openYearModal(item)}
                >
                    <Text style={{ color: selectedYear ? theme.text : theme.textSecondary }}>{selectedYear || "2023"}</Text>
                    <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>
        )
    }

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color={theme.primary} />

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" />
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
                    style={[styles.proceedButton, { backgroundColor: selectedSubjects.length === 4 ? theme.primary : "#ccc" }]}
                    onPress={handleProceed}
                    disabled={selectedSubjects.length !== 4}
                >
                    <Text style={styles.proceedButtonText}>Proceed</Text>
                </TouchableOpacity>
            </View>

            <Modal transparent={true} visible={yearModalVisible} onRequestClose={() => setYearModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <FlatList
                            data={YEARS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.yearItem} onPress={() => selectYear(item)}>
                                    <Text style={[styles.yearText, { color: theme.text }]}>{item}</Text>
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
        padding: 20,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderColor: "#eee",
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
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, borderColor: "#eee" },
    proceedButton: { alignItems: "center", paddingVertical: 16, borderRadius: 12 },
    proceedButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 40 },
    modalContent: { borderRadius: 12, padding: 20, maxHeight: "60%" },
    yearItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
    yearText: { fontSize: 16, textAlign: "center" },
})

export default SubjectSelectionScreen
