import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Toaster } from './components/ui/sonner';
import { Dashboard } from './components/dashboard';
import { JournalEntryForm } from './components/journal-entry-form';
import { MoodTracker } from './components/mood-tracker';
import { Analytics } from './components/analytics';
import { CalendarView } from './components/calendar-view';
import { AIChatbot } from './components/ai-chatbot';
import { 
  Home, 
  PenTool, 
  BarChart3, 
  Calendar, 
  Menu,
  Brain,
  Heart,
  Settings,
  Info,
  Smile,
  MessageCircleHeart
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  medications: Array<{ name: string; taken: boolean; time: string }>;
  sleepHours: number;
  sleepQuality: number;
  studyHours: number;
  studySubjects: string;
  clinicalRotation: string;
  journalText: string;
  gratitude: string;
  goals: string;
  wellness: string;
  challenges: string;
  learnings: string;
}

interface MoodEntry {
  id: string;
  timestamp: string;
  mood: number;
  anxiety: number;
  energy: number;
  stress: number;
  psychoticSymptoms: string[];
  triggers: string;
  notes: string;
  location?: string;
  weather?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedJournalEntries = localStorage.getItem('journalEntries');
    const savedMoodEntries = localStorage.getItem('moodEntries');
    
    if (savedJournalEntries) {
      try {
        setJournalEntries(JSON.parse(savedJournalEntries));
      } catch (error) {
        console.error('Error loading journal entries:', error);
      }
    }

    if (savedMoodEntries) {
      try {
        setMoodEntries(JSON.parse(savedMoodEntries));
      } catch (error) {
        console.error('Error loading mood entries:', error);
      }
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
  }, [moodEntries]);

  const handleSaveJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prevEntries => {
      const existingIndex = prevEntries.findIndex(e => e.id === entry.id);
      if (existingIndex >= 0) {
        // Update existing entry
        const updatedEntries = [...prevEntries];
        updatedEntries[existingIndex] = entry;
        return updatedEntries;
      } else {
        // Add new entry
        return [...prevEntries, entry];
      }
    });
    
    // Switch back to dashboard after saving
    setActiveTab('dashboard');
  };

  const handleSaveMoodEntry = (entry: MoodEntry) => {
    setMoodEntries(prevEntries => {
      const existingIndex = prevEntries.findIndex(e => e.id === entry.id);
      if (existingIndex >= 0) {
        // Update existing entry
        const updatedEntries = [...prevEntries];
        updatedEntries[existingIndex] = entry;
        return updatedEntries;
      } else {
        // Add new entry
        return [...prevEntries, entry];
      }
    });
    
    // Stay on mood tracker after saving to allow multiple entries
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setActiveTab('journal');
  };

  const getSelectedJournalEntry = () => {
    if (!selectedDate) return undefined;
    return journalEntries.find(entry => entry.date === selectedDate);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'mood', label: 'Mood Tracker', icon: Smile },
    { id: 'journal', label: 'Tulis Jurnal', icon: PenTool },
    { id: 'chatbot', label: 'AI Companion', icon: MessageCircleHeart },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'analytics', label: 'Analitik', icon: BarChart3 },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{background: 'var(--background)'}}>
        <Sidebar className="border-r backdrop-blur-sm" style={{background: 'var(--sidebar)'}}>
          <SidebarHeader className="border-b p-4" style={{borderColor: 'var(--sidebar-border)'}}>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg glass">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Jurnal Medis</h2>
                <p className="text-xs opacity-80 text-white">Kesehatan Mental & Studi</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === 'journal') {
                        setSelectedDate(new Date().toISOString().split('T')[0]);
                      } else {
                        setSelectedDate(null);
                      }
                    }}
                    isActive={activeTab === item.id}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-4" style={{borderColor: 'var(--sidebar-border)'}}>
            <div className="flex items-center space-x-2 text-sm text-white opacity-90">
              <Heart className="h-4 w-4 text-pink-300" />
              <span>Kesehatan mental itu penting</span>
            </div>
            <div className="mt-2 p-2 glass rounded-lg">
              <div className="flex items-center space-x-2 text-xs text-white opacity-90">
                <Info className="h-3 w-3" />
                <span>Jika merasa dalam krisis, segera hubungi tenaga medis profesional.</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b backdrop-blur-md glass">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">
                <div className="text-sm text-foreground/80 px-3 py-1 rounded-full glass text-[rgba(255,255,255,0.8)]">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {activeTab === 'dashboard' && (
              <Dashboard journalEntries={journalEntries} moodEntries={moodEntries} />
            )}

            {activeTab === 'mood' && (
              <MoodTracker 
                onSave={handleSaveMoodEntry}
              />
            )}

            {activeTab === 'journal' && (
              <JournalEntryForm 
                onSave={handleSaveJournalEntry}
                existingEntry={getSelectedJournalEntry()}
              />
            )}

            {activeTab === 'chatbot' && (
              <AIChatbot />
            )}

            {activeTab === 'calendar' && (
              <CalendarView 
                journalEntries={journalEntries}
                moodEntries={moodEntries}
                onDateSelect={handleDateSelect}
              />
            )}

            {activeTab === 'analytics' && (
              <Analytics journalEntries={journalEntries} moodEntries={moodEntries} />
            )}
          </div>
        </main>
      </div>
      
      <Toaster />
    </SidebarProvider>
  );
}