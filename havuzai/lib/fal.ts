import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { readFileSync } from "fs";
import path from "path";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

// Şelale referansı henüz config'te tutulmuyor; global env fallback kullanılır.
const WATERFALL_REF = process.env.NEXT_PUBLIC_SELALE_REFERENCE_URL!;

// Roma'nın gerçek silüetini içeren magenta maske (şeffaf arka plan).
// Sadece Roma modeli seçildiğinde kullanılır; diğer modeller kılavuzsuz,
// eskisi gibi çalışmaya devam eder (regresyon riski yok).
const ROMA_MASK_PATH = path.join(process.cwd(), "lib", "assets", "roma-shape-mask.png");

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Görsel indirilemedi: ${response.status} — ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

// Roma'ya özel: bahçe fotoğrafına, Roma'nın gerçek silüetini birebir takip
// eden magenta kılavuz çizer. Dikdörtgen değil — omuzlu/boyunlu gerçek Roma
// konturu. withWalkwayBoundary true ise dış tarafta aynı silüetin büyütülmüş
// soluk versiyonu da eklenir (döşeme/deck'in dış sınırı).
async function createRomaPlacementGuide(
  sourceBuffer: Buffer,
  width: number,
  height: number,
  withWalkwayBoundary: boolean
): Promise<string> {
  let maskBuffer: Buffer;
  try {
    maskBuffer = readFileSync(ROMA_MASK_PATH);
  } catch (e) {
    console.warn("Roma maske dosyası bulunamadı, kılavuzsuz devam ediliyor:", e);
    return `data:image/png;base64,${sourceBuffer.toString("base64")}`;
  }

  const isLandscape = width >= height;

  // Maskenin doğal yönü dikey (boyun yukarıda). Yatay bahçe için 90° döndür.
  const orientedMask = isLandscape
    ? await sharp(maskBuffer).rotate(90).toBuffer()
    : maskBuffer;

  const meta = await sharp(orientedMask).metadata();
  const maskAspect = (meta.width || 1) / (meta.height || 1);

  let guideWidth: number, guideHeight: number;
  if (isLandscape) {
    guideWidth = Math.round(width * 0.4);
    guideHeight = Math.round(guideWidth / maskAspect);
  } else {
    guideHeight = Math.round(height * 0.36);
    guideWidth = Math.round(guideHeight * maskAspect);
  }

  const x = Math.round((width - guideWidth) / 2);
  const y = Math.round(height * 0.56 - guideHeight / 2);

  const layers: { input: Buffer; left: number; top: number }[] = [];

  if (withWalkwayBoundary) {
    const scale = 1.3;
    const outerW = Math.round(guideWidth * scale);
    const outerH = Math.round(guideHeight * scale);

    const outerMaskResized = await sharp(orientedMask)
      .resize(outerW, outerH, { fit: "fill" })
      .ensureAlpha()
      .toBuffer();

    // Dış silüeti soluklaştır (döşeme sınırı — su ayak izinden ayırt edilsin).
    const fadedOuter = await sharp(outerMaskResized)
      .composite([
        {
          input: Buffer.from(
            `<svg width="${outerW}" height="${outerH}"><rect width="100%" height="100%" fill="white" opacity="0.5"/></svg>`
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    const outerX = Math.round(x - (outerW - guideWidth) / 2);
    const outerY = Math.round(y - (outerH - guideHeight) / 2);
    layers.push({ input: fadedOuter, left: outerX, top: outerY });
  }

  const innerMask = await sharp(orientedMask)
    .resize(guideWidth, guideHeight, { fit: "fill" })
    .toBuffer();
  layers.push({ input: innerMask, left: x, top: y });

  const guidedBuffer = await sharp(sourceBuffer)
    .rotate()
    .composite(layers)
    .png()
    .toBuffer();

  return `data:image/png;base64,${guidedBuffer.toString("base64")}`;
}

export async function generatePoolVisualization(
  customerPhotoUrl: string,
  config: PoolConfig,
  clientConfig: ClientConfig
) {
  const prompt = buildPoolPrompt(config, clientConfig);

  // Seçilen modelin referans görseli firma config'inden gelir.
  const model = clientConfig.pool_models.find((m) => m.id === config.model);
  const poolRef = model?.reference_image_url;
  if (!poolRef) {
    throw new Error(`Model referans görseli bulunamadı: ${config.model}`);
  }

  const isRomaModel =
    model?.id?.toUpperCase() === "ROMA" || model?.name?.toUpperCase() === "ROMA";

  // Sadece Roma için: bahçe fotoğrafına gerçek Roma silüetiyle kılavuz çiz.
  // Diğer modeller (Relax vb.) hiç dokunulmadan, eskisi gibi ham fotoğrafla gider.
  let gardenImageForAi: string = customerPhotoUrl;
  if (isRomaModel) {
    try {
      const customerBuffer = await fetchImageBuffer(customerPhotoUrl);
      const { width = 0, height = 0 } = await sharp(customerBuffer).rotate().metadata();
      if (width > 0 && height > 0) {
        gardenImageForAi = await createRomaPlacementGuide(
          customerBuffer,
          width,
          height,
          Boolean(config.ceramic || config.deck)
        );
      }
    } catch (e) {
      console.warn("Roma kılavuzu oluşturulamadı, ham fotoğrafla devam ediliyor:", e);
      gardenImageForAi = customerPhotoUrl;
    }
  }

  // Referans görselleri topla — SIRALAMA prompt.ts'teki REFERENCE IMAGES GUIDE
  // ile birebir aynı mantıkla eşleşmeli. Buraya yeni bir referans eklersen
  // prompt.ts'teki hesaplamayı da güncellemeyi unutma.
  const imageUrls: string[] = [gardenImageForAi, poolRef];

  // İkinci referans görsel varsa ekle
  const poolRef2 = model?.reference_image_url_2;
  if (poolRef2) {
    imageUrls.push(poolRef2);
  }

  // Şelale seçildiyse referansı ekle
  if (config.hasWaterfall && WATERFALL_REF) {
    imageUrls.push(WATERFALL_REF);
  }

  // Merdiven seçildiyse ladder stil referansını ekle
  const stairRef = clientConfig.features?.stair_reference_url;
  if (config.hasStairs && stairRef) {
    imageUrls.push(stairRef);
  }

  console.log("=== FAL.AI DEBUG ===");
  console.log("Model:", config.model);
  console.log("Roma kılavuzu kullanıldı:", isRomaModel);
  console.log("Prompt uzunluğu:", prompt.length);
  console.log("Prompt ilk 200 karakter:", prompt.slice(0, 200));
  console.log(
    "Image URLs:",
    JSON.stringify(imageUrls.map((u) => (u.startsWith("data:") ? "[data-uri]" : u)), null, 2)
  );
  console.log("====================");

  for (const url of imageUrls) {
    if (url.startsWith("data:")) continue;
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL kontrol: ${url} → ${res.status}`);
    } catch (e) {
      console.log(`URL HATASI: ${url} → erişilemiyor`);
    }
  }

  try {
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt,
        image_urls: imageUrls,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.forEach((log) =>
            console.log("[fal.ai]", log.message)
          );
        }
      },
    });

    console.log("✅ BAŞARILI:", result.data.images[0].url);

    return {
      aiImageUrl: result.data.images[0].url,
      prompt,
    };
  } catch (error: any) {
    console.error("❌ FAL.AI HATASI - tam detay:");
    console.error("Status:", error?.status);
    console.error("Body:", JSON.stringify(error?.body, null, 2));
    console.error("Message:", error?.message);
    throw error;
  }
}