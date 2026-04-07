import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const INITIAL_APPS = [
  { id: '1', name: 'Instagram', category: 'SOCIAL MEDIA', usageMinutes: 80, limitMinutes: 90, icon: 'instagram', color: '#D93250' },
  { id: '2', name: 'YouTube', category: 'ENTERTAINMENT', usageMinutes: 45, limitMinutes: 120, icon: 'youtube', color: '#D92E2E' },
  { id: '3', name: 'WhatsApp', category: 'MESSAGING', usageMinutes: 32, limitMinutes: 60, icon: 'message-circle', color: '#10B981' },
  { id: '4', name: 'Facebook', category: 'SOCIAL MEDIA', usageMinutes: 12, limitMinutes: 30, icon: 'users', color: '#1877F2' },
  { id: '5', name: 'Chrome', category: 'PRODUCTIVITY', usageMinutes: 58, limitMinutes: 60, icon: 'globe', color: '#B46C20' },
  { id: '6', name: 'TikTok', category: 'SOCIAL MEDIA', usageMinutes: 15, limitMinutes: 15, icon: 'music', color: '#111317' },
];

export default function Index(){
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [appsData, setAppsData] = useState(INITIAL_APPS);
  const [lockedApp, setLockedApp] = useState(null);
  const [emergencyUnlocks, setEmergencyUnlocks] = useState(3);

  // --- Handlers ---
  const handleLogin = (username, password) => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTab('Dashboard');
    setLockedApp(null);
  };

  const handleOpenApp = (app) => {
    if (app.usageMinutes >= app.limitMinutes) {
      setLockedApp(app);
    } else {
      Alert.alert('App Opened', `You opened ${app.name}.\nUsage: ${app.usageMinutes}m / Limit: ${app.limitMinutes}m`);
    }
  };

  const handleEmergencyUnlock = () => {
    if (emergencyUnlocks > 0) {
      setEmergencyUnlocks(prev => prev - 1);
      // Give additional 15 minutes to bypass lock
      setAppsData(prev =>
        prev.map(a =>
          a.id === lockedApp.id
            ? { ...a, limitMinutes: a.limitMinutes + 15 }
            : a
        )
      );
      setLockedApp(null);
      Alert.alert('Unlocked', 'You have been granted +15 minutes.');
    } else {
      Alert.alert('No Unlocks Left', 'You have used all emergency unlocks for today.');
    }
  };

  const increaseLimit = (appId) => {
    setAppsData(prev =>
      prev.map(a => a.id === appId ? { ...a, limitMinutes: a.limitMinutes + 5 } : a)
    );
  };

  const decreaseLimit = (appId) => {
    setAppsData(prev =>
      prev.map(a => a.id === appId && a.limitMinutes > 5 ? { ...a, limitMinutes: a.limitMinutes - 5 } : a)
    );
  };

  // --- Screens ---
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (lockedApp) {
    return (
      <LockScreen
        app={lockedApp}
        unlocksLeft={emergencyUnlocks}
        onUnlock={handleEmergencyUnlock}
        onClose={() => setLockedApp(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header bar */}
      <View style={styles.header}>
        <Feather name="menu" size={24} color="#1D64C5" />
        <Text style={styles.headerTitle}>Digital Discipline System</Text>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
          style={styles.profileAvatar} 
        />
      </View>

      <View style={styles.mainContent}>
        {currentTab === 'Dashboard' && (
          <DashboardScreen appsData={appsData} onOpenApp={handleOpenApp} />
        )}
        {currentTab === 'Limits' && (
          <LimitsScreen appsData={appsData} onIncrease={increaseLimit} onDecrease={decreaseLimit} />
        )}
        {currentTab === 'Settings' && (
          <SettingsScreen unlocksLeft={emergencyUnlocks} onLogout={handleLogout} />
        )}
      </View>

      <BottomTabBar currentTab={currentTab} onTabChange={setCurrentTab} />
    </SafeAreaView>
  );
}

// ==========================================
// LOGIN SCREEN
// ==========================================
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  return (
    <SafeAreaView style={styles.loginSafeArea}>
      <StatusBar barStyle="dark-content" />
      {/* Abstract Background Elements can be added via image or simple shapes, we use solid background here per constraints */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.loginScrollContainer}>
          <View style={styles.loginLogoContainer}>
            <View style={styles.loginIconBox}>
                <Feather name="terminal" size={24} color="#fff" />
            </View>
            <Text style={styles.loginTitle}>Digital Discipline</Text>
            <Text style={styles.loginTitle}>System</Text>
            <Text style={styles.loginSubtitle}>Curate your focus, master your time.</Text>
          </View>

          <View style={styles.loginCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>USERNAME</Text>
              <TextInput
                style={styles.input}
                placeholder="scholarly_user"
                placeholderTextColor="#A0AAB4"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="........"
                placeholderTextColor="#A0AAB4"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot credentials?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, !isFormValid && styles.disabledButton]}
              disabled={!isFormValid}
              onPress={() => onLogin(username, password)}
            >
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>SOCIAL ACCESS</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.socialButton}>
              <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png'}} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton}>
              <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Facebook_logo_%28square%29.png/800px-Facebook_logo_%28square%29.png'}} style={styles.socialIcon} />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.enrollmentContainer}>
            <Text style={styles.enrollmentText}>Don't have an academic account? </Text>
            <TouchableOpacity><Text style={styles.requestText}>Request Enrollment</Text></TouchableOpacity>
          </View>
          
          <View style={styles.footerLinks}>
            <Text style={styles.footerText}>PRIVACY CHARTER</Text>
            <Text style={styles.footerText}>SYSTEMS STATUS</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// DASHBOARD SCREEN
