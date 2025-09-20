import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Eye, Heart, Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

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

interface CalendarViewProps {
  journalEntries: JournalEntry[];
  moodEntries: MoodEntry[];
  onDateSelect: (date: string) => void;
}

export function CalendarView({ journalEntries, moodEntries, onDateSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getFirstDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  };

  const getLastDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  };

  const getDaysInMonth = () => {
    const firstDay = getFirstDayOfMonth();
    const lastDay = getLastDayOfMonth();
    const days = [];

    // Add empty cells for days before the first day of the month
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    return days;
  };

  const getJournalEntryForDate = (date: Date | null) => {
    if (!date) return null;
    const dateString = date.toISOString().split('T')[0];
    return journalEntries.find(entry => entry.date === dateString);
  };

  const getMoodEntriesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return moodEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDate === dateString;
    });
  };

  const getAverageMoodForDate = (date: Date | null) => {
    const moodsForDate = getMoodEntriesForDate(date);
    if (moodsForDate.length === 0) return null;
    return moodsForDate.reduce((sum, entry) => sum + entry.mood, 0) / moodsForDate.length;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50';
    if (mood >= 6) return 'bg-gradient-to-r from-green-300 to-green-400 shadow-lg shadow-green-400/50';
    if (mood >= 4) return 'bg-gradient-to-r from-yellow-300 to-amber-400 shadow-lg shadow-yellow-400/50';
    if (mood >= 2) return 'bg-gradient-to-r from-orange-400 to-red-400 shadow-lg shadow-orange-400/50';
    return 'bg-gradient-to-r from-red-400 to-pink-500 shadow-lg shadow-red-400/50';
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center text-white">
            <Calendar className="h-8 w-8 mr-3" />
            Kalender Jurnal
          </h1>
          <p className="text-white/80 mt-2">
            Lihat entri jurnal dan mood tracker Anda dalam tampilan kalender
          </p>
        </div>
        <Button onClick={goToToday} variant="outline" className="glass">
          Hari Ini
        </Button>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousMonth}
                className="glass"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextMonth}
                className="glass"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              const journalEntry = getJournalEntryForDate(date);
              const moodEntries = getMoodEntriesForDate(date);
              const avgMood = getAverageMoodForDate(date);
              const hasJournal = !!journalEntry;
              const hasMood = moodEntries.length > 0;
              const hasAnyData = hasJournal || hasMood;
              
              return (
                <div key={index} className="aspect-square">
                  {date ? (
                    <div
                      className={`
                        h-full w-full p-1 border rounded cursor-pointer hover:bg-accent transition-colors glass-dark
                        ${isToday(date) ? 'border-primary bg-primary/20' : 'border-border/30'}
                        ${hasAnyData ? 'bg-muted/30' : ''}
                      `}
                      onClick={() => onDateSelect(date.toISOString().split('T')[0])}
                    >
                      <div className="flex flex-col h-full">
                        <div className="text-sm font-medium mb-1 text-white">
                          {date.getDate()}
                        </div>
                        <div className="flex-1 space-y-1">
                          {avgMood !== null && (
                            <div 
                              className={`w-2 h-2 rounded-full ${getMoodColor(avgMood)}`}
                              title={`Mood rata-rata: ${avgMood.toFixed(1)}/10 (${moodEntries.length} entri)`}
                            />
                          )}
                          {hasJournal && journalEntry.studyHours > 0 && (
                            <div className="text-xs text-white/70">
                              {journalEntry.studyHours}h
                            </div>
                          )}
                          {moodEntries.some(entry => entry.psychoticSymptoms.length > 0) && (
                            <div className="w-2 h-2 bg-red-600 rounded-full" title="Gejala psikotik" />
                          )}
                          {moodEntries.length > 1 && (
                            <div className="text-xs text-blue-400">
                              {moodEntries.length}x
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="mb-3 font-medium">Mood Tracker</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm" />
                  <span className="text-sm">Sangat Baik (8-10)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-300 to-green-400 rounded-full shadow-sm" />
                  <span className="text-sm">Baik (6-7)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full shadow-sm" />
                  <span className="text-sm">Netral (4-5)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full shadow-sm" />
                  <span className="text-sm">Buruk (2-3)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-sm" />
                  <span className="text-sm">Sangat Buruk (1)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-medium">Indikator Lain</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full" />
                  <span className="text-sm">Gejala Psikotik</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Xh</span>
                  <span className="text-sm">Jam Belajar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-400">Xx</span>
                  <span className="text-sm">Jumlah Mood Entry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-primary rounded" />
                  <span className="text-sm">Hari Ini</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Mood Tracker Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodEntries.slice(-7).reverse().map((entry) => (
                <Dialog key={entry.id}>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-accent transition-colors glass">
                      <div className="flex items-center space-x-3">
                        <div 
                          className={`w-3 h-3 rounded-full ${getMoodColor(entry.mood)}`}
                          title={`Mood: ${entry.mood}/10`}
                        />
                        <div>
                          <div className="font-medium">
                            {new Date(entry.timestamp).toLocaleDateString('id-ID', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {entry.location && ` • ${entry.location}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {entry.psychoticSymptoms.length > 0 && (
                          <Badge variant="destructive">Gejala</Badge>
                        )}
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        Mood Tracker - {new Date(entry.timestamp).toLocaleString('id-ID')}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-medium">{entry.mood}/10</div>
                          <div className="text-sm text-muted-foreground">Mood</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-medium">{entry.anxiety}/10</div>
                          <div className="text-sm text-muted-foreground">Kecemasan</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-medium">{entry.energy}/10</div>
                          <div className="text-sm text-muted-foreground">Energi</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-medium">{entry.stress}/10</div>
                          <div className="text-sm text-muted-foreground">Stress</div>
                        </div>
                      </div>
                      
                      {entry.psychoticSymptoms.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Gejala Psikotik</h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.psychoticSymptoms.map((symptom, index) => (
                              <Badge key={index} variant="destructive">{symptom}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {entry.triggers && (
                        <div>
                          <h4 className="font-medium mb-2">Pemicu</h4>
                          <p className="whitespace-pre-wrap">{entry.triggers}</p>
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div>
                          <h4 className="font-medium mb-2">Catatan</h4>
                          <p className="whitespace-pre-wrap">{entry.notes}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {entry.location && (
                          <div>
                            <span className="font-medium">Lokasi: </span>
                            {entry.location}
                          </div>
                        )}
                        {entry.weather && (
                          <div>
                            <span className="font-medium">Cuaca: </span>
                            {entry.weather}
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
              {moodEntries.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Belum ada mood tracker.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Jurnal Terbaru</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {journalEntries.slice(-7).reverse().map((entry) => (
                <Dialog key={entry.id}>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-accent transition-colors glass">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">
                            {formatDate(new Date(entry.date))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.clinicalRotation && `${entry.clinicalRotation} • `}
                            {entry.studyHours}h belajar
                          </div>
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{formatDate(new Date(entry.date))}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-medium">{entry.sleepHours}h</div>
                          <div className="text-sm text-muted-foreground">Tidur</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-medium">{entry.studyHours}h</div>
                          <div className="text-sm text-muted-foreground">Belajar</div>
                        </div>
                      </div>
                      
                      {entry.clinicalRotation && (
                        <div>
                          <h4 className="font-medium mb-2">Rotasi Klinik</h4>
                          <p>{entry.clinicalRotation}</p>
                        </div>
                      )}
                      
                      {entry.journalText && (
                        <div>
                          <h4 className="font-medium mb-2">Jurnal</h4>
                          <p className="whitespace-pre-wrap">{entry.journalText}</p>
                        </div>
                      )}
                      
                      {entry.gratitude && (
                        <div>
                          <h4 className="font-medium mb-2">Rasa Syukur</h4>
                          <p className="whitespace-pre-wrap">{entry.gratitude}</p>
                        </div>
                      )}
                      
                      {entry.goals && (
                        <div>
                          <h4 className="font-medium mb-2">Tujuan</h4>
                          <p className="whitespace-pre-wrap">{entry.goals}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
              {journalEntries.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Belum ada entri jurnal.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}