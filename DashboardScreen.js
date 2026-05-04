import React, { useState, useEffect, useContext } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    FlatList, ActivityIndicator, Alert, TextInput, Dimensions,
    Animated, Modal, RefreshControl, Image
} from 'react-native';
import { 
    FileText, User, Clock, Check, X as CloseIcon, 
    Search, AlertCircle, Calendar, CreditCard, LogOut,
    Zap, Filter, TrendingUp, History, UserPlus, Award, Shield, Settings,
    ChevronRight, Download, Phone, MapPin, Mail, Home, Camera, Layout
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import api, { getImageUrl, BASE_URL } from '../../services/api';

const { width } = Dimensions.get('window');

const translations = {
    en: {
        title: "Officer Command", welcome: "Grama Niladhari Console", logout: "Log Out",
        certTab: "Applications", citizenTab: "Directory", proxyTab: "Register",
        pending: "Pending", total: "Total", regCitizens: "Citizens",
        search: "Search NIC or Name...", approve: "Approve", reject: "Reject",
        confirmStatus: "Change application status to {status}?", confirmLogout: "Confirm Logout?",
        cancel: "Cancel", success: "Application {status}", errorUpdate: "Update failed",
        stats: "Overview", approvalRate: "Approval Rate", collected: "Revenue",
        timestamp: "Time", relationship: "Relation", village: "Village", city: "Town",
        occupation: "Job", emergency: "Contact", regSuccess: "Citizen Registered",
        all: "All", bulkApprove: "Bulk Verify", generateReport: "Export All Data", pendingReport: "Pending Applications Report",
        rejectReason: "Rejection Reason", mostPopular: "Top Service", mobileNumber: "Mobile",
        fullName: "Full Name", nic: "NIC Number", password: "Password", address: "Address",
        household: "Household No", gender: "Gender", dob: "Date of Birth",
        auditTab: "Audit Log"
    },
    si: {
        title: "නිලධාරී පර්යන්තය", welcome: "ග්‍රාම නිලධාරී පුවරුව", logout: "නික්ම යන්න",
        certTab: "අයදුම්පත්", citizenTab: "පුරවැසියන්", proxyTab: "ලියාපදිංචිය",
        pending: "විමර්ශනය වෙමින්", total: "මුළු ගණන", regCitizens: "පුරවැසියන්",
        search: "නම හෝ හැඳුනුම්පතෙන් සොයන්න...", approve: "අනුමත කරන්න", reject: "ප්‍රතික්ෂේප කරන්න",
        confirmStatus: "අයදුම්පත {status} කිරීමට ඔබට විශ්වාසද?", confirmLogout: "ඔබට නික්ම යාමට අවශ්‍යද?",
        cancel: "අවලංගු කරන්න", success: "අයදුම්පත {status}", errorUpdate: "යාවත්කාලීන කිරීම අසාර්ථකයි",
        stats: "සාරාංශය", approvalRate: "අනුමත අනුපාතය", collected: "ආදායම",
        timestamp: "වේලාව", relationship: "සම්බන්ධතාවය", village: "ගම", city: "නගරය",
        occupation: "රැකියාව", emergency: "ඇමතුම්", regSuccess: "ලියාපදිංචිය සාර්ථකයි",
        all: "සියල්ල", bulkApprove: "තොග අනුමැතිය", generateReport: "සම්පූර්ණ වාර්තාව", pendingReport: "ප්‍රමාදිත වාර්තාව",
        rejectReason: "ප්‍රතික්ෂේප කිරීමට හේතුව", mostPopular: "වැඩිම ඉල්ලුම", mobileNumber: "දුරකථන",
        fullName: "සම්පූර්ණ නම", nic: "NIC අංකය", password: "මුරපදය", address: "ලිපිනය",
        household: "ගෘහ අංකය", gender: "ස්ත්‍රී/පුරුෂ", dob: "උපන් දිනය",
        auditTab: "සිදුවීම් ලොගය"
    },
    ta: {
        title: "அதிகாரி கட்டளை", welcome: "கிராம நிலதாரி பணியகம்", logout: "வெளியேறு",
        certTab: "விண்ணப்பங்கள்", citizenTab: "அடைவு", proxyTab: "பதிவு",
        pending: "நிலுவையில்", total: "மொத்தம்", regCitizens: "குடிமக்கள்",
        search: "தேடல்...", approve: "அங்கீகரிக்க", reject: "நிராகரி",
        confirmStatus: "விண்ணப்ப நிலையை மாற்றவா?", confirmLogout: "வெளியேறுவதை உறுதிப்படுத்தவும்?",
        cancel: "ரத்து செய்", success: "விண்ணப்பம் {status}", errorUpdate: "புதுப்பிப்பு தோல்வியடைந்தது",
        stats: "கண்ணோட்டம்", approvalRate: "அங்கீகார விகிதம்", collected: "வருவாய்",
        timestamp: "நேரம்", relationship: "உறவு", village: "கிராமம்", city: "நகரம்",
        occupation: "வேலை", emergency: "தொடர்பு", regSuccess: "பதிவு செய்யப்பட்டது",
        all: "அனைத்தும்", bulkApprove: "மொத்த சரிபார்ப்பு", generateReport: "அனைத்து தரவுகளையும் ஏற்றுமதி செய்", pendingReport: "நிலுவையில் உள்ள அறிக்கை",
        rejectReason: "நிராகரிப்புக்கான காரணம்", mostPopular: "சிறந்த சேவை", mobileNumber: "மொபைல்",
        fullName: "முழு பெயர்", nic: "NIC எண்", password: "கடவுச்சொல்", address: "முகவரி",
        household: "வீட்டு எண்", gender: "பாலினம்", dob: "பிறந்த தேதி",
        auditTab: "தணிக்கை பதிவு"
    }
};

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('certificates');
    const [applications, setApplications] = useState([]);
    const [citizens, setCitizens] = useState([]);
    const [stats, setStats] = useState({
        totalThisWeek: 0,
        approvalRate: 0,
        totalCollected: 0,
        mostPopular: 'N/A'
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lang, setLang] = useState('en');
    const t = translations[lang] || translations.en;

    const [proxyForm, setProxyForm] = useState({
        fullName: '', nic: '', password: '', relationship: 'Relative',
        gender: 'Male', address: '', householdNo: '',
        mobileNumber: '', dateOfBirth: '', village: '', city: '',
        occupation: '', emergencyContact: '', age: ''
    });

    const [selectedApplications, setSelectedApplications] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('all'); // all, pending, auto, manual
    const [selectedCitizen, setSelectedCitizen] = useState(null);
    const [citizenWelfares, setCitizenWelfares] = useState([]);
    const [showCitizenModal, setShowCitizenModal] = useState(false);

    const [auditLogs, setAuditLogs] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [viewingImage, setViewingImage] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            const t = await AsyncStorage.getItem('token');
            setToken(t);
        };
        getToken();
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log("📡 [DASHBOARD] Fetching data individually...");
            
            try {
                const appRes = await api.get('/certificates/all');
                setApplications(appRes.data);
                calculateStats(appRes.data);
                console.log("✅ [DASHBOARD] Certificates loaded");
            } catch (e) { console.error("❌ [DASHBOARD] Certificates failed:", e.response?.status); }

            try {
                const citRes = await api.get('/auth/citizens');
                setCitizens(citRes.data);
                console.log("✅ [DASHBOARD] Citizens loaded");
            } catch (e) { console.error("❌ [DASHBOARD] Citizens failed:", e.response?.status); }

            try {
                const auditRes = await api.get('/audit/all');
                setAuditLogs(auditRes.data);
                console.log("✅ [DASHBOARD] Audit logs loaded");
            } catch (e) { console.error("❌ [DASHBOARD] Audit logs failed:", e.response?.status); }

        } catch (err) {
            console.error("❌ Dashboard Fetch Error:", err);
            if (err.response) {
                console.error("Error Response Status:", err.response.status);
                console.error("Error Response Data:", err.response.data);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDownloadDocument = async (url) => {
        if (!url) return Alert.alert("Error", "Invalid document URL.");
        try {
            setLoading(true);
            let activeToken = token;
            if (!activeToken) {
                activeToken = await AsyncStorage.getItem('token');
                if (!activeToken) return Alert.alert("Error", "Please log in again.");
                setToken(activeToken);
            }
            
            // Ensure URL is absolute and include token as query param for backend authorization
            let downloadUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
            
            // Add token as query parameter for extra reliability (backend supports both)
            const separator = downloadUrl.includes('?') ? '&' : '?';
            downloadUrl = `${downloadUrl}${separator}token=${activeToken}`;
            
            const filename = downloadUrl.split('/').pop().split('?')[0];
            const fileUri = FileSystem.documentDirectory + filename;
            
            console.log("Downloading from:", downloadUrl);
            
            let downloadRes = await FileSystem.downloadAsync(downloadUrl, fileUri, {
                headers: {
                    'Authorization': `Bearer ${activeToken}`
                }
            });
            
            // Smart Fallback: If 404, try with /api prefix
            if (downloadRes.status === 404 && !downloadUrl.includes('/api/')) {
                const baseUrlTrimmed = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
                const fallbackUrl = downloadUrl.replace(baseUrlTrimmed, `${baseUrlTrimmed}/api`);
                console.log("Retrying with API fallback:", fallbackUrl);
                
                downloadRes = await FileSystem.downloadAsync(fallbackUrl, fileUri, {
                    headers: {
                        'Authorization': `Bearer ${activeToken}`
                    }
                });
            }
            
            if (downloadRes.status === 200) {
                // If it's an image or PDF, we can share/open it
                await Sharing.shareAsync(downloadRes.uri);
            } else {
                console.error("Download failed with status:", downloadRes.status);
                Alert.alert("Error", `Could not download document. (Status: ${downloadRes.status})`);
            }
        } catch (err) {
            console.error("Download error:", err);
            Alert.alert("Error", "Failed to download document: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const confirmRejection = async () => {
        if (!rejectReason.trim()) {
            Alert.alert("Required", "Please provide a reason for rejection.");
            return;
        }
        try {
            await api.put(`/certificates/update/${rejectId}`, { 
                status: 'Rejected', 
                rejectionReason: rejectReason,
                officerName: user.fullName 
            });
            setShowRejectModal(false);
            setRejectReason('');
            fetchData();
        } catch (err) {
            Alert.alert("Error", "Rejection failed");
        }
    };

    const calculateStats = (apps) => {
        const approved = apps.filter(app => app.status === 'Approved').length;
        const rate = apps.length ? (approved / apps.length) * 100 : 0;
        setStats({
            totalThisWeek: apps.filter(app => new Date(app.createdAt) > new Date(Date.now() - 7 * 86400000)).length,
            approvalRate: Math.round(rate),
            totalCollected: approved * 250,
            mostPopular: 'Residency'
        });
    };

    const handleUpdateStatus = async (id, status) => {
        if (status === 'Rejected') {
            setRejectId(id);
            setShowRejectModal(true);
            return;
        }

        try {
            await api.put(`/certificates/update/${id}`, { status, officerName: user.fullName });
            fetchData();
        } catch (err) {
            Alert.alert("Error", "Update failed");
        }
    };

    const handleProxyRegister = async () => {
        // Validation
        const { fullName, nic, password, mobileNumber, address, dateOfBirth } = proxyForm;
        if (!fullName || fullName.length < 3) return Alert.alert("Error", "Valid Full Name is required");
        if (!nic || !(nic.length === 10 || nic.length === 12)) return Alert.alert("Error", "Valid NIC Number is required (10 or 12 characters)");
        if (!password || password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters");
        if (!mobileNumber || mobileNumber.length !== 10) return Alert.alert("Error", "Valid 10-digit Mobile Number is required");
        if (!address) return Alert.alert("Error", "Address is required");
        if (!dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return Alert.alert("Error", "Valid Date of Birth (YYYY-MM-DD) is required");

        try {
            const officerId = user._id || user.id;
            await api.post('/auth/proxy-register', { 
                ...proxyForm, 
                officerId,
                role: 'citizen',
                district: user.district || "Monaragala",
                divisionalSecretariat: user.divisionalSecretariat || "Bibile",
                gnDivision: user.gnDivision || "Kotagama"
            });
            Alert.alert("Success", "Citizen registered successfully!");
            setProxyForm({
                fullName: '', nic: '', password: '', relationship: 'Relative',
                gender: 'Male', address: '', householdNo: '',
                mobileNumber: '', dateOfBirth: '', village: '', city: '',
                occupation: '', emergencyContact: '', age: ''
            });
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).join('\n') 
                : (err.response?.data?.msg || "Registration failed");
            Alert.alert("Registration Error", errorMsg);
        }
    };

    const toggleApplicationSelection = (id) => {
        setSelectedApplications(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkApprove = async () => {
        if (selectedApplications.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(selectedApplications.map(id => 
                api.put(`/certificates/update/${id}`, { status: 'Approved', officerName: user.fullName })
            ));
            Alert.alert("Success", `${selectedApplications.length} applications approved.`);
            setSelectedApplications([]);
            fetchData();
        } catch (err) {
            Alert.alert("Error", "Bulk approval failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadAdvancedReport = async () => {
        try {
            setLoading(true);
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 3px solid #800000; padding-bottom: 20px; margin-bottom: 30px; }
                        .title { color: #800000; font-size: 28px; font-weight: bold; margin: 0; }
                        .meta { color: #64748b; font-size: 14px; margin-top: 5px; }
                        .summary-grid { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 15px; }
                        .summary-box { flex: 1; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
                        .summary-val { font-size: 20px; font-weight: bold; color: #1e293b; }
                        .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
                        table { width: 100%; border-collapse: collapse; }
                        th { background: #800000; color: #fff; padding: 12px; text-align: left; font-size: 12px; }
                        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
                        .status { font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 10px; }
                        .status-Approved { background: #dcfce7; color: #10b981; }
                        .status-Pending { background: #fef3c7; color: #f59e0b; }
                        .status-Rejected { background: #fee2e2; color: #ef4444; }
                        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="title">VillageFlow Government Portal</h1>
                        <p class="meta">Official Administrative Audit Report - ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div class="summary-grid">
                        <div class="summary-box"><div class="summary-val">${applications.length}</div><div class="summary-label">Total Applications</div></div>
                        <div class="summary-box"><div class="summary-val">${applications.filter(a => a.status === 'Approved').length}</div><div class="summary-label">Approved</div></div>
                        <div class="summary-box"><div class="summary-val">${applications.filter(a => a.status === 'Pending').length}</div><div class="summary-label">Pending</div></div>
                        <div class="summary-box"><div class="summary-val">Rs. ${stats.totalCollected}</div><div class="summary-label">Total Revenue</div></div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Ref ID</th>
                                <th>Citizen Name</th>
                                <th>NIC</th>
                                <th>Type</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${applications.map(a => `
                                <tr>
                                    <td>${a._id.substring(0, 8)}</td>
                                    <td>${a.userId?.fullName || 'N/A'}</td>
                                    <td>${a.nic}</td>
                                    <td>${a.certificateType}</td>
                                    <td>${new Date(a.createdAt).toLocaleDateString()}</td>
                                    <td><span class="status status-${a.status}">${a.status.toUpperCase()}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <p>This is a computer-generated report. Authorized access only.</p>
                        <p>© ${new Date().getFullYear()} VillageFlow GN Division System</p>
                    </div>
                </body>
                </html>
            `;
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (err) {
            Alert.alert("Error", "Audit report generation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExportPendingReport = async () => {
        try {
            setLoading(true);
            const pendingApps = applications.filter(a => a.status === 'Pending');
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { color: #800000; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                        th { backgroundColor: #fff1f1; color: #800000; font-size: 12px; text-transform: uppercase; }
                        .status { font-weight: bold; color: #f59e0b; }
                    </style>
                </head>
                <body>
                    <h1>VillageFlow Pending Requests Report</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    <p>Total Pending: ${pendingApps.length}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Citizen Name</th>
                                <th>NIC</th>
                                <th>Certificate Type</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pendingApps.map(a => `
                                <tr>
                                    <td>${a.userId?.fullName || 'N/A'}</td>
                                    <td>${a.nic}</td>
                                    <td>${a.certificateType}</td>
                                    <td>${new Date(a.createdAt).toLocaleDateString()}</td>
                                    <td class="status">PENDING</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (err) {
            Alert.alert("Error", "Could not generate report");
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = async () => {
        try {
            setLoading(true);
            // Export all applications instead of just pending
            const allApps = applications;
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { color: #800000; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                        th { backgroundColor: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; }
                        .status { font-weight: bold; }
                        .status-Pending { color: #f59e0b; }
                        .status-Approved { color: #10b981; }
                        .status-Rejected { color: #ef4444; }
                    </style>
                </head>
                <body>
                    <h1>VillageFlow All Applications Report</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    <p>Total Applications: ${allApps.length}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Citizen Name</th>
                                <th>NIC</th>
                                <th>Certificate Type</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allApps.map(a => `
                                <tr>
                                    <td>${a.userId?.fullName || 'N/A'}</td>
                                    <td>${a.nic}</td>
                                    <td>${a.certificateType}</td>
                                    <td>${new Date(a.createdAt).toLocaleDateString()}</td>
                                    <td class="status status-${a.status}">${a.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (err) {
            Alert.alert("Error", "Could not generate report");
        } finally {
            setLoading(false);
        }
    };

    const renderStatCard = (title, value, icon, color) => (
        <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>{icon}</View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{title}</Text>
            </View>
        </View>
    );

    const renderApplication = ({ item }) => {
        const isSelected = selectedApplications.includes(item._id);
        const statusColor = item.status === 'Approved' ? '#10b981' : item.status === 'Rejected' ? '#ef4444' : '#f59e0b';
        return (
            <TouchableOpacity 
                style={[styles.card, isSelected && styles.selectedCard]} 
                onPress={() => item.status === 'Pending' && toggleApplicationSelection(item._id)}
                longPress={() => Alert.alert("Details", `NIC: ${item.nic}\nType: ${item.certificateType}\nDate: ${new Date(item.createdAt).toLocaleString()}`)}
            >
                <View style={styles.cardHeader}>
                    {item.status === 'Pending' && (
                        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                            {isSelected && <Check size={10} color="#fff" />}
                        </View>
                    )}
                    <View style={styles.avatar}><Text style={styles.avatarText}>{item.userId?.fullName?.charAt(0) || 'U'}</Text></View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.cardTitle}>{item.userId?.fullName || 'Citizen'}</Text>
                        <Text style={styles.cardSub}>{item.certificateType}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                </View>
                {item.status === 'Pending' && !isSelected && (
                    <View style={styles.actionRow}>
                        {item.utilityBill && (
                            <TouchableOpacity 
                                style={[styles.actionBtn, { backgroundColor: '#3b82f6', marginRight: 4 }]} 
                                onPress={() => setViewingImage(getImageUrl(item.utilityBill))}
                            >
                                <FileText size={14} color="#fff" />
                                <Text style={styles.btnTextWhite}>Bill</Text>
                            </TouchableOpacity>
                        )}
                        {item.nicImage && (
                            <TouchableOpacity 
                                style={[styles.actionBtn, { backgroundColor: '#10b981', marginRight: 4 }]} 
                                onPress={() => setViewingImage(getImageUrl(item.nicImage))}
                            >
                                <Camera size={14} color="#fff" />
                                <Text style={styles.btnTextWhite}>NIC</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.actionBtn, styles.btnApprove]} onPress={() => handleUpdateStatus(item._id, 'Approved')}>
                            <Check size={16} color="#fff" />
                            <Text style={styles.btnTextWhite}>{t.approve}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.btnReject]} onPress={() => handleUpdateStatus(item._id, 'Rejected')}>
                            <CloseIcon size={16} color="#fff" />
                            <Text style={styles.btnTextWhite}>{t.reject}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderCitizen = ({ item }) => (
        <TouchableOpacity 
            style={styles.card} 
            onPress={async () => { 
                setSelectedCitizen(item); 
                setShowCitizenModal(true); 
                try {
                    const res = await api.get(`/welfare/user-applications/${item._id || item.id}`);
                    setCitizenWelfares(res.data);
                } catch (e) {
                    setCitizenWelfares([]);
                }
            }}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: '#f1f5f9' }]}><User size={20} color="#64748b" /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>{item.fullName}</Text>
                    <Text style={styles.cardSub}>{item.nic}</Text>
                </View>
                <View style={styles.badgeRow}>
                    <View style={[styles.miniBadge, { backgroundColor: '#eff6ff' }]}><Text style={{ color: '#2563eb', fontSize: 10, fontWeight: 'bold' }}>{item.householdNo}</Text></View>
                    <TouchableOpacity onPress={() => Alert.alert("Contact", `Phone: ${item.mobileNumber || 'N/A'}`)}>
                        <Phone size={18} color="#800000" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}><MapPin size={12} color="#64748b" /><Text style={styles.detailText}>{item.village || 'N/A'}</Text></View>
                <View style={styles.detailItem}><Layout size={12} color="#64748b" /><Text style={styles.detailText}>{item.occupation || 'N/A'}</Text></View>
            </View>
        </TouchableOpacity>
    );

    const CitizenDetailsModal = () => (
        <Modal visible={showCitizenModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Citizen Profile</Text>
                        <TouchableOpacity onPress={() => setShowCitizenModal(false)}><CloseIcon size={24} color="#1e293b" /></TouchableOpacity>
                    </View>
                    {selectedCitizen && (
                        <ScrollView style={{ padding: 20 }}>
                            <View style={styles.profileHeader}>
                                <View style={styles.largeAvatar}><Text style={styles.largeAvatarText}>{selectedCitizen.fullName.charAt(0)}</Text></View>
                                <Text style={styles.profileName}>{selectedCitizen.fullName}</Text>
                                <Text style={styles.profileNic}>{selectedCitizen.nic}</Text>
                            </View>
                            
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>Basic Information</Text>
                                <View style={styles.infoBox}>
                                    <InfoItem label="Household" value={selectedCitizen.householdNo} />
                                    <InfoItem label="Gender" value={selectedCitizen.gender} />
                                    <InfoItem label="DOB" value={selectedCitizen.dateOfBirth} />
                                    <InfoItem label="Village" value={selectedCitizen.village} />
                                    <InfoItem label="Occupation" value={selectedCitizen.occupation} />
                                    <InfoItem label="Emergency" value={selectedCitizen.emergencyContact} />
                                </View>
                            </View>

                            {citizenWelfares.length > 0 && (
                                <View style={styles.infoSection}>
                                    <Text style={styles.sectionTitle}>Welfare Applications</Text>
                                    {citizenWelfares.map(w => (
                                        <View key={w._id} style={[styles.infoBox, {marginBottom: 10}]}>
                                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                <Text style={{fontWeight: 'bold', color: '#800000'}}>{w.type}</Text>
                                                <Text style={{fontSize: 12, color: w.status === 'Active' ? '#10b981' : '#f59e0b'}}>{w.status}</Text>
                                            </View>
                                            <Text style={{fontSize: 12, color: '#64748b', marginTop: 5}}>Income: Rs. {w.income}</Text>
                                            {w.paySlip && (
                                                <TouchableOpacity 
                                                    style={{marginTop: 10, backgroundColor: '#3b82f6', padding: 8, borderRadius: 6, alignItems: 'center'}}
                                                    onPress={() => setViewingImage(getImageUrl(w.paySlip))}
                                                >
                                                    <Text style={{color: '#fff', fontSize: 11, fontWeight: 'bold'}}>View Income Proof</Text>
                                                </TouchableOpacity>
                                            )}
                                            {w.nicImage && (
                                                <TouchableOpacity 
                                                    style={{marginTop: 5, backgroundColor: '#10b981', padding: 8, borderRadius: 6, alignItems: 'center'}}
                                                    onPress={() => setViewingImage(getImageUrl(w.nicImage))}
                                                >
                                                    <Text style={{color: '#fff', fontSize: 11, fontWeight: 'bold'}}>View NIC Image</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity style={styles.btnPrimary} onPress={() => setShowCitizenModal(false)}>
                                <Text style={styles.btnTextWhite}>Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );

    const InfoItem = ({ label, value }) => (
        <View style={styles.profileInfoItem}>
            <Text style={styles.infoLabel}>{label}:</Text>
            <Text style={styles.infoVal}>{value || 'N/A'}</Text>
        </View>
    );

    if (loading && !refreshing) return <View style={styles.center}><ActivityIndicator size="large" color="#800000" /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.topHeader}>
                <View style={styles.headerTopRow}>
                    <View style={styles.langSwitch}>
                        {['en', 'si', 'ta'].map(l => (
                            <TouchableOpacity key={l} onPress={() => setLang(l)} style={[styles.langBtn, lang === l && styles.activeLangBtn]}>
                                <Text style={[styles.langText, lang === l && styles.activeLangText]}>{l.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtnSmall}><LogOut size={16} color="#fff" /><Text style={styles.logoutBtnText}>{t.logout}</Text></TouchableOpacity>
                </View>

                <View style={styles.headerMainRow}>
                    <View style={{flex: 1}}>
                        <Text style={styles.welcome}>{t.welcome}</Text>
                        <Text style={styles.userName} numberOfLines={1}>{user?.fullName}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => navigation.navigate('VerifyProfile')} style={styles.headerBtn}><Camera size={20} color="#fff" /></TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('SystemConfig')} style={styles.headerBtn}><Settings size={20} color="#fff" /></TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
                    <TouchableOpacity style={[styles.tab, activeTab === 'certificates' && styles.activeTab]} onPress={() => setActiveTab('certificates')}>
                        <FileText size={18} color={activeTab === 'certificates' ? '#720000' : '#64748b'} />
                        <Text style={[styles.tabText, activeTab === 'certificates' && styles.activeTabText]}>{t.certTab}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'citizens' && styles.activeTab]} onPress={() => setActiveTab('citizens')}>
                        <User size={18} color={activeTab === 'citizens' ? '#720000' : '#64748b'} />
                        <Text style={[styles.tabText, activeTab === 'citizens' && styles.activeTabText]}>{t.citizenTab}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'proxy' && styles.activeTab]} onPress={() => setActiveTab('proxy')}>
                        <UserPlus size={18} color={activeTab === 'proxy' ? '#720000' : '#64748b'} />
                        <Text style={[styles.tabText, activeTab === 'proxy' && styles.activeTabText]}>{t.proxyTab}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'audit' && styles.activeTab]} onPress={() => setActiveTab('audit')}>
                        <History size={18} color={activeTab === 'audit' ? '#720000' : '#64748b'} />
                        <Text style={[styles.tabText, activeTab === 'audit' && styles.activeTabText]}>{t.auditTab}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
                {activeTab === 'certificates' && (
                    <>
                        <View style={styles.statsGrid}>
                            {renderStatCard(t.pending, applications.filter(a => a.status === 'Pending').length, <Clock size={20} color="#f59e0b" />, "#f59e0b")}
                            {renderStatCard(t.approvalRate, `${stats.approvalRate}%`, <TrendingUp size={20} color="#10b981" />, "#10b981")}
                            {renderStatCard(t.total, applications.length, <FileText size={20} color="#3b82f6" />, "#3b82f6")}
                            {renderStatCard(t.collected, `Rs.${stats.totalCollected}`, <CreditCard size={20} color="#800000" />, "#800000")}
                        </View>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.exportBtn, {flex: 1, marginBottom: 0}]} onPress={handleDownloadAdvancedReport}>
                                <Download size={16} color="#800000" />
                                <Text style={[styles.exportBtnText, {fontSize: 12}]}>Advanced Audit Report</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.exportBtn, {flex: 1, marginBottom: 0, backgroundColor: '#fff1f1', borderColor: '#800000'}]} onPress={handleExportPendingReport}>
                                <Clock size={16} color="#800000" />
                                <Text style={[styles.exportBtnText, {fontSize: 12}]}>{t.pendingReport}</Text>
                            </TouchableOpacity>
                        </View>
                        {selectedApplications.length > 0 && (
                            <View style={styles.bulkPanel}>
                                <Text style={styles.bulkText}>{selectedApplications.length} selected</Text>
                                <TouchableOpacity style={styles.bulkApproveBtn} onPress={handleBulkApprove}>
                                    <Check size={16} color="#fff" />
                                    <Text style={styles.btnTextWhite}>Bulk Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.bulkCancelBtn} onPress={() => setSelectedApplications([])}>
                                    <Text style={styles.btnTextDark}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={styles.searchBox}>
                            <Search size={20} color="#94a3b8" />
                            <TextInput style={styles.searchInput} placeholder={t.search} value={searchTerm} onChangeText={setSearchTerm} />
                        </View>
                        {applications.filter(a => a.nic.includes(searchTerm) || a.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                            <View key={item._id}>{renderApplication({ item })}</View>
                        ))}
                    </>
                )}

                {activeTab === 'citizens' && (
                    <>
                        <View style={styles.searchBox}>
                            <Search size={20} color="#94a3b8" />
                            <TextInput style={styles.searchInput} placeholder={t.search} value={searchTerm} onChangeText={setSearchTerm} />
                        </View>
                        {citizens.filter(c => c.nic.includes(searchTerm) || c.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                            <View key={item._id}>{renderCitizen({ item })}</View>
                        ))}
                    </>
                )}

                {activeTab === 'proxy' && (
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>{t.proxyTab}</Text>
                        <Text style={styles.label}>{t.fullName}</Text>
                        <TextInput style={styles.input} value={proxyForm.fullName} onChangeText={v => setProxyForm({...proxyForm, fullName: v})} />
                        
                        <View style={styles.formRow}>
                            <View style={{flex: 1}}><Text style={styles.label}>{t.nic}</Text><TextInput style={styles.input} value={proxyForm.nic} onChangeText={v => setProxyForm({...proxyForm, nic: v})} /></View>
                            <View style={{width: 10}} />
                            <View style={{flex: 1}}><Text style={styles.label}>{t.gender}</Text><TouchableOpacity style={styles.input} onPress={() => setProxyForm({...proxyForm, gender: proxyForm.gender === 'Male' ? 'Female' : 'Male'})}><Text>{proxyForm.gender}</Text></TouchableOpacity></View>
                        </View>

                        <Text style={styles.label}>{t.password}</Text>
                        <TextInput style={styles.input} value={proxyForm.password} secureTextEntry onChangeText={v => setProxyForm({...proxyForm, password: v})} />

                        <View style={styles.formRow}>
                            <View style={{flex: 1}}><Text style={styles.label}>{t.dob} (YYYY-MM-DD)</Text><TextInput style={styles.input} value={proxyForm.dateOfBirth} placeholder="1990-01-01" onChangeText={v => setProxyForm({...proxyForm, dateOfBirth: v})} /></View>
                        </View>
                        
                        <View style={styles.formRow}>
                            <View style={{flex: 1}}><Text style={styles.label}>{t.mobileNumber}</Text><TextInput style={styles.input} value={proxyForm.mobileNumber} keyboardType="phone-pad" onChangeText={v => setProxyForm({...proxyForm, mobileNumber: v})} /></View>
                            <View style={{width: 10}} />
                            <View style={{flex: 1}}><Text style={styles.label}>{t.household}</Text><TextInput style={styles.input} value={proxyForm.householdNo} onChangeText={v => setProxyForm({...proxyForm, householdNo: v})} /></View>
                        </View>

                        <Text style={styles.label}>{t.address}</Text>
                        <TextInput style={styles.input} value={proxyForm.address} onChangeText={v => setProxyForm({...proxyForm, address: v})} />

                        <View style={styles.formRow}>
                            <View style={{flex: 1}}><Text style={styles.label}>{t.village}</Text><TextInput style={styles.input} value={proxyForm.village} onChangeText={v => setProxyForm({...proxyForm, village: v})} /></View>
                            <View style={{width: 10}} />
                            <View style={{flex: 1}}><Text style={styles.label}>{t.city}</Text><TextInput style={styles.input} value={proxyForm.city} onChangeText={v => setProxyForm({...proxyForm, city: v})} /></View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={{flex: 1}}><Text style={styles.label}>{t.occupation}</Text><TextInput style={styles.input} value={proxyForm.occupation} onChangeText={v => setProxyForm({...proxyForm, occupation: v})} /></View>
                            <View style={{width: 10}} />
                            <View style={{flex: 1}}><Text style={styles.label}>{t.emergency}</Text><TextInput style={styles.input} value={proxyForm.emergencyContact} keyboardType="phone-pad" onChangeText={v => setProxyForm({...proxyForm, emergencyContact: v})} /></View>
                        </View>

                        <TouchableOpacity style={styles.btnPrimary} onPress={handleProxyRegister}><Text style={styles.btnTextWhite}>{t.proxyTab}</Text></TouchableOpacity>
                        <View style={{height: 40}} />
                    </View>
                )}
                {activeTab === 'audit' && (
                    <View style={styles.auditContainer}>
                        <Text style={styles.formTitle}>{t.auditTab}</Text>
                        {auditLogs.length === 0 ? (
                            <View style={styles.empty}><History size={40} color="#cbd5e1" /><Text style={styles.emptyText}>No logs found</Text></View>
                        ) : (
                            auditLogs.map((log, idx) => (
                                <View key={idx} style={styles.auditItem}>
                                    <View style={styles.auditHeader}>
                                        <Text style={styles.auditAction}>{log.action}</Text>
                                        <Text style={styles.auditTime}>{new Date(log.timestamp).toLocaleString()}</Text>
                                    </View>
                                    <Text style={styles.auditUser}>By: {log.userEmail || log.userId?.email || 'System'}</Text>
                                    <Text style={styles.auditDetails}>{JSON.stringify(log.details)}</Text>
                                </View>
                            ))
                        )}
                        <View style={{height: 40}} />
                    </View>
                )}
            </ScrollView>

            <Modal visible={showRejectModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reject Application</Text>
                        <Text style={styles.label}>Reason for Rejection (Required)</Text>
                        <TextInput 
                            style={styles.reasonInput} 
                            placeholder="Please explain why this application is being rejected..." 
                            multiline 
                            numberOfLines={4}
                            value={rejectReason} 
                            onChangeText={setRejectReason} 
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.btnSecondary} onPress={() => { setShowRejectModal(false); setRejectReason(''); }}>
                                <Text style={styles.btnTextDark}>{t.cancel}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnRejectAction} onPress={confirmRejection}>
                                <Text style={styles.btnTextWhite}>Submit Rejection</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <CitizenDetailsModal />

        {/* Image Viewer Modal */}
        <Modal visible={!!viewingImage} transparent animationType="fade">
            <View style={styles.imageViewerOverlay}>
                <TouchableOpacity style={styles.imageViewerClose} onPress={() => setViewingImage(null)}>
                    <CloseIcon size={30} color="#fff" />
                </TouchableOpacity>
                {viewingImage && (
                    <View style={styles.imageContainer}>
                        <Text style={{color: '#fff', marginBottom: 10, fontWeight: 'bold'}}>Evidence Document</Text>
                        <View style={styles.imageFrame}>
                            <View style={{width: '100%', height: '80%', backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
                                {(() => {
                                    const ext = viewingImage.split('.').pop().toLowerCase().split('?')[0];
                                    const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                                    if (isImg) {
                                        return (
                                            <Image 
                                                source={{ 
                                                    uri: `${viewingImage}${viewingImage.includes('?') ? '&' : '?'}token=${token}`,
                                                    headers: { Authorization: `Bearer ${token}` }
                                                }} 
                                                style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
                                            />
                                        );
                                    } else {
                                        return (
                                            <View style={{alignItems: 'center', padding: 20}}>
                                                <FileText size={80} color="#800000" />
                                                <Text style={{textAlign: 'center', marginTop: 20, color: '#1e293b'}}>{viewingImage.split('/').pop()}</Text>
                                            </View>
                                        );
                                    }
                                })()}
                            </View>
                            <TouchableOpacity 
                                style={{marginTop: 20, backgroundColor: '#800000', padding: 15, borderRadius: 10, minWidth: 200, alignItems: 'center'}}
                                onPress={() => handleDownloadDocument(viewingImage)}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{color: '#fff', fontWeight: 'bold'}}>Download / Open Document</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fdfdfd' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    // Header Redesign
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    headerMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerActions: { flexDirection: 'row', gap: 10 },
    welcome: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    userName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 },
    headerBtn: { 
        padding: 12, 
        backgroundColor: 'rgba(255,255,255,0.15)', 
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    logoutBtnSmall: { 
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6, 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    logoutBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    
    // Tab Bar Redesign (Scrollable Segmented Control)
    tabContainer: { 
        marginHorizontal: 20, 
        marginTop: -25,
        zIndex: 10,
    },
    tabBar: { 
        flexDirection: 'row', 
        backgroundColor: '#f1f5f9', 
        borderRadius: 20, 
        padding: 6, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
        minWidth: '100%',
    },
    tab: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8, 
        paddingVertical: 12, 
        paddingHorizontal: 20,
        borderRadius: 16 
    },
    activeTab: { 
        backgroundColor: '#fff', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    tabText: { fontWeight: '700', color: '#64748b', fontSize: 13 },
    activeTabText: { color: '#720000' },

    scrollContent: { padding: 20, paddingTop: 30 },
    
    // Stats Redesign
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: { 
        width: (width - 52) / 2, 
        backgroundColor: '#fff', 
        padding: 18, 
        borderRadius: 24, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 14, 
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2 
    },
    statIconBox: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    statValue: { fontSize: 19, fontWeight: '800', color: '#0f172a' },
    statLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

    // Buttons
    buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    exportBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8, 
        backgroundColor: '#fff', 
        padding: 14, 
        borderRadius: 18, 
        borderWidth: 1.5, 
        borderColor: '#e2e8f0',
        borderStyle: 'dashed'
    },
    exportBtnText: { color: '#720000', fontWeight: '700', fontSize: 13 },

    // Search Bar
    searchBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        paddingHorizontal: 18, 
        borderRadius: 18, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
    },
    searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, fontWeight: '500', color: '#1e293b' },

    // List Cards
    card: { 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3 
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    avatar: { 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        backgroundColor: '#f1f5f9', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    avatarText: { color: '#720000', fontWeight: '800', fontSize: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    cardSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    
    detailsGrid: { 
        flexDirection: 'row', 
        gap: 16, 
        marginTop: 16, 
        paddingTop: 16, 
        borderTopWidth: 1, 
        borderTopColor: '#f8fafc' 
    },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 13, color: '#475569', fontWeight: '500' },

    actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
    actionBtn: { 
        flex: 1, 
        flexDirection: 'row', 
        padding: 14, 
        borderRadius: 14, 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8 
    },
    btnApprove: { backgroundColor: '#059669' },
    btnReject: { backgroundColor: '#dc2626' },
    btnTextWhite: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Form Redesign
    formContainer: { 
        backgroundColor: '#fff', 
        padding: 24, 
        borderRadius: 32, 
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5
    },
    formTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 16 },
    input: { 
        backgroundColor: '#f8fafc', 
        borderWidth: 1, 
        borderColor: '#e2e8f0', 
        borderRadius: 16, 
        padding: 16,
        fontSize: 15,
        color: '#1e293b'
    },
    btnPrimary: { 
        backgroundColor: '#720000', 
        padding: 18, 
        borderRadius: 18, 
        alignItems: 'center', 
        marginTop: 32,
        shadowColor: '#720000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },

    // Audit Log Redesign
    auditItem: { 
        backgroundColor: '#fff', 
        padding: 18, 
        borderRadius: 20, 
        marginBottom: 14, 
        borderLeftWidth: 5, 
        borderLeftColor: '#720000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2
    },
    auditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    auditAction: { fontWeight: '800', color: '#0f172a', fontSize: 15 },
    auditTime: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
    auditUser: { fontSize: 13, color: '#475569', fontWeight: '600', marginBottom: 6 },
    auditDetails: { fontSize: 12, color: '#64748b', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: 8, borderRadius: 8 },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 32, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.2, shadowRadius: 30 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
    
    profileInfoItem: { 
        marginBottom: 18, 
        paddingBottom: 14, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f1f5f9' 
    },
    infoLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    infoVal: { fontSize: 15, color: '#0f172a', fontWeight: '600' },
    
    empty: { alignItems: 'center', padding: 40, gap: 12 },
    emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '600' },
    
    formRow: { flexDirection: 'row', gap: 12 },
    bulkPanel: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#0f172a', 
        padding: 16, 
        borderRadius: 20, 
        marginBottom: 20, 
        elevation: 10, 
        gap: 12 
    },
    bulkText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#fff' },
    bulkApproveBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    bulkCancelBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    langSwitch: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 2 },
    langBtn: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
    activeLangBtn: { backgroundColor: '#fff' },
    langText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    activeLangText: { color: '#720000' },
    topHeader: { 
        backgroundColor: '#720000', 
        padding: 24, 
        paddingTop: 40,
        borderBottomLeftRadius: 32, 
        borderBottomRightRadius: 32, 
        shadowColor: '#720000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 15 
    },
    imageViewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    imageViewerClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    imageContainer: { width: '90%', height: '70%', alignItems: 'center' },
    imageFrame: { width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', padding: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
    reasonInput: { 
        backgroundColor: '#f8fafc', 
        borderWidth: 1, 
        borderColor: '#e2e8f0', 
        borderRadius: 16, 
        padding: 16, 
        fontSize: 15, 
        color: '#1e293b', 
        height: 120, 
        textAlignVertical: 'top', 
        marginBottom: 20 
    },
    modalActions: { flexDirection: 'row', gap: 12 },
    btnSecondary: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#f1f5f9' },
    btnRejectAction: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#dc2626' },
    btnTextDark: { color: '#475569', fontWeight: '700', fontSize: 14 }
});

export default DashboardScreen;
