import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Brain, Moon, BookOpen, Pill, TrendingUp, Calendar, Heart, Zap } from 'lucide-react';

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

interface AnalyticsProps {
  journalEntries: JournalEntry[];
  moodEntries: MoodEntry[];
}

export function Analytics({ journalEntries, moodEntries }: AnalyticsProps) {
  // Group mood entries by date for daily averages
  const moodByDate = moodEntries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, MoodEntry[]>);

  // Prepare mood trend data (daily averages)
  const moodTrendData = Object.entries(moodByDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-30) // Last 30 days
    .map(([date, entries]) => {
      const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
      const avgAnxiety = entries.reduce((sum, entry) => sum + entry.anxiety, 0) / entries.length;
      const avgEnergy = entries.reduce((sum, entry) => sum + entry.energy, 0) / entries.length;
      const avgStress = entries.reduce((sum, entry) => sum + entry.stress, 0) / entries.length;
      
      return {
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        mood: Math.round(avgMood * 10) / 10,
        anxiety: Math.round(avgAnxiety * 10) / 10,
        energy: Math.round(avgEnergy * 10) / 10,
        stress: Math.round(avgStress * 10) / 10,
        count: entries.length
      };
    });

  // Prepare journal-based data
  const journalTrendData = journalEntries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30) // Last 30 days
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      sleep: entry.sleepHours,
      study: entry.studyHours,
      sleepQuality: entry.sleepQuality
    }));

  // Prepare sleep data
  const sleepData = journalEntries
    .slice(-14) // Last 14 days
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      hours: entry.sleepHours,
      quality: entry.sleepQuality
    }));

  // Prepare study data by rotation
  const studyByRotation = journalEntries.reduce((acc, entry) => {
    if (entry.clinicalRotation) {
      acc[entry.clinicalRotation] = (acc[entry.clinicalRotation] || 0) + entry.studyHours;
    }
    return acc;
  }, {} as Record<string, number>);

  const rotationData = Object.entries(studyByRotation).map(([rotation, hours]) => ({
    rotation: rotation,
    hours: Math.round(hours * 10) / 10
  }));

  // Prepare medication adherence data
  const medicationData = journalEntries.slice(-7).map(entry => {
    const totalMeds = entry.medications.length;
    const takenMeds = entry.medications.filter(med => med.taken).length;
    const adherence = totalMeds > 0 ? (takenMeds / totalMeds) * 100 : 0;
    
    return {
      date: new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      adherence: Math.round(adherence)
    };
  });

  // Prepare psychotic symptoms data from mood entries
  const symptomCounts = moodEntries.reduce((acc, entry) => {
    entry.psychoticSymptoms.forEach(symptom => {
      acc[symptom] = (acc[symptom] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const symptomData = Object.entries(symptomCounts).map(([symptom, count]) => ({
    symptom: symptom,
    count: count
  }));

  // Mood statistics
  const avgMood = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length 
    : 0;
  
  const avgAnxiety = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.anxiety, 0) / moodEntries.length 
    : 0;

  const avgEnergy = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + entry.energy, 0) / moodEntries.length 
    : 0;

  const goodMoodDays = Object.values(moodByDate).filter(entries => {
    const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
    return avgMood >= 7;
  }).length;

  const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#faf089', '#ff9a9e', '#a8edea', '#764ba2', '#667eea'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-white">Analitik Kesehatan</h1>
        <p className="text-white/80 mt-2">
          Visualisasi pola kesehatan mental dan aktivitas belajar Anda
        </p>
      </div>

      <Tabs defaultValue="mood" className="w-full">
        <TabsList className="grid w-full grid-cols-5 glass">
          <TabsTrigger value="mood">Mood & Mental</TabsTrigger>
          <TabsTrigger value="sleep">Tidur</TabsTrigger>
          <TabsTrigger value="study">Belajar</TabsTrigger>
          <TabsTrigger value="medication">Obat</TabsTrigger>
          <TabsTrigger value="symptoms">Gejala</TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Heart className="h-5 w-5 mr-2" />
              <CardTitle>Tren Mood dan Kecemasan (30 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              {moodTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#43e97b" 
                      strokeWidth={3}
                      name="Mood"
                      dot={{ fill: '#43e97b', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="anxiety" 
                      stroke="#f093fb" 
                      strokeWidth={3}
                      name="Kecemasan"
                      dot={{ fill: '#f093fb', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada data mood tracker.</p>
                  <p className="text-sm">Mulai gunakan mood tracker untuk melihat analitik.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Zap className="h-5 w-5 mr-2" />
              <CardTitle>Tren Energi dan Stress</CardTitle>
            </CardHeader>
            <CardContent>
              {moodTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#faf089" 
                      strokeWidth={3}
                      name="Energi"
                      dot={{ fill: '#faf089', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stress" 
                      stroke="#ff9a9e" 
                      strokeWidth={3}
                      name="Stress"
                      dot={{ fill: '#ff9a9e', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Belum ada data energi dan stress.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {avgMood.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Rata-rata Mood</p>
              </CardContent>
            </Card>
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {avgAnxiety.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Rata-rata Kecemasan</p>
              </CardContent>
            </Card>
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {avgEnergy.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Rata-rata Energi</p>
              </CardContent>
            </Card>
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {goodMoodDays}
                </div>
                <p className="text-xs text-muted-foreground">Hari Mood Baik</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Moon className="h-5 w-5 mr-2" />
              <CardTitle>Pola Tidur (14 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              {sleepData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="url(#sleepGradient)" name="Jam Tidur" />
                    <defs>
                      <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4facfe" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Moon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada data tidur.</p>
                  <p className="text-sm">Mulai catat jurnal harian untuk melihat analitik tidur.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Moon className="h-5 w-5 mr-2" />
              <CardTitle>Kualitas Tidur</CardTitle>
            </CardHeader>
            <CardContent>
              {sleepData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="quality" 
                      stroke="#a8edea" 
                      strokeWidth={3}
                      name="Kualitas Tidur"
                      dot={{ fill: '#a8edea', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Belum ada data kualitas tidur.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {journalEntries.length > 0 ? (journalEntries.reduce((sum, entry) => sum + entry.sleepHours, 0) / journalEntries.length).toFixed(1) : '0'}h
                </div>
                <p className="text-xs text-muted-foreground">Rata-rata Tidur</p>
              </CardContent>
            </Card>
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {journalEntries.length > 0 ? (journalEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / journalEntries.length).toFixed(1) : '0'}
                </div>
                <p className="text-xs text-muted-foreground">Rata-rata Kualitas</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="study" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <BookOpen className="h-5 w-5 mr-2" />
              <CardTitle>Jam Belajar Harian (30 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              {journalTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={journalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="study" fill="url(#studyGradient)" name="Jam Belajar" />
                    <defs>
                      <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#faf089" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f093fb" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada data belajar.</p>
                  <p className="text-sm">Mulai catat jam belajar di jurnal harian.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {rotationData.length > 0 && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Total Jam Belajar per Rotasi Klinik</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rotationData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="rotation" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="hours" fill="url(#rotationGradient)" />
                    <defs>
                      <linearGradient id="rotationGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#38f9d7" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {journalEntries.reduce((sum, entry) => sum + entry.studyHours, 0).toFixed(1)}h
                </div>
                <p className="text-xs text-muted-foreground">Total Jam Belajar</p>
              </CardContent>
            </Card>
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {journalEntries.length > 0 ? (journalEntries.reduce((sum, entry) => sum + entry.studyHours, 0) / journalEntries.length).toFixed(1) : '0'}h
                </div>
                <p className="text-xs text-muted-foreground">Rata-rata Harian</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medication" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Pill className="h-5 w-5 mr-2" />
              <CardTitle>Kepatuhan Obat (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              {medicationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={medicationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Kepatuhan']} />
                    <Bar dataKey="adherence" fill="url(#medicationGradient)" />
                    <defs>
                      <linearGradient id="medicationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff9a9e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#fecfef" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada data obat.</p>
                  <p className="text-sm">Tambahkan obat di jurnal harian untuk tracking kepatuhan.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-semibold">
                  {medicationData.length > 0 
                    ? Math.round(medicationData.reduce((sum, data) => sum + data.adherence, 0) / medicationData.length)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Rata-rata Kepatuhan Minggu Ini</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Brain className="h-5 w-5 mr-2" />
              <CardTitle>Frekuensi Gejala Psikotik</CardTitle>
            </CardHeader>
            <CardContent>
              {symptomData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={symptomData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ symptom, count }) => `${symptom}: ${count}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {symptomData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada gejala psikotik yang dilaporkan.</p>
                  <p className="text-sm">Ini adalah kabar baik untuk kesehatan mental Anda!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {moodEntries.filter(entry => entry.psychoticSymptoms.length > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">Entri dengan Gejala</p>
              </CardContent>
            </Card>
            <Card className="glass border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">
                  {moodEntries.length - moodEntries.filter(entry => entry.psychoticSymptoms.length > 0).length}
                </div>
                <p className="text-xs text-muted-foreground">Entri Bebas Gejala</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}