import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Brain, 
  Moon, 
  BookOpen, 
  Pill, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  Heart,
  Zap,
  Shield,
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

interface DashboardProps {
  journalEntries: JournalEntry[];
  moodEntries: MoodEntry[];
}

export function Dashboard({ journalEntries, moodEntries }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayJournal = journalEntries.find(entry => entry.date === today);
  
  // Get today's mood entries
  const todayMoodEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
    return entryDate === today;
  });
  
  // Calculate averages for the last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentJournalEntries = journalEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekAgo;
  });

  const recentMoodEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= weekAgo;
  });

  // Mood averages from mood tracker
  const avgMood = recentMoodEntries.length > 0 
    ? recentMoodEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentMoodEntries.length 
    : 0;
  
  const avgAnxiety = recentMoodEntries.length > 0 
    ? recentMoodEntries.reduce((sum, entry) => sum + entry.anxiety, 0) / recentMoodEntries.length 
    : 0;

  const avgEnergy = recentMoodEntries.length > 0 
    ? recentMoodEntries.reduce((sum, entry) => sum + entry.energy, 0) / recentMoodEntries.length 
    : 0;

  const avgStress = recentMoodEntries.length > 0 
    ? recentMoodEntries.reduce((sum, entry) => sum + entry.stress, 0) / recentMoodEntries.length 
    : 0;
  
  // Journal averages
  const avgSleep = recentJournalEntries.length > 0 
    ? recentJournalEntries.reduce((sum, entry) => sum + entry.sleepHours, 0) / recentJournalEntries.length 
    : 0;
  
  const avgStudy = recentJournalEntries.length > 0 
    ? recentJournalEntries.reduce((sum, entry) => sum + entry.studyHours, 0) / recentJournalEntries.length 
    : 0;

  // Calculate medication adherence
  const totalMeds = recentJournalEntries.reduce((sum, entry) => sum + entry.medications.length, 0);
  const takenMeds = recentJournalEntries.reduce((sum, entry) => 
    sum + entry.medications.filter(med => med.taken).length, 0
  );
  const medicationAdherence = totalMeds > 0 ? (takenMeds / totalMeds) * 100 : 0;

  // Count psychotic symptoms in last 7 days
  const psychoticSymptomDays = recentMoodEntries.filter(entry => entry.psychoticSymptoms.length > 0).length;

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'mood-excellent';
    if (mood >= 6) return 'mood-good';
    if (mood >= 4) return 'mood-neutral';
    if (mood >= 2) return 'mood-poor';
    return 'mood-terrible';
  };

  const getAnxietyColor = (anxiety: number) => {
    if (anxiety <= 3) return 'mood-excellent';
    if (anxiety <= 6) return 'mood-neutral';
    return 'mood-terrible';
  };

  const getLatestMood = () => {
    if (todayMoodEntries.length > 0) {
      return todayMoodEntries[todayMoodEntries.length - 1];
    }
    return null;
  };

  const latestMood = getLatestMood();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-[rgba(255,255,255,1)]">Selamat datang di Jurnal Medis Anda</h1>
        <p className="text-[rgba(255,255,255,0.8)] mt-2">
          Pantau kesehatan mental dan kemajuan studi Anda
        </p>
      </div>

      {/* Today's Status */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Status Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {latestMood ? (
              <>
                <div className="text-center">
                  <div className={`text-2xl font-semibold ${getMoodColor(latestMood.mood)}`}>
                    {latestMood.mood}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Mood</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(latestMood.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-semibold ${getAnxietyColor(latestMood.anxiety)}`}>
                    {latestMood.anxiety}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Kecemasan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-yellow-600">
                    {latestMood.energy}/10
                  </div>
                  <div className="text-sm text-muted-foreground">Energi</div>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center text-muted-foreground">
                Belum ada mood tracker hari ini
              </div>
            )}
            {todayJournal ? (
              <>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-600">
                    {todayJournal.sleepHours}h
                  </div>
                  <div className="text-sm text-muted-foreground">Tidur</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-green-600">
                    {todayJournal.studyHours}h
                  </div>
                  <div className="text-sm text-muted-foreground">Belajar</div>
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center text-muted-foreground">
                Belum ada jurnal hari ini
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rata-rata Mood</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{avgMood.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">
              {recentMoodEntries.length} entri (7 hari)
            </p>
            <Progress value={avgMood * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rata-rata Energi</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{avgEnergy.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">
              {recentMoodEntries.length} entri (7 hari)
            </p>
            <Progress value={avgEnergy * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rata-rata Tidur</CardTitle>
            <Moon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{avgSleep.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {recentJournalEntries.length} entri (7 hari)
            </p>
            <Progress value={(avgSleep / 8) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Kepatuhan Obat</CardTitle>
            <Pill className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{medicationAdherence.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalMeds} obat (7 hari)
            </p>
            <Progress value={medicationAdherence} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tingkat Kecemasan</CardTitle>
            <Brain className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{avgAnxiety.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">
              Rata-rata 7 hari terakhir
            </p>
            <Progress value={avgAnxiety * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tingkat Stress</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{avgStress.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">
              Rata-rata 7 hari terakhir
            </p>
            <Progress value={avgStress * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rata-rata Belajar</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{avgStudy.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {recentJournalEntries.length} entri (7 hari)
            </p>
            <Progress value={(avgStudy / 8) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Health Alerts */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Peringatan Kesehatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {avgMood < 4 && (
              <div className="flex items-center p-3 glass-dark rounded-lg border border-red-300/30 bg-mood-terrible">
                <TrendingDown className="h-4 w-4 text-white mr-2" />
                <span className="text-sm text-white">
                  Mood Anda cenderung rendah minggu ini. Pertimbangkan untuk berkonsultasi dengan dokter.
                </span>
              </div>
            )}
            
            {avgAnxiety > 7 && (
              <div className="flex items-center p-3 glass-dark rounded-lg border border-orange-300/30 bg-mood-poor">
                <TrendingUp className="h-4 w-4 text-white mr-2" />
                <span className="text-sm text-white">
                  Tingkat kecemasan Anda tinggi minggu ini. Coba teknik relaksasi.
                </span>
              </div>
            )}
            
            {avgSleep < 6 && (
              <div className="flex items-center p-3 glass rounded-lg border border-blue-300/30" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <Moon className="h-4 w-4 text-white mr-2" />
                <span className="text-sm text-white">
                  Anda kurang tidur minggu ini. Tidur yang cukup penting untuk kesehatan mental.
                </span>
              </div>
            )}
            
            {medicationAdherence < 80 && totalMeds > 0 && (
              <div className="flex items-center p-3 glass rounded-lg border border-purple-300/30" style={{background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
                <Pill className="h-4 w-4 text-gray-700 mr-2" />
                <span className="text-sm text-gray-700">
                  Kepatuhan obat Anda di bawah 80%. Konsistensi minum obat penting untuk stabilitas.
                </span>
              </div>
            )}

            {psychoticSymptomDays > 3 && (
              <div className="flex items-center p-3 glass-dark rounded-lg border border-red-300/30 bg-mood-terrible">
                <Brain className="h-4 w-4 text-white mr-2" />
                <span className="text-sm text-white">
                  Anda melaporkan gejala psikotik selama {psychoticSymptomDays} hari minggu ini. 
                  Segera hubungi dokter Anda.
                </span>
              </div>
            )}

            {avgMood >= 7 && avgAnxiety <= 3 && avgSleep >= 7 && medicationAdherence >= 90 && (
              <div className="flex items-center p-3 glass rounded-lg border border-green-300/30 bg-mood-excellent">
                <TrendingUp className="h-4 w-4 text-white mr-2" />
                <span className="text-sm text-white">
                  Luar biasa! Kondisi Anda stabil minggu ini. Terus pertahankan rutinitas yang baik.
                </span>
              </div>
            )}

            {avgMood === 0 && avgAnxiety === 0 && recentMoodEntries.length === 0 && (
              <div className="flex items-center p-3 glass rounded-lg border border-blue-300/30" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <Heart className="h-4 w-4 text-white mr-2" />
                <span className="text-sm text-white">
                  Mulai gunakan mood tracker untuk mendapatkan insight tentang kesehatan mental Anda.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Companion Info */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircleHeart className="h-5 w-5 mr-2 text-pink-500" />
            AI Companion Tersedia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
              <MessageCircleHeart className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white mb-2">Butuh seseorang untuk diajak bicara?</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-3">
                AI Companion kami siap mendengarkan curhatanmu kapan saja. Tersedia 24/7 untuk memberikan dukungan emosional dan membantu mengelola stress.
              </p>
              <div className="flex items-center space-x-4 text-sm text-white/70">
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>Empati & dukungan</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Privat & aman</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Entri Jurnal Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {journalEntries.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    {new Date(entry.date).toLocaleDateString('id-ID', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                  {entry.clinicalRotation && (
                    <Badge variant="outline">{entry.clinicalRotation}</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{entry.studyHours}h belajar</span>
                </div>
              </div>
            ))}
            {journalEntries.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Belum ada entri jurnal. Mulai dengan menulis entri pertama Anda!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Mood Tracker Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {moodEntries.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    {new Date(entry.timestamp).toLocaleDateString('id-ID', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                  <Badge variant={entry.mood >= 7 ? 'default' : entry.mood >= 4 ? 'secondary' : 'destructive'}>
                    Mood: {entry.mood}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(entry.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {moodEntries.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Belum ada mood tracker. Mulai dengan mencatat mood Anda!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}