// ==========================================
function DashboardScreen({ appsData, onOpenApp }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.statusLabel}>SYSTEM STATUS: ACTIVE</Text>
      <Text style={styles.welcomeTitle}>Welcome Back</Text>
      <Text style={styles.welcomeSubtitle}>
        Your digital environment is currently curated for <Text style={styles.deepWorkText}>Deep Work</Text>. You have 3 limits nearing completion.
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHalf}>
          <Text style={styles.summaryValuePurple}>84%</Text>
          <Text style={styles.summaryLabel}>FOCUS SCORE</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryHalf}>
          <Text style={styles.summaryValueBlue}>2h 14m</Text>
          <Text style={styles.summaryLabel}>TOTAL USAGE</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>App Usage Today</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All Analysis</Text>
        </TouchableOpacity>
      </View>

      {appsData.map(app => {
        const percentage = Math.min((app.usageMinutes / app.limitMinutes) * 100, 100);
        const isOverLimit = app.usageMinutes >= app.limitMinutes;
        
        let progressColor = '#1D64C5'; // default blue
        let statusText = 'Stable: Usage within limits';
        
        if (percentage >= 90) {
            progressColor = '#D92E2E'; // Red
            statusText = `Critical: ${app.limitMinutes - app.usageMinutes}m remaining`;
        } else if (app.name === 'WhatsApp') {
            progressColor = '#7B3BCE'; // Purple
            statusText = 'Moderate: Communication active';
        } else if (app.name === 'YouTube') {
            progressColor = '#1D64C5'; // Blue
            statusText = 'Stable: Educational content focus';
        } else if (app.name === 'Chrome') {
            progressColor = '#B46C20';
            statusText = 'Warning: Close to boundary';
        } else if (app.name === 'Instagram') {
            progressColor = '#D92E2E';
            if (isOverLimit) statusText = 'Critical: Limit Exceeded';
        }

        const formatMinutes = (totalMins) => {
            const h = Math.floor(totalMins / 60);
            const m = totalMins % 60;
            return h > 0 ? `${h}h ${m}m` : `${m}m`;
        };

        return (
          <TouchableOpacity key={app.id} style={styles.appCard} onPress={() => onOpenApp(app)}>
            <View style={styles.appCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: app.color + '1A' }]}>
                 <Feather name={app.icon} size={20} color={app.color} />
              </View>
              <View style={styles.appUsageDetails}>
                <Text style={styles.usageTime}>{formatMinutes(app.usageMinutes)}</Text>
                <Text style={styles.limitLabel}>LIMIT: {formatMinutes(app.limitMinutes).toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.appNameCard}>{app.name}</Text>
            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBarFilled, { width: `${percentage}%`, backgroundColor: progressColor }]} />
            </View>
            <Text style={styles.appStatusText}>{statusText}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.newLimitCard}>
        <View style={styles.newLimitIconBox}>
          <Feather name="plus" size={20} color="#6B7280" />
        </View>
        <Text style={styles.newLimitTitle}>New Limit</Text>
        <Text style={styles.newLimitSubtitle}>Curate another digital boundary</Text>
      </TouchableOpacity>
      
      {/* Floating Action Button simulation */}
      <View style={styles.fabPosition}>
        <View style={styles.fab}>
           <Feather name="edit" size={20} color="#fff" />
        </View>
      </View>
    </ScrollView>
  );
}

