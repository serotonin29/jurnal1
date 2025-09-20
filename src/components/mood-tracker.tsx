import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { toast } from 'sonner@2.0.3';
import { 
  Heart, 
  Brain, 
  Clock, 
  Calendar, 
  Save,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  X
} from 'lucide-react';

interface MoodEntry {
  id: string;
  timestamp: string; // ISO string dengan tanggal dan waktu
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

interface MoodTrackerProps {
  onSave: (entry: MoodEntry) => void;
  existingEntry?: MoodEntry;
}

const psychoticSymptomOptions = [
  'Halusinasi pendengaran',
  'Halusinasi visual', 
  'Delusi/waham',
  'Pikiran tidak terorganisir',
  'Paranoia',
  'Gangguan konsentrasi',
  'Kebingungan realitas'
];

const weatherOptions = [
  'Cerah',
  'Berawan',
  'Hujan',
  'Badai',
  'Berkabut',
  'Panas',
  'Dingin'
];

export function MoodTracker({ onSave, existingEntry }: MoodTrackerProps) {
  const [formData, setFormData] = useState<MoodEntry>(() => {
    if (existingEntry) {
      return existingEntry;
    }
    
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      timestamp: now.toISOString(),
      mood: 5,
      anxiety: 5,
      energy: 5,
      stress: 5,
      psychoticSymptoms: [],
      triggers: '',
      notes: '',
      location: '',
      weather: ''
    };
  });

  const getMoodIcon = (mood: number) => {
    if (mood >= 7) return <Smile className="h-5 w-5 text-green-500" />;
    if (mood >= 4) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'mood-excellent';
    if (mood >= 6) return 'mood-good';
    if (mood >= 4) return 'mood-neutral';
    if (mood >= 2) return 'mood-poor';
    return 'mood-terrible';
  };

  const handleDateTimeChange = (field: 'date' | 'time', value: string) => {
    const currentDate = new Date(formData.timestamp);
    
    if (field === 'date') {
      const [year, month, day] = value.split('-').map(Number);
      currentDate.setFullYear(year, month - 1, day);
    } else {
      const [hours, minutes] = value.split(':').map(Number);
      currentDate.setHours(hours, minutes);
    }
    
    setFormData(prev => ({
      ...prev,
      timestamp: currentDate.toISOString()
    }));
  };

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      psychoticSymptoms: prev.psychoticSymptoms.includes(symptom)
        ? prev.psychoticSymptoms.filter(s => s !== symptom)
        : [...prev.psychoticSymptoms, symptom]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave(formData);
    
    toast.success('Mood tracker berhasil disimpan!', {
      description: `Dicatat pada ${new Date(formData.timestamp).toLocaleString('id-ID')}`
    });

    // Reset form untuk entry baru
    if (!existingEntry) {
      const now = new Date();
      setFormData({
        id: crypto.randomUUID(),
        timestamp: now.toISOString(),
        mood: 5,
        anxiety: 5,
        energy: 5,
        stress: 5,
        psychoticSymptoms: [],
        triggers: '',
        notes: '',
        location: '',
        weather: ''
      });
    }
  };

  const currentDate = new Date(formData.timestamp);
  const dateValue = currentDate.toISOString().split('T')[0];
  const timeValue = currentDate.toTimeString().slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-accent rounded-lg">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Mood Tracker</h1>
          <p className="text-muted-foreground">Catat suasana hati dan kondisi mental Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Timestamp Section */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Waktu Pencatatan</span>
            </CardTitle>
            <CardDescription>
              Kapan Anda merasakan kondisi ini?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={dateValue}
                    onChange={(e) => handleDateTimeChange('date', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Waktu</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={timeValue}
                    onChange={(e) => handleDateTimeChange('time', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="p-3 glass rounded-lg">
              <p className="text-sm text-muted-foreground">
                Waktu lengkap: {currentDate.toLocaleString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mood Ratings */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getMoodIcon(formData.mood)}
              <span>Penilaian Suasana Hati</span>
            </CardTitle>
            <CardDescription>
              Skala 1-10 untuk berbagai aspek kondisi mental
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Smile className="h-4 w-4" />
                    <span>Mood</span>
                  </Label>
                  <Badge variant="secondary" className={getMoodColor(formData.mood)}>
                    {formData.mood}/10
                  </Badge>
                </div>
                <Slider
                  value={[formData.mood]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sangat Buruk</span>
                  <span>Sangat Baik</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Kecemasan</span>
                  </Label>
                  <Badge variant="secondary" className={formData.anxiety > 7 ? 'mood-terrible' : formData.anxiety > 4 ? 'mood-neutral' : 'mood-good'}>
                    {formData.anxiety}/10
                  </Badge>
                </div>
                <Slider
                  value={[formData.anxiety]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, anxiety: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tidak Cemas</span>
                  <span>Sangat Cemas</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Energi</Label>
                  <Badge variant="secondary" className={formData.energy > 7 ? 'mood-excellent' : formData.energy > 4 ? 'mood-neutral' : 'mood-poor'}>
                    {formData.energy}/10
                  </Badge>
                </div>
                <Slider
                  value={[formData.energy]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, energy: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sangat Lelah</span>
                  <span>Sangat Berenergi</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Stress</Label>
                  <Badge variant="secondary" className={formData.stress > 7 ? 'mood-terrible' : formData.stress > 4 ? 'mood-neutral' : 'mood-good'}>
                    {formData.stress}/10
                  </Badge>
                </div>
                <Slider
                  value={[formData.stress]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stress: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sangat Rileks</span>
                  <span>Sangat Stress</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Psychotic Symptoms */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Gejala Psikotik</span>
            </CardTitle>
            <CardDescription>
              Centang gejala yang Anda alami saat ini (opsional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {psychoticSymptomOptions.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={formData.psychoticSymptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                  />
                  <Label htmlFor={symptom} className="text-sm font-normal">
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
            {formData.psychoticSymptoms.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Gejala psikotik terdeteksi. Segera konsultasi dengan dokter jika berlanjut.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Context & Notes */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Konteks & Catatan</CardTitle>
            <CardDescription>
              Informasi tambahan tentang kondisi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Rumah, kampus, klinik..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weather">Cuaca</Label>
                <Select value={formData.weather} onValueChange={(value) => setFormData(prev => ({ ...prev, weather: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cuaca" />
                  </SelectTrigger>
                  <SelectContent>
                    {weatherOptions.map((weather) => (
                      <SelectItem key={weather} value={weather}>
                        {weather}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggers">Pemicu/Trigger</Label>
              <Textarea
                id="triggers"
                value={formData.triggers}
                onChange={(e) => setFormData(prev => ({ ...prev, triggers: e.target.value }))}
                placeholder="Apa yang memicu perubahan mood? (ujian, konflik, kurang tidur, dll.)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan Tambahan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Catatan tambahan tentang perasaan atau kondisi Anda..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button type="submit" className="bg-gradient-primary text-white">
            <Save className="h-4 w-4 mr-2" />
            Simpan Mood Tracker
          </Button>
        </div>
      </form>
    </div>
  );
}