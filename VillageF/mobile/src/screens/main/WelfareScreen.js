import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Modal, TextInput, Alert, ScrollView, RefreshControl,
  Dimensions, Platform, Image
} from 'react-native';
import { 
  HandHeart, PlusCircle, Edit3, Trash2, ShieldCheck, 
  X as CloseIcon, CheckCircle, AlertCircle, DollarSign, Home, Upload, FileText,
  User, Calendar, Info, Check, ChevronRight, Plus, Search, Filter, Layout,
  Printer, FileDown, Camera
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import api, { getImageUrl, getWelfareDocUrl, BASE_URL } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const WELFARE_TYPES = ['Aswasuma', 'Samurdhi', 'Elderly Allowance'];
const { width } = Dimensions.get('window');

const translations = {
    en: {
        title: "Welfare Services", subTitle: "Social Security & Benefits", 
        apply: "New Application", noData: "No applications found",
        name: "Full Name", nic: "NIC Number", house: "Household Number",
        type: "Welfare Type", income: "Monthly Income (LKR)", amount: "Welfare Amount (LKR)",
        reqAmount: "Requested Amount", save: "Submit Application", update: "Update Application", status: "Status",
        incomeCard: "Income", welfareCard: "Amount", houseCard: "House", typeCard: "Type",
        updateTitle: "Edit Application", addTitle: "Welfare Request",
        deleteConfirm: "Remove this application permanently?", delete: "Delete", cancel: "Cancel",
        approve: "Approve", reject: "Reject", pending: "Pending Approval",
        nicMismatch: "NIC does not match your profile",
        ageError: "You must be at least {minAge} years old for this benefit",
        incomeError: "Income exceeds the Rs. {max} limit for this type",
        successMsg: "Application submitted successfully!",
        fileLabel: "Income Proof (Pay Slip)", search: "Search by Name or NIC...",
        eligibility: "Eligibility Guidelines", ageReq: "Min Age", incomeReq: "Max Income",
        docReq: "Docs Required", docYes: "Pay Slip Needed", docNo: "None"
    },
    si: {
        title: "සුභසාධන සේවා", subTitle: "සමාජ ආරක්ෂණය සහ ප්‍රතිලාභ", 
        apply: "නව අයදුම්පත", noData: "අයදුම්පත් හමු නොවීය",
        name: "සම්පූර්ණ නම", nic: "ජාතික හැඳුනුම්පත් අංකය", house: "ගෘහ අංකය",
        type: "සුභසාධන වර්ගය", income: "මාසික ආදායම (රු.)", amount: "සුභසාධන දීමනාව (රු.)",
        reqAmount: "අවශ්‍ය මුදල", save: "අයදුම්පත ඉදිරිපත් කරන්න", update: "අයදුම්පත යාවත්කාලීන කරන්න", status: "තත්ත්වය",
        incomeCard: "ආදායම", welfareCard: "මුදල", houseCard: "නිවාස", typeCard: "වර්ගය",
        updateTitle: "අයදුම්පත සංස්කරණය", addTitle: "සුභසාධන ඉල්ලීම",
        deleteConfirm: "මෙම අයදුම්පත ස්ථිරවම ඉවත් කරන්නද?", delete: "මකන්න", cancel: "අවලංගු කරන්න",
        approve: "අනුමත කරන්න", reject: "ප්‍රතික්ෂේප කරන්න", pending: "අනුමැතිය සඳහා රැඳී පවතී",
        nicMismatch: "හැඳුනුම්පත ඔබගේ ගිණුම සමඟ නොගැලපේ",
        ageError: "මෙම ප්‍රතිලාභය සඳහා ඔබ අවම වශයෙන් අවුරුදු {minAge} ක් විය යුතුය",
        incomeError: "ආදායම රු. {max} සීමාව ඉක්මවා ඇත",
        successMsg: "අයදුම්පත සාර්ථකව ඉදිරිපත් කරන ලදී!",
        fileLabel: "ආදායම් සාක්ෂි (වැටුප් වාර්තා)", search: "නම හෝ හැඳුනුම්පතෙන් සොයන්න...",
        eligibility: "සුදුසුකම් මාර්ගෝපදේශ", ageReq: "අවම වයස", incomeReq: "උපරිම ආදායම",
        docReq: "ලේඛන අවශ්‍යතාවය", docYes: "වැටුප් වාර්තාව අවශ්‍යයි", docNo: "අවශ්‍ය නැත"
    },
    ta: {
        title: "நலன்புரி சேவைகள்", subTitle: "சமூக பாதுகாப்பு மற்றும் நன்மைகள்", 
        apply: "புதிய விண்ணப்பம்", noData: "விண்ணப்பங்கள் எதுவும் இல்லை",
        name: "முழு பெயர்", nic: "NIC எண்", house: "வீட்டு எண்",
        type: "நலன்புரி வகை", income: "மாத வருமானம் (ரூ.)", amount: "நலன்புரி தொகை (ரூ.)",
        reqAmount: "கோரப்பட்ட தொகை", save: "விண்ணப்பத்தை சமர்ப்பிக்கவும்", update: "விண்ணப்பத்தை புதுப்பிக்கவும்", status: "நிலை",
        incomeCard: "வருமானம்", welfareCard: "தொகை", houseCard: "வீடு", typeCard: "வகை",
        updateTitle: "விண்ணப்பத்தைத் திருத்து", addTitle: "நலன்புரி கோரிக்கை",
        deleteConfirm: "இந்த விண்ணப்பத்தை நிரந்தரமாக அகற்றவா?", delete: "நீக்கு", cancel: "ரத்து செய்",
        approve: "அங்கீகரிக்க", reject: "நிராகரி", pending: "அங்கீகாரத்திற்காக நிலுவையில் உள்ளது",
        nicMismatch: "NIC உங்கள் சுயவிவரத்துடன் பொருந்தவில்லை",
        ageError: "இந்த நன்மைக்கு நீங்கள் குறைந்தது {minAge} வயதுடையவராக இருக்க வேண்டும்",
        incomeError: "வருமானம் ரூ. {max} வரம்பை மீறுகிறது",
        successMsg: "விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
        fileLabel: "வருமான ஆதாரம் (சம்பளச் சீட்டு)", search: "பெயர் அல்லது NIC மூலம் தேடுங்கள்...",
        eligibility: "தகுதிக்கான வழிகாட்டுதல்கள்", ageReq: "குறைந்தபட்ச வயது", incomeReq: "அதிகபட்ச வருமானம்",
        docReq: "தேவையான ஆவணங்கள்", docYes: "சம்பளச் சீட்டு தேவை", docNo: "எதுவுமில்லை"
    }
};

export default function WelfareScreen() {
    const { user } = useContext(AuthContext);
    const isOfficer = user?.role === 'officer';
    
    const [welfares, setWelfares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lang, setLang] = useState('en');
    
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [config, setConfig] = useState(null);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [selectedApplications, setSelectedApplications] = useState([]);

    const t = translations.en;
    
    const [formData, setFormData] = useState({ 
        fullName: user?.fullName || '', 
        nic: user?.nic || '', 
        householdNo: user?.householdNo || '', 
        type: 'Aswasuma', 
        income: '',
        amount: '' 
    });
    const [paySlip, setPaySlip] = useState(null);
    const [nicImage, setNicImage] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            const t = await AsyncStorage.getItem('token');
            setToken(t);
        };
        getToken();
        fetchWelfares();
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/system/public-config');
            setConfig(res.data);
        } catch (err) {
            console.error("Config fetch failed");
        }
    };

    const calculateAge = (nic) => {
        if (!nic) return null;
        let year;
        const normalized = nic.trim().toUpperCase();
        if (normalized.length === 10) {
            year = 1900 + parseInt(normalized.substring(0, 2));
        } else if (normalized.length === 12) {
            year = parseInt(normalized.substring(0, 4));
        } else return null;
        return new Date().getFullYear() - year;
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
                await Sharing.shareAsync(downloadRes.uri);
            } else {
                console.error("Download failed with status:", downloadRes.status);
                Alert.alert("Error", `Could not download document. (Status: ${downloadRes.status})`);
            }
        } catch (err) {
            console.error("Download error:", err);
            Alert.alert("Download Error", err.message || "Failed to download document.");
        } finally {
            setLoading(false);
        }
    };
    const fetchWelfares = async () => {
        try {
            if (isOfficer) {
                const res = await api.get('/welfare/all');
                setWelfares(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } else {
                const res = await api.get(`/welfare/user-applications/${user._id || user.id}`);
                setWelfares(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            }
        } catch (err) {
            console.error("❌ Welfare Fetch Error:", err);
            if (err.response) {
                console.error("Error Response Status:", err.response.status);
                console.error("Error Response Data:", err.response.data);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleBulkApprove = async () => {
        if (selectedApplications.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(selectedApplications.map(id => 
                api.put(`/welfare/update/${id}`, { status: 'Approved' })
            ));
            Alert.alert("Success", `${selectedApplications.length} applications approved.`);
            setSelectedApplications([]);
            fetchWelfares();
        } catch (err) {
            Alert.alert("Error", "Bulk approval failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadWelfareReport = async () => {
        try {
            setLoading(true);
            const filtered = getFilteredWelfares();
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 3px solid #800000; padding-bottom: 20px; margin-bottom: 30px; }
                        .title { color: #800000; font-size: 28px; font-weight: bold; margin: 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #800000; color: #fff; padding: 12px; text-align: left; font-size: 12px; }
                        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
                        .status { font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 10px; }
                        .status-Approved { background: #dcfce7; color: #10b981; }
                        .status-Pending { background: #fef3c7; color: #f59e0b; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="title">Welfare Beneficiary Report</h1>
                        <p>Total Records: ${filtered.length}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>NIC</th>
                                <th>Type</th>
                                <th>Income</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(w => `
                                <tr>
                                    <td>${w.fullName}</td>
                                    <td>${w.nic}</td>
                                    <td>${w.type}</td>
                                    <td>Rs. ${w.monthlyIncome}</td>
                                    <td><span class="status status-${w.status}">${w.status.toUpperCase()}</span></td>
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
            Alert.alert("Error", "Report failed");
        } finally {
            setLoading(false);
        }
    };

    const getFilteredWelfares = () => {
        return welfares.filter(w => {
            const matchesSearch = w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || w.nic.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
            const matchesType = typeFilter === 'All' || w.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    };

    const handleSave = async () => {
        let newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.nic.trim()) newErrors.nic = "NIC is required";
        if (!formData.householdNo.trim()) newErrors.householdNo = "Household number required";
        if (!formData.income || isNaN(formData.income)) newErrors.income = "Valid monthly income required";
        
        if (isOfficer && (!formData.amount || isNaN(formData.amount))) {
            newErrors.amount = "Welfare amount is required";
        }

        const welfareConfig = config?.welfare || {};
        const maxIncomeLimits = welfareConfig.maxIncomeLimits || { Aswasuma: 20000, Samurdhi: 15000, 'Elderly Allowance': 10000 };
        const ageRestrictions = welfareConfig.ageRestrictions || { Aswasuma: null, Samurdhi: null, 'Elderly Allowance': 60 };
        const requiredDocs = welfareConfig.requiredDocuments || { Aswasuma: ['paySlip'], Samurdhi: ['paySlip'], 'Elderly Allowance': [] };
        const isVerifReq = welfareConfig.incomeVerificationRequired !== false;

        const maxIncome = maxIncomeLimits[formData.type] || 0;
        if (maxIncome && parseFloat(formData.income) > maxIncome) {
            newErrors.income = t.incomeError.replace('{max}', maxIncome);
        }

        const minAge = ageRestrictions[formData.type] || null;
        if (minAge) {
            const age = calculateAge(formData.nic);
            if (age && age < minAge) {
                newErrors.nic = t.ageError.replace('{minAge}', minAge);
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!isOfficer && formData.nic.trim().toUpperCase() !== user.nic.trim().toUpperCase()) {
            setErrors({ nic: t.nicMismatch });
            return;
        }
        
        let requiresSlip = false;
        if (Array.isArray(welfareConfig.requiredDocuments)) {
            requiresSlip = welfareConfig.requiredDocuments.includes('paySlip');
        } else {
            requiresSlip = requiredDocs[formData.type]?.includes('paySlip');
        }
        
        if (isVerifReq && requiresSlip && !paySlip && !isEditing) {
            Alert.alert("Missing Document", "Income proof (Pay Slip) is required for this welfare type.");
            return;
        }

        const existing = welfares.find(w => w.status === 'Pending' || w.status === 'Active');
        if (!isOfficer && existing && !isEditing) {
            Alert.alert("Limit Reached", "You already have an active application.");
            return;
        }

        setSubmitting(true);
        setErrors({});
        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('nic', formData.nic);
            data.append('householdNo', formData.householdNo);
            data.append('type', formData.type);
            data.append('monthlyIncome', formData.income);
            data.append('amount', formData.amount || 0);
            data.append('userId', user._id || user.id);
            data.append('userEmail', user.email || "");

            if (paySlip) {
                data.append('paySlip', {
                    uri: paySlip.uri,
                    name: paySlip.name,
                    type: paySlip.mimeType || 'application/octet-stream'
                });
            }

            if (nicImage) {
                data.append('nicImage', {
                    uri: nicImage.uri,
                    name: nicImage.name,
                    type: nicImage.mimeType || 'application/octet-stream'
                });
            }

            if (isEditing) {
                if (isOfficer) {
                    const jsonPayload = {
                        fullName: formData.fullName,
                        nic: formData.nic,
                        householdNo: formData.householdNo,
                        type: formData.type,
                        income: formData.income,
                        amount: formData.amount || 0
                    };
                    await api.put(`/welfare/update/${isEditing}`, jsonPayload);
                } else {
                    await api.put(`/welfare/user-edit/${isEditing}`, data, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
                Alert.alert("Success", "Application updated");
            } else {
                await api.post('/welfare/apply', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Alert.alert("Success", "Application submitted");
            }
            resetForm();
            fetchWelfares();
        } catch (err) {
            Alert.alert("Error", "Failed to save application");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert("Delete", t.deleteConfirm, [
            { text: t.cancel, style: "cancel" },
            { 
                text: t.delete, 
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/welfare/delete/${id}`);
                        fetchWelfares();
                    } catch (err) {
                        Alert.alert("Error", "Failed to delete");
                    }
                }
            }
        ]);
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/welfare/approve/${id}`, { status });
            Alert.alert("Success", `Application ${status}`);
            fetchWelfares();
        } catch (err) {
            Alert.alert("Error", "Failed to update status");
        }
    };

    const generatePDF = async () => {
        const totalAmount = welfares.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
        const activeCount = welfares.filter(w => w.status === 'Active').length;
        
        const html = `
            <html>
            <body style="font-family:sans-serif;padding:20px;">
                <h1 style="color:#800000;text-align:center;">Welfare Beneficiaries Report</h1>
                <div style="background:#f8fafc;padding:15px;margin-bottom:20px;border-radius:10px;">
                    <p><strong>Total Beneficiaries:</strong> ${welfares.length} | <strong>Active:</strong> ${activeCount}</p>
                    <p><strong>Total Welfare Distributed:</strong> Rs. ${totalAmount.toLocaleString()}</p>
                </div>
                <table border="1" style="width:100%;border-collapse:collapse;">
                    <tr style="background:#800000;color:#fff;">
                        <th style="padding:8px;">Name</th>
                        <th style="padding:8px;">NIC</th>
                        <th style="padding:8px;">Type</th>
                        <th style="padding:8px;">Amount</th>
                        <th style="padding:8px;">Status</th>
                    </tr>
                    ${welfares.map(w => `
                    <tr>
                        <td style="padding:8px;">${w.fullName}</td>
                        <td style="padding:8px;">${w.nic}</td>
                        <td style="padding:8px;">${w.type}</td>
                        <td style="padding:8px;">Rs. ${(w.amount || 0).toLocaleString()}</td>
                        <td style="padding:8px;">${w.status || 'Pending'}</td>
                    </tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `;
        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri);
        } catch (err) {
            Alert.alert("Error", "PDF Export failed");
        }
    };

    const resetForm = () => {
        setFormData({ 
            fullName: isOfficer ? '' : (user?.fullName || ''), 
            nic: isOfficer ? '' : (user?.nic || ''), 
            householdNo: isOfficer ? '' : (user?.householdNo || ''), 
            type: 'Aswasuma', 
            income: '',
            amount: ''
        });
        setPaySlip(null);
        setIsEditing(null);
        setErrors({});
        setShowForm(false);
    };

    const renderWelfareCard = ({ item }) => {
        const isSelected = selectedApplications.includes(item._id);
        const status = item.status || 'Pending';
        const statusColors = {
            'Active': { bg: '#dcfce7', text: '#15803d', label: 'Active' },
            'Suspended': { bg: '#fee2e2', text: '#b91c1c', label: 'Suspended' },
            'Pending': { bg: '#fef3c7', text: '#b45309', label: t.pending }
        };
        const theme = statusColors[status] || statusColors.Pending;

        return (
            <TouchableOpacity 
                style={[styles.card, isSelected && styles.selectedCard]}
                onPress={() => isOfficer && status === 'Pending' && toggleSelection(item._id)}
            >
                <View style={styles.cardHeader}>
                    {isOfficer && status === 'Pending' && (
                        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                            {isSelected && <Check size={10} color="#fff" />}
                        </View>
                    )}
                    <View style={styles.iconBox}><HandHeart size={22} color="#800000" /></View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.cardTitle}>{item.fullName}</Text>
                        <Text style={styles.cardSub}>{item.type}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}>
                        <Text style={[styles.statusText, { color: theme.text }]}>{theme.label}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}><User size={14} color="#64748b" /><Text style={styles.infoText}>{item.nic}</Text></View>
                        <View style={styles.infoItem}><Home size={14} color="#64748b" /><Text style={styles.infoText}>{item.householdNo}</Text></View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}><DollarSign size={14} color="#64748b" /><Text style={styles.infoText}>{t.incomeCard}: Rs. {item.income?.toLocaleString() || 0}</Text></View>
                        {item.amount > 0 && <View style={styles.infoItem}><CheckCircle size={14} color="#10b981" /><Text style={[styles.infoText, {color: '#10b981', fontWeight: 'bold'}]}>{t.welfareCard}: Rs. {item.amount?.toLocaleString()}</Text></View>}
                    </View>
                </View>

                <View style={styles.cardActions}>
                    {isOfficer ? (
                        <View style={styles.officerActions}>
                            {item.paySlip && (
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { backgroundColor: '#3b82f6', marginRight: 8 }]} 
                                    onPress={() => setViewingImage(getWelfareDocUrl(item.paySlip))}
                                >
                                    <FileText size={16} color="#fff" /><Text style={styles.btnTextWhite}>View Proof</Text>
                                </TouchableOpacity>
                            )}
                            {status !== 'Active' && (
                                <TouchableOpacity style={[styles.actionBtn, styles.btnApprove]} onPress={() => handleStatusUpdate(item._id, 'Active')}>
                                    <Check size={16} color="#fff" /><Text style={styles.btnTextWhite}>{t.approve}</Text>
                                </TouchableOpacity>
                            )}
                            {status !== 'Suspended' && (
                                <TouchableOpacity style={[styles.actionBtn, styles.btnReject]} onPress={() => handleStatusUpdate(item._id, 'Suspended')}>
                                    <CloseIcon size={16} color="#fff" /><Text style={styles.btnTextWhite}>{t.reject}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.iconBtn} onPress={() => { setFormData(item); setIsEditing(item._id); setShowForm(true); }}><Edit3 size={18} color="#2563eb" /></TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item._id)}><Trash2 size={18} color="#ef4444" /></TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1}}>
                            {item.paySlip && (
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { backgroundColor: '#64748b' }]} 
                                    onPress={() => setViewingImage(getImageUrl(item.paySlip))}
                                >
                                    <FileText size={16} color="#fff" /><Text style={styles.btnTextWhite}>View Proof</Text>
                                </TouchableOpacity>
                            )}
                            {status === 'Pending' && (
                                <View style={styles.citizenActions}>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => { setFormData(item); setIsEditing(item._id); setShowForm(true); }}><Edit3 size={18} color="#2563eb" /></TouchableOpacity>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item._id)}><Trash2 size={18} color="#ef4444" /></TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const toggleSelection = (id) => {
        setSelectedApplications(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    if (loading && !refreshing) return <View style={styles.center}><ActivityIndicator size="large" color="#800000" /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerPremium}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.titlePremium}>{t.title}</Text>
                        <Text style={styles.subtitlePremium}>{t.subTitle}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        {isOfficer && (
                            <TouchableOpacity onPress={handleDownloadWelfareReport} style={styles.headerBtn}>
                                <FileDown size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                        <View style={styles.langSwitch}>
                            {['en', 'si', 'ta'].map(l => (
                                <TouchableOpacity key={l} onPress={() => setLang(l)} style={[styles.langBtn, lang === l && styles.activeLangBtn]}>
                                    <Text style={[styles.langText, lang === l && styles.activeLangText]}>{l.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.searchBarPremium}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput style={styles.searchInp} placeholder={t.search} value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#94a3b8" />
                </View>

                {isOfficer && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statVal}>{welfares.filter(a => (a.status || 'Pending') === 'Pending').length}</Text>
                            <Text style={styles.statLab}>{t.pending}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statVal, {color: '#10b981'}]}>{welfares.filter(a => a.status === 'Active').length}</Text>
                            <Text style={styles.statLab}>Active</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statVal, {color: '#ef4444'}]}>{welfares.filter(a => a.status === 'Suspended').length}</Text>
                            <Text style={styles.statLab}>Suspended</Text>
                        </View>
                    </View>
                )}
            </View>

            {isOfficer && (
                <View style={styles.filterBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8}}>
                        {['All', 'Pending', 'Active', 'Suspended'].map(f => (
                            <TouchableOpacity key={f} onPress={() => setStatusFilter(f)} style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}>
                                <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {selectedApplications.length > 0 && (
                        <TouchableOpacity style={styles.bulkApproveBtn} onPress={handleBulkApprove}>
                            <Check size={16} color="#fff" />
                            <Text style={styles.bulkApproveText}>Approve ({selectedApplications.length})</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <FlatList 
                data={welfares
                    .filter(a => statusFilter === 'All' || (a.status || 'Pending') === statusFilter)
                    .filter(a => (a.fullName||"").toLowerCase().includes(searchQuery.toLowerCase()) || (a.nic||"").includes(searchQuery))
                }
                keyExtractor={item => item._id}
                renderItem={renderWelfareCard}
                contentContainerStyle={styles.listPadding}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWelfares(); }} colors={['#800000']} />}
                ListEmptyComponent={<View style={styles.empty}><Layout size={50} color="#e2e8f0" /><Text style={styles.emptyText}>{t.noData}</Text></View>}
            />

            <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setShowForm(true); }}>
                <Plus size={30} color="#fff" />
            </TouchableOpacity>

            <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{isEditing ? t.updateTitle : (isOfficer ? "Register Beneficiary" : t.addTitle)}</Text>
                        <TouchableOpacity onPress={resetForm}><CloseIcon size={24} color="#1e293b" /></TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.label}>{t.name}</Text>
                        <TextInput style={[styles.input, errors.fullName && styles.errorBorder]} value={formData.fullName} onChangeText={v => setFormData({...formData, fullName: v})} />
                        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

                        <Text style={styles.label}>{t.nic}</Text>
                        <TextInput style={[styles.input, errors.nic && styles.errorBorder]} value={formData.nic} onChangeText={v => setFormData({...formData, nic: v})} />
                        {errors.nic && <Text style={styles.errorText}>{errors.nic}</Text>}

                        <Text style={styles.label}>{t.house}</Text>
                        <TextInput style={[styles.input, errors.householdNo && styles.errorBorder]} value={formData.householdNo} onChangeText={v => setFormData({...formData, householdNo: v})} />
                        {errors.householdNo && <Text style={styles.errorText}>{errors.householdNo}</Text>}

                        <Text style={styles.label}>{t.type}</Text>
                        <View style={styles.pickerContainer}>
                            {WELFARE_TYPES.map(type => (
                                <TouchableOpacity 
                                    key={type} 
                                    style={[
                                        styles.pickerItem, 
                                        formData.type === type && styles.pickerItemActive,
                                        isEditing && !isOfficer && formData.type !== type && { opacity: 0.5 }
                                    ]} 
                                    onPress={() => {
                                        if (isEditing && !isOfficer) {
                                            Alert.alert("Not Allowed", "You cannot change the Welfare Type of an existing application. Please delete and create a new one if needed.");
                                            return;
                                        }
                                        setFormData({...formData, type: type});
                                    }}
                                >
                                    <Text style={[styles.pickerText, formData.type === type && styles.pickerTextActive]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        {(() => {
                            const wc = config?.welfare || {};
                            const incLim = wc.maxIncomeLimits || { Aswasuma: 20000, Samurdhi: 15000, 'Elderly Allowance': 10000 };
                            const ageLim = wc.ageRestrictions || { Aswasuma: null, Samurdhi: null, 'Elderly Allowance': 60 };
                            const reqDocsObj = wc.requiredDocuments || { Aswasuma: ['paySlip'], Samurdhi: ['paySlip'], 'Elderly Allowance': [] };
                            
                            const maxInc = incLim[formData.type];
                            const minAge = ageLim[formData.type];
                            
                            let slipNeeded = false;
                            if (Array.isArray(wc.requiredDocuments)) {
                                slipNeeded = wc.requiredDocuments.includes('paySlip');
                            } else {
                                slipNeeded = reqDocsObj[formData.type]?.includes('paySlip');
                            }

                            return (
                                <View style={styles.hintBox}>
                                    <Info size={14} color="#0369a1" />
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={styles.hintTitle}>{t.eligibility}:</Text>
                                        {maxInc > 0 && <Text style={styles.hintText}>• {t.incomeReq}: Rs. {maxInc.toLocaleString()}</Text>}
                                        {minAge > 0 && <Text style={styles.hintText}>• {t.ageReq}: {minAge}</Text>}
                                        <Text style={styles.hintText}>• {t.docReq}: {slipNeeded ? t.docYes : t.docNo}</Text>
                                    </View>
                                </View>
                            );
                        })()}

                        <Text style={styles.label}>{t.income}</Text>
                        <TextInput style={[styles.input, errors.income && styles.errorBorder]} value={formData.income != null ? String(formData.income) : ''} keyboardType="numeric" onChangeText={v => setFormData({...formData, income: v})} />
                        {errors.income && <Text style={styles.errorText}>{errors.income}</Text>}

                        {isOfficer && (
                            <>
                                <Text style={styles.label}>{t.amount}</Text>
                                <TextInput style={[styles.input, errors.amount && styles.errorBorder]} value={formData.amount != null ? String(formData.amount) : ''} keyboardType="numeric" onChangeText={v => setFormData({...formData, amount: v})} placeholder="0.00" />
                                {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                            </>
                        )}

                        <Text style={styles.label}>{t.fileLabel}</Text>
                        <TouchableOpacity style={styles.uploadZone} onPress={async () => {
                            const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });
                            if (!res.canceled) setPaySlip(res.assets[0]);
                        }}>
                            <Upload size={24} color="#800000" />
                            <Text style={styles.uploadText}>{paySlip ? paySlip.name : "Select Income Proof"}</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>NIC Front/Back Image</Text>
                        <TouchableOpacity style={styles.uploadZone} onPress={async () => {
                            const res = await DocumentPicker.getDocumentAsync({ type: ['image/*'] });
                            if (!res.canceled) setNicImage(res.assets[0]);
                        }}>
                            <Camera size={24} color="#800000" />
                            <Text style={styles.uploadText}>{nicImage ? nicImage.name : "Upload NIC Image"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnPrimary} onPress={handleSave} disabled={submitting}>
                            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>{isEditing ? t.update : t.save}</Text>}
                        </TouchableOpacity>
                        <View style={{height: 40}} />
                    </ScrollView>
                </View>
            </Modal>

            {/* Image Viewer Modal */}
            <Modal visible={!!viewingImage} transparent animationType="fade">
                <View style={styles.imageViewerOverlay}>
                    <TouchableOpacity style={styles.imageViewerClose} onPress={() => setViewingImage(null)}>
                        <CloseIcon size={30} color="#fff" />
                    </TouchableOpacity>
                    {viewingImage && (
                        <View style={styles.imageContainer}>
                             <Text style={{color: '#fff', marginBottom: 10, fontWeight: 'bold'}}>Document Evidence</Text>
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
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfd' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerPremium: { backgroundColor: '#800000', padding: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 10 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    titlePremium: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
    subtitlePremium: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    headerActions: { flexDirection: 'row', gap: 10 },
    headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    searchBarPremium: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 15, alignItems: 'center', height: 50 },
    searchInp: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 10 },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 15, alignItems: 'center' },
    statVal: { color: '#fbc531', fontSize: 18, fontWeight: 'bold' },
    statLab: { color: '#fff', fontSize: 9, textTransform: 'uppercase', marginTop: 4, fontWeight: 'bold' },
    filterBar: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 15, gap: 10 },
    filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
    filterChipActive: { backgroundColor: '#800000', borderColor: '#800000' },
    filterText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    filterTextActive: { color: '#fff', fontWeight: 'bold' },
    listPadding: { padding: 20, paddingBottom: 100 },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#fff1f1', justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    cardSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
    cardBody: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13, color: '#475569' },
    cardActions: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
    officerActions: { flexDirection: 'row', gap: 10 },
    citizenActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
    actionBtn: { flex: 1, flexDirection: 'row', height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
    btnApprove: { backgroundColor: '#10b981' },
    btnReject: { backgroundColor: '#ef4444' },
    btnTextWhite: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    iconBtn: { padding: 10, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#800000', justifyContent: 'center', alignItems: 'center', elevation: 12 },
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    modalContent: { padding: 20 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#64748b', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#f8fafc', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15 },
    pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
    pickerItem: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    pickerItemActive: { backgroundColor: '#800000', borderColor: '#800000' },
    pickerText: { fontSize: 12, color: '#64748b' },
    pickerTextActive: { color: '#fff', fontWeight: 'bold' },
    uploadZone: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 15, padding: 20, marginTop: 10 },
    uploadText: { fontSize: 14, color: '#64748b', flex: 1 },
    btnPrimary: { backgroundColor: '#800000', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
    btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    empty: { alignItems: 'center', marginTop: 100, gap: 15 },
    emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '500' },
    errorBorder: { borderColor: '#ef4444', borderWidth: 1.5 },
    errorText: { color: '#ef4444', fontSize: 11, marginTop: 4, marginLeft: 4, fontWeight: 'bold' },
    hintBox: { flexDirection: 'row', backgroundColor: '#f0f9ff', padding: 12, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#bae6fd' },
    hintTitle: { fontSize: 12, fontWeight: 'bold', color: '#0369a1', marginBottom: 4 },
    hintText: { fontSize: 11, color: '#0c4a6e', marginTop: 2 },
    selectedCard: { borderColor: '#800000', borderWidth: 2, backgroundColor: '#fff1f1' },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: '#800000', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    checkboxActive: { backgroundColor: '#800000' },
    bulkApproveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#10b981' },
    bulkApproveText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    imageViewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    imageViewerClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    imageContainer: { width: '90%', height: '70%', alignItems: 'center' },
    imageFrame: { width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', padding: 2, backgroundColor: 'rgba(255,255,255,0.1)' }
});