// ==========================================
// LIMITS SCREEN
// ==========================================
function LimitsScreen({ appsData, onIncrease, onDecrease }) {
  const formatTimeLimit = (minutes) => {
      const h = Math.floor(minutes / 60).toString().padStart(2, '0');
      const m = (minutes % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.statusLabel}>CURATION</Text>
      <Text style={styles.welcomeTitle}>Limits</Text>
      <Text style={styles.welcomeSubtitle}>
        Define the boundaries of your digital environment to safeguard your deep focus sessions.
      </Text>

      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="#A0AAB4" style={{marginRight: 10}} />
        <TextInput 
           placeholder="Search applications..." 
           placeholderTextColor="#A0AAB4"
           style={styles.searchInput}
        />
      </View>

      {appsData.map(app => {
        let iconColor = app.color;
        
        return (
        <View key={app.id} style={styles.limitCard}>
          <View style={styles.limitCardTop}>
             <View style={[styles.limitIconCircle, { backgroundColor: iconColor }]}>
                <Feather name={app.icon} size={22} color="#fff" />
             </View>
             <View style={styles.limitNameBox}>
                <Text style={styles.appNameCard}>{app.name}</Text>
                <Text style={styles.appCategory}>{app.category}</Text>
             </View>
             <View style={styles.limitTimeBox}>
                <Text style={styles.limitTimeLarge}>{formatTimeLimit(app.limitMinutes)}</Text>
                <Text style={styles.limitDailyText}>daily limit</Text>
             </View>
          </View>
          
          <View style={styles.sliderRow}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => onDecrease(app.id)}>
              <Feather name="minus" size={16} color="#4B5563" />
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
                <View style={[styles.sliderFilled, { width: `${Math.min(100, (app.limitMinutes/240)*100)}%`}]} />
            </View>
            <TouchableOpacity style={styles.circleBtn} onPress={() => onIncrease(app.id)}>
               <Feather name="plus" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>
      )})}

      <View style={styles.strictModeCard}>
         <Text style={styles.strictModeTitle}>Strict Discipline Mode</Text>
         <Text style={styles.strictModeDesc}>Prevents limit changes during focus hours (08:00 - 17:00).</Text>
         <TouchableOpacity style={styles.strictModeBtn}>
            <Text style={styles.strictModeBtnText}>Enable Mode</Text>
         </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ==========================================
// SETTINGS SCREEN
// ==========================================
function SettingsScreen({ unlocksLeft, onLogout }) {
  return (
    <View style={styles.settingsContent}>
      <Text style={styles.statusLabel}>PREFERENCES</Text>
      <Text style={styles.welcomeTitle}>Settings</Text>
      <Text style={styles.welcomeSubtitle}>
        Manage your account rules and check remaining override permissions.
      </Text>

      <View style={styles.limitCard}>
        <Text style={styles.appNameCard}>Emergency Unlocks Remaining</Text>
        <Text style={[styles.limitTimeLarge, {marginTop: 6}]}>{unlocksLeft} / 3</Text>
      </View>
      
      <View style={styles.limitCard}>
        <Text style={styles.appNameCard}>Account Status</Text>
        <Text style={[styles.limitTimeLarge, {marginTop: 6, color: '#10B981'}]}>Active</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==========================================
// LOCK SCREEN
// ==========================================
function LockScreen({ app, unlocksLeft, onUnlock, onClose }) {
  // Visual representation of remaining unlocks (dots)
  const dots = [];
  for(let i = 0; i < 3; i++) {
     dots.push(
       <View key={i} style={[styles.unlockDot, { backgroundColor: i < unlocksLeft ? '#D92E2E' : '#2C3038' }]} />
     );
  }

  return (
    <SafeAreaView style={styles.lockSafeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.lockBgWatermark}>
         <Text style={styles.watermarkText}>DISCIPLINE</Text>
      </View>

      <View style={styles.lockContent}>
        <View style={styles.lockIconContainer}>
           <Feather name="clock" size={48} color="#D92E2E" />
           {/* Cross line simulation */}
           <View style={styles.crossLine} />
        </View>

        <Text style={styles.lockTitleLarge}>Limit Exceeded</Text>
        <Text style={styles.lockSubtext}>Digital Discipline System active</Text>
        
        <View style={styles.securityStatusCard}>
          <Text style={styles.securityStatusLabel}>SECURITY STATUS</Text>
          <Text style={styles.securityStatusVal}>Remaining unlock attempts: {unlocksLeft}</Text>
          <View style={styles.dotsContainer}>
             {dots}
          </View>
        </View>

        <TouchableOpacity style={styles.emergencyUnlockBtn} onPress={onUnlock}>
          <Feather name="lock" size={18} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.emergencyBtnText}>Emergency Unlock</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={{marginTop: 40}}>
           <Text style={styles.returnFocusText}>RETURN TO FOCUS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// BOTTOM TAB BAR
// ==========================================
function BottomTabBar({ currentTab, onTabChange }) {
  const tabs = [
    { id: 'Dashboard', icon: 'grid', label: 'DASHBOARD' },
    { id: 'Limits', icon: 'clock', label: 'LIMITS' },
    { id: 'Settings', icon: 'settings', label: 'SETTINGS' },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => {
        const isActive = currentTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onTabChange(tab.id)}
          >
            <Feather 
              name={tab.icon} 
              size={20} 
              color={isActive ? '#1D64C5' : '#6B7280'} 
              style={isActive && tab.id === 'Limits' ? {transform: [{rotate: '45deg'}]} : {}}/>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC', // Very light blue/grey bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1D64C5',
    marginLeft: 16,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 10,
  },
  
  // Dashboard & shared Typography
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D64C5',
    letterSpacing: 1,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111317',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 24,
  },
  deepWorkText: {
    color: '#7B3BCE',
    fontWeight: '700',
  },
  
  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHalf: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  summaryValuePurple: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7B3BCE',
  },
  summaryValueBlue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D64C5',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  
  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111317',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D64C5',
  },
  
  // App Cards
  appCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  appCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appUsageDetails: {
    alignItems: 'flex-end',
  },
  usageTime: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111317',
  },
  limitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  appNameCard: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111317',
    marginBottom: 10,
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    borderRadius: 3,
  },
  appStatusText: {
    fontSize: 12,
    color: '#4B5563',
  },
  
  // New Limit Card
  newLimitCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  newLimitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  newLimitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111317',
    marginBottom: 4,
  },
  newLimitSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  
  fabPosition: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: '#1D64C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D64C5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Limits specific
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111317',
  },
  limitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  limitCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  limitIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  limitNameBox: {
    flex: 1,
  },
  appCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  limitTimeBox: {
    alignItems: 'flex-end',
  },
  limitTimeLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D64C5',
  },
  limitDailyText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sliderFilled: {
    height: '100%',
    backgroundColor: '#1D64C5',
    borderRadius: 3,
  },
  strictModeCard: {
    backgroundColor: '#F3E8FF', // Light purple bg
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  strictModeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7B3BCE',
    marginBottom: 8,
  },
  strictModeDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  strictModeBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  strictModeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Login
  loginSafeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  keyboardView: {
    flex: 1,
  },
  loginScrollContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  loginLogoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginIconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#1D64C5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1D64C5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1D64C5',
    lineHeight: 34,
  },
  loginSubtitle: {
    fontSize: 15,
    color: '#4B5563',
    marginTop: 12,
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F3F4F6',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111317',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D64C5',
  },
  primaryButton: {
    backgroundColor: '#1D64C5',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 14,
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
  },
  socialButton: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  enrollmentContainer: {
    flexDirection: 'row',
    marginTop: 32,
    alignItems: 'center',
  },
  enrollmentText: {
    color: '#4B5563',
    fontSize: 14,
  },
  requestText: {
    color: '#1D64C5',
    fontSize: 14,
    fontWeight: '700',
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: 40,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginHorizontal: 16,
    letterSpacing: 1,
  },

  // Lock Screen
  lockSafeArea: {
    flex: 1,
    backgroundColor: '#111317',
  },
  lockBgWatermark: {
    position: 'absolute',
    bottom: -40,
    left: 10,
    opacity: 0.03,
  },
  watermarkText: {
    fontSize: 110,
    fontWeight: '900',
    color: '#fff',
  },
  lockContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    zIndex: 10,
  },
  lockIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(217, 46, 46, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  crossLine: {
    position: 'absolute',
    width: 50,
    height: 4,
    backgroundColor: '#D92E2E',
    transform: [{rotate: '-45deg'}],
    borderRadius: 2,
  },
  lockTitleLarge: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  lockSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
  },
  securityStatusCard: {
    backgroundColor: '#1C1F26',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C3038',
    marginBottom: 40,
  },
  securityStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  securityStatusVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  unlockDot: {
    width: 30,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  emergencyUnlockBtn: {
    backgroundColor: '#D92E2E',
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#D92E2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  emergencyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  returnFocusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1.5,
  },

  // Settings
  settingsContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutBtnText: {
    color: '#D92E2E',
    fontSize: 16,
    fontWeight: '700',
  },

  // Tab Bar
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 100,
  },
  tabItemActive: {
    backgroundColor: '#EFF6FF', // Light blue background
  },
  tabText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#1D64C5',
  },
});
