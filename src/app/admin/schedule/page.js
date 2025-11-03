'use client';

import { useState, useEffect } from 'react';
import AdminProtect from '../../../../components/AdminProtect';

const AdminSchedule = () => {
  const [settings, setSettings] = useState(null);
  const [savedSettings, setSavedSettings] = useState(null); // Data yang sudah disimpan di database
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Status sedang mengedit
  const [schedule, setSchedule] = useState({
    monday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
    tuesday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
    wednesday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
    thursday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
    friday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
    saturday: [{ open: '08:00', close: '15:00' }],
    sunday: []
  });

  const dayNames = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sunday: 'Minggu'
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Force 24-hour format after schedule updates
  useEffect(() => {
    const timeInputs = document.querySelectorAll('input[type="time"].time-24h');
    timeInputs.forEach(input => {
      // Set browser attributes for 24-hour format
      input.setAttribute('data-time-format', '24');
      input.setAttribute('data-use-24hour', 'true');
      input.style.setProperty('--time-format', '24');
      
      // Force re-render to apply format changes
      const currentValue = input.value;
      if (currentValue) {
        input.value = '';
        setTimeout(() => {
          input.value = currentValue;
        }, 0);
      }
    });
    
    // Additional global force for all time inputs
    setTimeout(() => {
      // Override browser locale detection
      const allTimeInputs = document.querySelectorAll('input[type="time"]');
      allTimeInputs.forEach(input => {
        // Force browser to use 24-hour format
        input.lang = 'en-GB'; // UK locale uses 24-hour format
        input.setAttribute('data-format', '24');
        input.setAttribute('data-time-format', 'HH:mm');
        
        // Override any system AM/PM settings
        const shadowRoot = input.shadowRoot;
        if (shadowRoot) {
          try {
            const ampmElement = shadowRoot.querySelector('[pseudo="-webkit-datetime-edit-ampm-field"]');
            if (ampmElement) {
              ampmElement.style.display = 'none';
              ampmElement.remove();
            }
          } catch (_e) {
            console.log('Cannot access shadow DOM');
          }
        }
      });
    }, 100);
  }, [schedule, isEditing]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/store-settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        setSavedSettings(data.data); // Simpan data yang sudah tersimpan di database
        if (data.data.operatingHours) {
          setSchedule(data.data.operatingHours);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleTime = (day, sessionIndex, timeType, value) => {
    // Validasi format 24 jam
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      alert('Format waktu harus 24 jam (contoh: 08:00, 20:30)');
      return;
    }

    setIsEditing(true); // Tandai sedang mengedit
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((session, index) => 
        index === sessionIndex 
          ? { ...session, [timeType]: value }
          : session
      )
    }));
  };

  const addSession = (day) => {
    setIsEditing(true); // Tandai sedang mengedit
    setSchedule(prev => ({
      ...prev,
      [day]: [...prev[day], { open: '08:00', close: '17:00' }]
    }));
  };

  const removeSession = (day, sessionIndex) => {
    setIsEditing(true); // Tandai sedang mengedit
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].filter((_, index) => index !== sessionIndex)
    }));
  };

  const toggleDayClosed = (day) => {
    setIsEditing(true); // Tandai sedang mengedit
    if (schedule[day].length === 0) {
      // Jika tutup, buka dengan jadwal default
      setSchedule(prev => ({
        ...prev,
        [day]: [{ open: '08:00', close: '17:00' }]
      }));
    } else {
      // Jika buka, tutup hari ini
      setSchedule(prev => ({
        ...prev,
        [day]: []
      }));
    }
  };

  const copyToAllDays = (sourceDay) => {
    const sourceSessions = schedule[sourceDay];
    if (confirm(`Salin jadwal ${dayNames[sourceDay]} ke semua hari lainnya?`)) {
      setIsEditing(true); // Tandai sedang mengedit
      setSchedule(prev => {
        const newSchedule = { ...prev };
        Object.keys(newSchedule).forEach(day => {
          if (day !== sourceDay) {
            newSchedule[day] = [...sourceSessions];
          }
        });
        return newSchedule;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          operatingHours: schedule
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
        setSavedSettings(result.data); // Update data yang sudah disimpan
        setIsEditing(false); // Selesai mengedit
        alert('Jadwal operasional berhasil diperbarui!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Gagal menyimpan jadwal');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentStatus = () => {
    // Jika tidak ada data yang tersimpan atau sedang mengedit, return status default
    if (!savedSettings?.operatingHours) {
      return { isOpen: false, currentSession: null, nextSession: null, todayKey: null };
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Convert day number to day name key
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[currentDay];
    // Gunakan data yang sudah disimpan, bukan yang sedang diedit
    const todaySchedule = savedSettings.operatingHours[todayKey] || [];

    let isOpen = false;
    let currentSession = null;
    let nextSession = null;

    // Check if currently open
    for (const session of todaySchedule) {
      const openTime = timeToMinutes(session.open);
      const closeTime = timeToMinutes(session.close);
      
      if (currentTime >= openTime && currentTime < closeTime) {
        isOpen = true;
        currentSession = session;
        break;
      }
    }

    // Find next session if closed
    if (!isOpen) {
      for (const session of todaySchedule) {
        const openTime = timeToMinutes(session.open);
        if (currentTime < openTime) {
          nextSession = session;
          break;
        }
      }
    }

    return { isOpen, currentSession, nextSession, todayKey };
  };

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Ensure 24-hour format on component mount
  useEffect(() => {
    // Add CSS to force 24-hour format
    const style = document.createElement('style');
    style.textContent = `
      /* Force 24-hour format - hide AM/PM */
      .time-24h::-webkit-datetime-edit-ampm-field,
      input[type="time"]::-webkit-datetime-edit-ampm-field {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        opacity: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        left: -9999px !important;
      }
      
      /* Style hour and minute fields */
      .time-24h::-webkit-datetime-edit-hour-field,
      .time-24h::-webkit-datetime-edit-minute-field {
        color: #111827 !important;
        font-weight: 500;
      }
      
      /* Remove default appearance */
      .time-24h {
        -webkit-appearance: none !important;
        -moz-appearance: textfield !important;
        appearance: none !important;
      }
      
      /* Global override for time inputs */
      input[type="time"] {
        --time-format: 24 !important;
      }
      
      /* Additional browser-specific overrides */
      .time-24h::-webkit-inner-spin-button,
      .time-24h::-webkit-calendar-picker-indicator {
        -webkit-appearance: none !important;
        margin: 0 !important;
      }
      
      /* Firefox specific */
      @-moz-document url-prefix() {
        .time-24h {
          -moz-appearance: textfield !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Set browser locale to force 24-hour format
    try {
      // Try to set system locale for 24-hour format
      const inputs = document.querySelectorAll('input[type="time"].time-24h');
      inputs.forEach(input => {
        input.setAttribute('data-time-format', '24');
        input.style.setProperty('--time-format', '24');
        // Force re-render
        const value = input.value;
        input.value = '';
        input.value = value;
      });
    } catch (_e) {
      console.log('Locale setting not supported in this browser');
    }

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const status = getCurrentStatus();

  return (
    <AdminProtect>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jadwal Operasional</h1>
              <p className="mt-2 text-gray-600">Kelola jam buka dan tutup toko Anda</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Simpan Jadwal</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Status atau Editing Status */}
        <div className="mb-8">
          {isEditing ? (
            <div className="p-6 rounded-lg border-2 bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    ✏️ Mode Edit Jadwal
                  </h3>
                  <p className="text-sm text-yellow-600">
                    Anda sedang mengedit jadwal operasional. Klik &quot;Simpan Jadwal&quot; untuk menyimpan perubahan.
                  </p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-yellow-100">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="font-medium text-sm text-yellow-700">EDIT</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-6 rounded-lg border-2 ${status.isOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${status.isOpen ? 'text-green-800' : 'text-red-800'}`}>
                    Status Toko Saat Ini
                  </h3>
                  <p className={`text-sm ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    {status.isOpen 
                      ? `BUKA - Tutup pukul ${status.currentSession?.close} WIB`
                      : status.nextSession 
                        ? `TUTUP - Buka lagi pukul ${status.nextSession.open} WIB`
                        : 'TUTUP - Tidak ada sesi lagi hari ini'
                    }
                  </p>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${status.isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className={`w-3 h-3 rounded-full ${status.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`font-medium text-sm ${status.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                    {status.isOpen ? 'BUKA' : 'TUTUP'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Settings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Pengaturan Jadwal Mingguan</h2>
            <p className="text-sm text-gray-600">Atur jam operasional untuk setiap hari (semua waktu dalam WIB - Waktu Indonesia Barat)</p>
            <div className="mt-2 flex items-center p-3 bg-blue-50 rounded-md border border-blue-200">
              <span className="text-blue-600 mr-3 text-lg">🕐</span>
              <div className="flex-1">
                <span className="text-sm text-blue-800 font-medium">
                  <strong>Format Waktu WIB (24 Jam):</strong>
                </span>
                <div className="text-xs text-blue-700 mt-1 space-y-1">
                  <div>• <strong>Pagi:</strong> 08:00, 09:30, 11:45</div>
                  <div>• <strong>Siang:</strong> 12:00, 13:15, 15:30</div>
                  <div>• <strong>Malam:</strong> 18:00, 20:30, 22:00</div>
                  <div className="text-blue-600 font-medium">⚠️ Tidak ada AM/PM - gunakan 00:00 sampai 23:59</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {Object.entries(schedule).map(([dayKey, sessions]) => (
              <div key={dayKey} className={`p-4 border rounded-lg ${status.todayKey === dayKey ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dayNames[dayKey]}
                      {status.todayKey === dayKey && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Hari Ini
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => toggleDayClosed(dayKey)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        sessions.length === 0
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {sessions.length === 0 ? '🚫 TUTUP' : '✅ BUKA'}
                    </button>
                  </div>
                  
                  {sessions.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToAllDays(dayKey)}
                        className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-md"
                      >
                        📋 Salin ke Semua
                      </button>
                      <button
                        onClick={() => addSession(dayKey)}
                        className="text-sm text-green-600 hover:text-green-800 bg-green-50 px-3 py-1 rounded-md"
                      >
                        ➕ Tambah Sesi
                      </button>
                    </div>
                  )}
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <span className="text-2xl">😴</span>
                    <p className="mt-2 text-sm">Hari {dayNames[dayKey]} toko tutup</p>
                    <button
                      onClick={() => toggleDayClosed(dayKey)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Klik untuk buka hari ini
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Sesi {sessionIndex + 1}:</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Buka (WIB):</label>
                          <input
                            type="time"
                            value={session.open}
                            onChange={(e) => updateScheduleTime(dayKey, sessionIndex, 'open', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 time-24h"
                            step="300"
                            min="00:00"
                            max="23:59"
                            pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                            title="Format: 24 jam (00:00 - 23:59 WIB)"
                            data-format="24"
                            data-time-format="24"
                            data-use-24hour="true"
                            locale="en-GB"
                            lang="en-GB"
                            aria-label="Jam buka dalam format 24 jam"
                            placeholder="HH:MM"
                            onFocus={(e) => {
                              // Force 24-hour format
                              e.target.setAttribute('data-time-format', '24');
                              e.target.setAttribute('data-use-24hour', 'true');
                              e.target.style.setProperty('--time-format', '24');
                              
                              // Additional browser-specific handling
                              if (e.target.showPicker) {
                                setTimeout(() => {
                                  try {
                                    e.target.showPicker();
                                  } catch (_err) {
                                    console.log('showPicker not supported');
                                  }
                                }, 100);
                              }
                            }}
                            onClick={(e) => {
                              // Ensure 24-hour format on click
                              e.target.setAttribute('data-time-format', '24');
                              e.target.style.setProperty('--time-format', '24');
                            }}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">Tutup (WIB):</label>
                          <input
                            type="time"
                            value={session.close}
                            onChange={(e) => updateScheduleTime(dayKey, sessionIndex, 'close', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 time-24h"
                            step="300"
                            min="00:00"
                            max="23:59"
                            pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                            title="Format: 24 jam (00:00 - 23:59 WIB)"
                            data-format="24"
                            data-time-format="24"
                            data-use-24hour="true"
                            locale="en-GB"
                            lang="en-GB"
                            aria-label="Jam tutup dalam format 24 jam"
                            placeholder="HH:MM"
                            onFocus={(e) => {
                              // Force 24-hour format
                              e.target.setAttribute('data-time-format', '24');
                              e.target.setAttribute('data-use-24hour', 'true');
                              e.target.style.setProperty('--time-format', '24');
                              
                              // Additional browser-specific handling
                              if (e.target.showPicker) {
                                setTimeout(() => {
                                  try {
                                    e.target.showPicker();
                                  } catch (_err) {
                                    console.log('showPicker not supported');
                                  }
                                }, 100);
                              }
                            }}
                            onClick={(e) => {
                              // Ensure 24-hour format on click
                              e.target.setAttribute('data-time-format', '24');
                              e.target.style.setProperty('--time-format', '24');
                            }}
                          />
                        </div>
                        
                        {sessions.length > 1 && (
                          <button
                            onClick={() => removeSession(dayKey, sessionIndex)}
                            className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded text-sm"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                if (confirm('Set jadwal standar toko perhiasan (Senin-Jumat: 08:00-12:00 & 16:00-19:00, Sabtu: 08:00-15:00)?')) {
                  setIsEditing(true); // Tandai sedang mengedit
                  setSchedule({
                    monday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
                    tuesday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
                    wednesday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
                    thursday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
                    friday: [{ open: '08:00', close: '12:00' }, { open: '16:00', close: '19:00' }],
                    saturday: [{ open: '08:00', close: '15:00' }],
                    sunday: []
                  });
                }
              }}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium text-gray-900">🏪 Jadwal Standar</div>
              <div className="text-sm text-gray-600 mt-1">Senin-Jumat: 08:00-12:00 & 16:00-19:00 WIB</div>
            </button>
            
            <button
              onClick={() => {
                if (confirm('Set jadwal full time (Senin-Sabtu: 08:00-20:00)?')) {
                  setIsEditing(true); // Tandai sedang mengedit
                  setSchedule({
                    monday: [{ open: '08:00', close: '20:00' }],
                    tuesday: [{ open: '08:00', close: '20:00' }],
                    wednesday: [{ open: '08:00', close: '20:00' }],
                    thursday: [{ open: '08:00', close: '20:00' }],
                    friday: [{ open: '08:00', close: '20:00' }],
                    saturday: [{ open: '08:00', close: '20:00' }],
                    sunday: []
                  });
                }
              }}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium text-gray-900">⏰ Full Time</div>
              <div className="text-sm text-gray-600 mt-1">Senin-Sabtu: 08:00-20:00 WIB</div>
            </button>
            
            <button
              onClick={() => {
                if (confirm('Tutup semua hari untuk maintenance/libur?')) {
                  setIsEditing(true); // Tandai sedang mengedit
                  setSchedule({
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: []
                  });
                }
              }}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <div className="font-medium text-gray-900">🚫 Tutup Semua</div>
              <div className="text-sm text-gray-600 mt-1">Untuk maintenance/libur</div>
            </button>
          </div>
        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2 text-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Menyimpan Jadwal...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Simpan Perubahan Jadwal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </AdminProtect>
  );
};

export default AdminSchedule; 