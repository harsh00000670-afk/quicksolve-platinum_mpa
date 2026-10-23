/* ============================================================
   QUICKSOLVE PLATINUM - CORE ENGINE SSJ4 v20 (Utility & Data Mode)
   Removed SPA Navigation. Dedicated to Haptics, Storage, Export/Import & UI State.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE SETTINGS & HISTORY
    loadSettings();
    console.log('QuickSolve Core v20: Platinum Data Engine Active 🛡️⚡');

    // 💾 NEW: Restore Settings Panel State on Back Navigation
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel && sessionStorage.getItem('qs_settings_state') === 'open') {
        // 'transition: none' ensures it doesn't visibly slide in on load, it just appears
        settingsPanel.style.transition = 'none'; 
        settingsPanel.classList.add('open');
        
        // Restore the animation transition after a split second
        setTimeout(() => { settingsPanel.style.transition = ''; }, 50); 
    }

    // 2. GLOBAL BACK BUTTON LISTENER (Standard Browser History)
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.qs-back-btn')) {
            // If haptics are enabled, give a light feedback on back
            triggerHaptic(30);
            window.history.back(); 
        }
    });

    // 3. GESTURE BACK LISTENER (The Magic Fix)
    window.addEventListener('popstate', (e) => {
        const settingsPanel = document.getElementById('settings-panel');
        // Agar panel open hai aur URL se #settings hat gaya hai (Gesture back dabaya gaya)
        if (settingsPanel && settingsPanel.classList.contains('open') && window.location.hash !== '#settings') {
            toggleSettings(true); // Panel band karo (true means fromGesture)
        }
    });
});

// ==========================================
// ⚙️ SETTINGS & MASTER HAPTIC ENGINE
// ==========================================
window.USER_HAPTIC = true; // Default

window.applySetting = function(settingType, value) {
    if (settingType === 'theme') {
        document.body.setAttribute('data-theme', value);
        localStorage.setItem('qs_set_theme', value);
        triggerHaptic(40);
    } 
    else if (settingType === 'haptic') {
        window.USER_HAPTIC = (value === 'true' || value === true);
        localStorage.setItem('qs_set_haptic', window.USER_HAPTIC);
        if(window.USER_HAPTIC) triggerHaptic([30, 50, 30]); // Confirm haptic
    } 
    else if (settingType === 'wake') {
        localStorage.setItem('qs_set_wake', value);
        triggerHaptic(40);
        // Add Screen Wake Lock API logic here if needed in future
    }
};

function loadSettings() {
    const theme = localStorage.getItem('qs_set_theme') || 'default';
    document.body.setAttribute('data-theme', theme);
    
    const hapticSetting = localStorage.getItem('qs_set_haptic');
    window.USER_HAPTIC = hapticSetting === null ? true : (hapticSetting === 'true');
}

// Global Haptic Wrapper - Safe for all devices
window.triggerHaptic = function(pattern) {
    if (window.USER_HAPTIC && window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate(pattern); } catch(e) { console.warn("Haptic failed", e); }
    }
};

// ==========================================
// 📜 HISTORY ENGINE
// ==========================================
let historyData = JSON.parse(localStorage.getItem('qs_history')) || [];

window.addToHistory = function(toolName, details, result) {
    historyData.unshift({ 
        id: Date.now(), 
        tool: toolName, 
        details: details, 
        result: result, 
        date: new Date().toLocaleString() 
    });
    
    if(historyData.length > 50) historyData.pop(); // Max 50 items memory limit
    localStorage.setItem('qs_history', JSON.stringify(historyData));
};

window.renderHistory = function() {
    const list = document.getElementById('hist-list');
    if(!list) return;
    
    if (historyData.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:30px 20px; color:#64748b; font-weight:600;">No history yet. Start calculating! 🚀</div>`;
        return;
    }

    // Render with Platinum UI inline styling for robustness
    list.innerHTML = historyData.map(item => `
        <div style="padding: 15px; border-bottom: 1px solid var(--border-color, #334155); background: var(--card-bg, #1e293b); margin-bottom: 8px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <b style="color:var(--text-main, #f8fafc); font-size:0.95rem; text-transform:uppercase; letter-spacing:1px;">${item.tool}</b>
                <small style="color:var(--text-sub, #64748b); font-size:0.7rem; font-weight:bold;">${item.date}</small>
            </div>
            <div style="color:var(--text-sub, #94a3b8); font-size:0.85rem; margin-bottom:8px;">${item.details}</div>
            <div style="color:var(--accent-green, #10b981); font-size:1.2rem; font-weight:900; font-family:monospace;">= ${item.result}</div>
        </div>
    `).join('');
};

window.clearHistory = function() { 
    triggerHaptic([50, 100, 50]); // Warning rumble
    if(confirm('Are you sure you want to clear all calculation history?')) {
        historyData = []; 
        localStorage.removeItem('qs_history'); 
        renderHistory(); 
    }
};

// ==========================================
// 🎛️ UI PANEL TOGGLES (Hardware Back Fixed)
// ==========================================
window.toggleSettings = function(fromGesture = false) { 
    const panel = document.getElementById('settings-panel');
    if(panel) {
        const isOpening = !panel.classList.contains('open');
        
        if (isOpening) {
            // PANEL KHUL RAHA HAI
            panel.classList.add('open'); 
            sessionStorage.setItem('qs_settings_state', 'open');
            // History mein fake page daalo taaki gesture back kaam kare
            if (!fromGesture) {
                history.pushState({ panel: 'settings' }, '', '#settings');
            }
        } else {
            // PANEL BAND HO RAHA HAI
            panel.classList.remove('open'); 
            sessionStorage.removeItem('qs_settings_state');
            // Agar cross button se band kiya hai, toh history se fake page nikal do
            if (!fromGesture && window.location.hash === '#settings') {
                history.back(); 
            }
        }
        triggerHaptic(30);
    }
};

window.toggleHistory = function() { 
    const panel = document.getElementById('history-panel');
    if(panel) {
        panel.classList.toggle('open');
        triggerHaptic(30);
        if(panel.classList.contains('open')) renderHistory();
    }
};

// ==========================================
// 💾 DATA MANAGEMENT (Export / Import / Share)
// ==========================================
window.shareApp = function() { 
    triggerHaptic(40);
    if(navigator.share) {
        navigator.share({
            title: 'QuickSolve Platinum', 
            text: 'Check out this God-Tier calculation engine! SSJ4 Architecture.',
            url: location.href
        }).catch(err => console.log("Share cancelled", err));
    } else {
        alert("App link copied to clipboard!");
        navigator.clipboard.writeText(location.href);
    }
};

// Actual functional Export logic
window.exportData = function() {
    triggerHaptic(50);
    const dataToExport = {
        settings: {
            theme: localStorage.getItem('qs_set_theme'),
            haptic: localStorage.getItem('qs_set_haptic'),
            wake: localStorage.getItem('qs_set_wake')
        },
        history: historyData
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "QuickSolve_Platinum_Backup.json");
    document.body.appendChild(downloadAnchorNode); // required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

window.triggerImport = function() { 
    triggerHaptic(30);
    const fileInput = document.getElementById('import-file');
    if(fileInput) fileInput.click(); 
    else alert("Import element missing in HTML!");
};

// Actual functional Import logic
window.importData = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Restore Settings
            if (importedData.settings) {
                if(importedData.settings.theme) applySetting('theme', importedData.settings.theme);
                if(importedData.settings.haptic) applySetting('haptic', importedData.settings.haptic);
                if(importedData.settings.wake) applySetting('wake', importedData.settings.wake);
            }

            // Restore History
            if (importedData.history && Array.isArray(importedData.history)) {
                historyData = importedData.history;
                localStorage.setItem('qs_history', JSON.stringify(historyData));
            }

            triggerHaptic([50, 50, 100]); // Success pattern
            alert("Data Imported Successfully! Platinum Restored. 🚀");
            location.reload();

        } catch (err) {
            triggerHaptic([100, 50, 100, 50, 100]); // Error rumble
            console.error("Import Error:", err);
            alert("Invalid Backup File! Please use a valid QuickSolve JSON backup.");
        }
    };
    reader.readAsText(file);
};

window.clearData = function() { 
    triggerHaptic([50, 100, 50, 100]);
    if(confirm('WARNING: This will obliterate all your history and settings. Proceed?')) { 
        localStorage.clear(); 
        location.reload(); 
    }
};
