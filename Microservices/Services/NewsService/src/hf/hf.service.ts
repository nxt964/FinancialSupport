// src/hf/hf.service.ts
import { Injectable } from "@nestjs/common";

type HFResult = any;

@Injectable()
export class HfService {
  private base = "https://router.huggingface.co/hf-inference";
  private headers = {
    Authorization: `Bearer ${process.env.HF_TOKEN}`,
    "Content-Type": "application/json",
  };

  private async post(
    model: string,
    payload: any,
    timeoutMs = 20000
  ): Promise<HFResult> {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const resp = await fetch(`${this.base}/models/${model}`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HF ${model} ${resp.status}: ${text}`);
      }
      return await resp.json();
    } finally {
      clearTimeout(t);
    }
  }

  // Summarize long article (optional)
  async summarize(text: string): Promise<string> {
    // const trimmed = text.length > 6000 ? text.slice(0, 6000) : text; // keep it short for speed
    const out = await this.post("facebook/bart-large-cnn", { inputs: text });
    // API can return array or object depending on router—normalize:
    const summary = Array.isArray(out)
      ? out[0]?.summary_text
      : (out?.summary_text ?? "");

    return summary || text; // fallback to original if empty
  }

  // Financial sentiment (FinBERT)
  async sentiment(text: string): Promise<{ label: string; score: number }> {
    const out = await this.post("ProsusAI/finbert", { inputs: text });
    // normalize to a flat array of {label, score}
    let arr: any[] = [];
    if (Array.isArray(out)) {
      arr = Array.isArray(out[0]) ? out[0] : out; // handle nested or flat
    }

    if (!arr.length) return { label: "neutral", score: 0 };

    const top = arr.reduce(
      (a, b) => ((b?.score ?? 0) > (a?.score ?? 0) ? b : a),
      { label: "neutral", score: 0 }
    );

    return { label: String(top.label), score: Number(top.score) };
  }
}
