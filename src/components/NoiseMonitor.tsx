import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff } from "lucide-react";

function getNoiseLevel(db: number) {
  if (db < 40) return { label: "Quiet", color: "bg-green-500/10 text-green-600 border-green-500/20" };
  if (db < 70) return { label: "Moderate", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" };
  return { label: "Loud", color: "bg-destructive/10 text-destructive border-destructive/20" };
}

export default function NoiseMonitor() {
  const [decibels, setDecibels] = useState(0);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        // Map 0-255 range to approximate 0-100 dB scale
        setDecibels(Math.round((avg / 255) * 100));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setError("Microphone access denied");
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  const noise = getNoiseLevel(decibels);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Noise Level</CardTitle>
        <Button variant="ghost" size="icon" onClick={listening ? stop : start}>
          {listening ? <Mic className="h-4 w-4 text-green-500" /> : <MicOff className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : listening ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{decibels} dB</span>
              <Badge className={noise.color}>{noise.label}</Badge>
            </div>
            <Progress value={decibels} className="h-3" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tap the mic to start monitoring</p>
        )}
      </CardContent>
    </Card>
  );
}
