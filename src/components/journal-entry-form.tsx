import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { toast } from 'sonner@2.0.3';
import { CalendarDays, Pill, BookOpen, Moon, Save, PenTool, Heart, Target, Sparkles, Plus, Trash2, Lightbulb, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

interface JournalEntryFormProps {
  onSave: (entry: JournalEntry) => void;
  existingEntry?: JournalEntry;
}

export function JournalEntryForm({ onSave, existingEntry }: JournalEntryFormProps) {
  const [entry, setEntry] = useState<Partial<JournalEntry>>(() => {
    if (existingEntry) {
      return existingEntry;
    }
    
    return {
      date: new Date().toISOString().split('T')[0],
      medications: [
        { name: 'Obat Pagi', taken: false, time: '08:00' },
        { name: 'Obat Malam', taken: false, time: '20:00' }
      ],
      sleepHours: 7,
      sleepQuality: 5,
      studyHours: 0,
      studySubjects: '',
      clinicalRotation: '',
      journalText: '',
      gratitude: '',
      goals: '',
      wellness: '',
      challenges: '',
      learnings: ''
    };
  });

  const [aiReflection, setAiReflection] = useState<string>('');
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);

  const handleMedicationChange = (index: number, field: 'name' | 'taken' | 'time', value: string | boolean) => {
    const medications = [...(entry.medications || [])];
    medications[index] = { ...medications[index], [field]: value };
    setEntry({ ...entry, medications });
  };

  const addMedication = () => {
    const medications = [...(entry.medications || [])];
    medications.push({ name: '', taken: false, time: '08:00' });
    setEntry({ ...entry, medications });
  };

  const removeMedication = (index: number) => {
    const medications = [...(entry.medications || [])];
    medications.splice(index, 1);
    setEntry({ ...entry, medications });
  };

  const generateAIReflection = async () => {
    if (!entry.journalText?.trim()) {
      toast.error('Tulis jurnal dulu untuk mendapatkan refleksi AI');
      return;
    }

    setIsGeneratingReflection(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e0055e13/reflection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ 
          journalEntry: {
            journalText: entry.journalText,
            challenges: entry.challenges,
            wellness: entry.wellness,
            gratitude: entry.gratitude,
            goals: entry.goals,
            learnings: entry.learnings,
            studySubjects: entry.studySubjects,
            sleepHours: entry.sleepHours,
            sleepQuality: entry.sleepQuality,
            studyHours: entry.studyHours
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI reflection error response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setAiReflection(data.reflection);
      toast.success('Refleksi AI berhasil dibuat!');
    } catch (error) {
      console.error('Error generating AI reflection:', error);
      toast.error('Terjadi kesalahan saat membuat refleksi. Silakan coba lagi.');
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  const handleSave = () => {
    const completeEntry: JournalEntry = {
      id: existingEntry?.id || crypto.randomUUID(),
      date: entry.date || new Date().toISOString().split('T')[0],
      medications: entry.medications || [],
      sleepHours: entry.sleepHours || 7,
      sleepQuality: entry.sleepQuality || 5,
      studyHours: entry.studyHours || 0,
      studySubjects: entry.studySubjects || '',
      clinicalRotation: entry.clinicalRotation || '',
      journalText: entry.journalText || '',
      gratitude: entry.gratitude || '',
      goals: entry.goals || '',
      wellness: entry.wellness || '',
      challenges: entry.challenges || '',
      learnings: entry.learnings || ''
    };

    onSave(completeEntry);
    toast.success('Jurnal harian berhasil disimpan!', {
      description: `Entri untuk ${new Date(completeEntry.date).toLocaleDateString('id-ID')} tersimpan`
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-secondary rounded-lg">
          <PenTool className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[rgba(255,255,255,1)]">Jurnal Harian</h1>
          <p className="text-[rgba(255,255,255,1)]">Catat aktivitas harian, studi kedokteran, dan refleksi pribadi</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Header Info */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5" />
              <span>Informasi Dasar</span>
            </CardTitle>
            <CardDescription>
              Tanggal dan rotasi klinik hari ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={entry.date}
                  onChange={(e) => setEntry({ ...entry, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rotation">Rotasi Klinik</Label>
                <Input
                  id="rotation"
                  placeholder="Contoh: Bedah, Penyakit Dalam, Pediatri"
                  value={entry.clinicalRotation}
                  onChange={(e) => setEntry({ ...entry, clinicalRotation: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Pill className="h-5 w-5" />
              <span>Obat-obatan</span>
            </CardTitle>
            <CardDescription>
              Catat obat yang dikonsumsi dan waktu minum
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {entry.medications?.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 glass rounded-lg">
                <div className="space-y-2">
                  <Label>Nama Obat</Label>
                  <Input
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    placeholder="Nama obat"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Waktu</Label>
                  <Input
                    type="time"
                    value={med.time}
                    onChange={(e) => handleMedicationChange(index, 'time', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id={`med-${index}`}
                    checked={med.taken}
                    onCheckedChange={(checked) => handleMedicationChange(index, 'taken', checked as boolean)}
                  />
                  <Label htmlFor={`med-${index}`} className="text-sm">Sudah diminum</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedication(index)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </div>
            ))}
            <Button onClick={addMedication} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Obat
            </Button>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Moon className="h-5 w-5" />
              <span>Pola Tidur</span>
            </CardTitle>
            <CardDescription>
              Catat durasi dan kualitas tidur semalam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Durasi Tidur: {entry.sleepHours} jam</Label>
                <Slider
                  value={[entry.sleepHours || 7]}
                  onValueChange={(value) => setEntry({ ...entry, sleepHours: value[0] })}
                  max={12}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 jam</span>
                  <span>12 jam</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Kualitas Tidur: {entry.sleepQuality}/10</Label>
                <Slider
                  value={[entry.sleepQuality || 5]}
                  onValueChange={(value) => setEntry({ ...entry, sleepQuality: value[0] })}
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
            </div>
          </CardContent>
        </Card>

        {/* Study */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Aktivitas Belajar</span>
            </CardTitle>
            <CardDescription>
              Catat jam belajar dan materi yang dipelajari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Jam Belajar: {entry.studyHours} jam</Label>
              <Slider
                value={[entry.studyHours || 0]}
                onValueChange={(value) => setEntry({ ...entry, studyHours: value[0] })}
                max={12}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 jam</span>
                <span>12 jam</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjects">Mata Kuliah/Topik yang Dipelajari</Label>
              <Textarea
                id="subjects"
                placeholder="Contoh: Anatomi sistem kardiovaskuler, Patologi respiratori, Case study diabetes melitus"
                rows={3}
                value={entry.studySubjects}
                onChange={(e) => setEntry({ ...entry, studySubjects: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="learnings">Pembelajaran Penting Hari Ini</Label>
              <Textarea
                id="learnings"
                placeholder="Apa konsep atau skill medis penting yang Anda pelajari hari ini?"
                rows={3}
                value={entry.learnings}
                onChange={(e) => setEntry({ ...entry, learnings: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Journal & Reflection */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Refleksi Harian</span>
            </CardTitle>
            <CardDescription>
              Ekspresikan perasaan, pengalaman, dan pemikiran Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="journal">Jurnal Bebas</Label>
              <Textarea
                id="journal"
                placeholder="Tuliskan tentang hari Anda, perasaan, pengalaman di rumah sakit, interaksi dengan pasien, pembelajaran, atau hal lain yang ingin diingat..."
                rows={6}
                value={entry.journalText}
                onChange={(e) => setEntry({ ...entry, journalText: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="challenges">Tantangan Hari Ini</Label>
                <Textarea
                  id="challenges"
                  placeholder="Apa tantangan terberat yang Anda hadapi hari ini?"
                  rows={3}
                  value={entry.challenges}
                  onChange={(e) => setEntry({ ...entry, challenges: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wellness">Aktivitas Wellness</Label>
                <Textarea
                  id="wellness"
                  placeholder="Aktivitas untuk kesehatan mental: olahraga, meditasi, hobi, dll."
                  rows={3}
                  value={entry.wellness}
                  onChange={(e) => setEntry({ ...entry, wellness: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gratitude" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Hal yang Disyukuri</span>
              </Label>
              <Textarea
                id="gratitude"
                placeholder="Tuliskan 3 hal yang Anda syukuri hari ini..."
                rows={3}
                value={entry.gratitude}
                onChange={(e) => setEntry({ ...entry, gratitude: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Tujuan Besok</span>
              </Label>
              <Textarea
                id="goals"
                placeholder="Apa yang ingin Anda capai besok? Target studi, klinik, atau personal?"
                rows={3}
                value={entry.goals}
                onChange={(e) => setEntry({ ...entry, goals: e.target.value })}
              />
            </div>

            {/* AI Reflection Section */}
            <div className="space-y-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>Refleksi AI</span>
                </Label>
                <Button
                  type="button"
                  onClick={generateAIReflection}
                  disabled={isGeneratingReflection || !entry.journalText?.trim()}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {isGeneratingReflection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Membuat Refleksi...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Buat Refleksi AI
                    </>
                  )}
                </Button>
              </div>
              
              {aiReflection && (
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-300/30">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 mt-1">
                      <Lightbulb className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-2">Refleksi & Insight dari AI</h4>
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {aiReflection}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {!aiReflection && (
                <p className="text-white/60 text-sm italic">
                  Tulis jurnal harian kamu, lalu klik "Buat Refleksi AI" untuk mendapatkan insight dan refleksi mendalam dari AI tentang hari kamu.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full bg-gradient-secondary text-white" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Simpan Jurnal Harian
        </Button>
      </div>
    </div>
  );
}