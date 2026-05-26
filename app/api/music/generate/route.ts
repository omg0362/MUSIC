import Replicate, { type ApiError, type FileOutput } from "replicate";
import { createClient, type User } from "@supabase/supabase-js";

const MODEL =
  "fishaudio/ace-step-1.5:74e3a7d383b18815e277de5223f5fe9d53d38832de15aa567fe729fa129d0d85";
const MUSIC_BUCKET = "MUSICs";

export const runtime = "nodejs";
export const maxDuration = 300;

type GenerateMusicRequest = {
  batch_size?: unknown;
  caption?: unknown;
  duration?: unknown;
  lyrics?: unknown;
  prompt?: unknown;
};

type AudioOutput = {
  url: string;
};

type StoredMusicRow = {
  id: string;
  title: string | null;
  prompt: string | null;
  status: string;
  storage_bucket: string;
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  created_at: string;
  completed_at: string | null;
};

class InsufficientCreditsError extends Error {
  constructor(
    readonly credits: number,
    readonly requiredCredits: number,
  ) {
    super("Not enough credits.");
  }
}

type ServiceSupabaseClient = ReturnType<typeof createServiceSupabaseClient>;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

function isMissingRpcFunctionError(error: unknown, functionName: string) {
  const message = getErrorMessage(error, "");

  return (
    message.includes(`public.${functionName}`) &&
    message.includes("schema cache")
  );
}

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function getOptionalEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  return null;
}

function getSupabaseServiceRoleKey() {
  return getOptionalEnv([
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVIE_ROLE_KEY",
  ]);
}

function isFileOutput(value: unknown): value is FileOutput {
  return (
    typeof value === "object" &&
    value !== null &&
    "url" in value &&
    typeof (value as { url?: unknown }).url === "function"
  );
}

function toAudioOutputs(output: unknown): AudioOutput[] {
  const values = Array.isArray(output) ? output : [output];

  return values
    .map((item) => {
      if (isFileOutput(item)) {
        return { url: item.url().toString() };
      }

      if (typeof item === "string") {
        return { url: item };
      }

      return null;
    })
    .filter((item): item is AudioOutput => item !== null);
}

function isReplicateApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    "response" in error &&
    error.response instanceof Response
  );
}

async function getErrorResponse(error: unknown) {
  if (error instanceof InsufficientCreditsError) {
    return {
      credits: error.credits,
      message: `Not enough credits. This generation needs ${error.requiredCredits} credits.`,
      status: 402,
    };
  }

  if (isReplicateApiError(error)) {
    if (error.response.status === 402) {
      return {
        message:
          "Replicate account has insufficient credit. Add credit in Replicate billing, wait a few minutes, then try again.",
        status: 402,
      };
    }

    return {
      message: error.message,
      status: error.response.status,
    };
  }

  return {
    message: getErrorMessage(error, "Failed to generate music."),
    status: 500,
  };
}

function createUserSupabaseClient(accessToken: string) {
  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );
}

function createServiceSupabaseClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

async function getAuthenticatedUser(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return null;
  }

  const supabase = createUserSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return { token, user: data.user };
}

function getTitle(prompt: string) {
  return prompt.length > 64 ? `${prompt.slice(0, 61)}...` : prompt;
}

function getCreditCost(duration: number, batchSize: number) {
  return 1 + Math.max(0, duration / 60 - 1) + Math.max(0, batchSize - 1);
}

async function consumeCredits({
  credits,
  supabase,
  userId,
}: {
  credits: number;
  supabase: ServiceSupabaseClient;
  userId: string;
}) {
  const { data, error } = await supabase.rpc("consume_user_credits", {
    p_credits: credits,
    p_user_id: userId,
  });

  if (error) {
    if (isMissingRpcFunctionError(error, "consume_user_credits")) {
      return consumeCreditsWithConditionalUpdate({
        credits,
        supabase,
        userId,
      });
    }

    throw new Error(getErrorMessage(error, "Failed to consume credits."));
  }

  if (typeof data !== "number") {
    const { data: currentUser } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single<{ credits: number }>();

    throw new InsufficientCreditsError(currentUser?.credits ?? 0, credits);
  }

  return data;
}

async function consumeCreditsWithConditionalUpdate({
  credits,
  supabase,
  userId,
}: {
  credits: number;
  supabase: ServiceSupabaseClient;
  userId: string;
}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: currentUser, error: selectError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single<{ credits: number }>();

    if (selectError) {
      throw new Error(
        getErrorMessage(selectError, "Failed to load user credits."),
      );
    }

    if (currentUser.credits < credits) {
      throw new InsufficientCreditsError(currentUser.credits, credits);
    }

    const nextCredits = currentUser.credits - credits;
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ credits: nextCredits })
      .eq("id", userId)
      .eq("credits", currentUser.credits)
      .select("credits")
      .maybeSingle<{ credits: number }>();

    if (updateError) {
      throw new Error(
        getErrorMessage(updateError, "Failed to consume credits."),
      );
    }

    if (updatedUser) {
      return updatedUser.credits;
    }
  }

  throw new Error("Credit balance changed while starting generation.");
}

async function refundCredits({
  credits,
  supabase,
  userId,
}: {
  credits: number;
  supabase: ServiceSupabaseClient;
  userId: string;
}) {
  const { error } = await supabase.rpc("refund_user_credits", {
    p_credits: credits,
    p_user_id: userId,
  });

  if (error) {
    if (isMissingRpcFunctionError(error, "refund_user_credits")) {
      await refundCreditsWithReadUpdate({
        credits,
        supabase,
        userId,
      });
      return;
    }

    throw new Error(getErrorMessage(error, "Failed to refund credits."));
  }
}

async function refundCreditsWithReadUpdate({
  credits,
  supabase,
  userId,
}: {
  credits: number;
  supabase: ServiceSupabaseClient;
  userId: string;
}) {
  const { data: currentUser, error: selectError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single<{ credits: number }>();

  if (selectError) {
    throw new Error(getErrorMessage(selectError, "Failed to load credits."));
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ credits: currentUser.credits + credits })
    .eq("id", userId);

  if (updateError) {
    throw new Error(getErrorMessage(updateError, "Failed to refund credits."));
  }
}

function getFileExtension(contentType: string | null) {
  if (contentType?.includes("wav")) return "wav";
  if (contentType?.includes("flac")) return "flac";
  if (contentType?.includes("ogg")) return "ogg";
  if (contentType?.includes("webm")) return "webm";
  if (contentType?.includes("mp4")) return "mp4";

  return "mp3";
}

function getAudioContentType(contentType: string | null) {
  const normalizedContentType =
    contentType?.split(";")[0]?.trim().toLowerCase() ?? "";

  if (normalizedContentType.startsWith("audio/")) {
    return normalizedContentType;
  }

  return "audio/mpeg";
}

async function downloadAudio(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to download generated audio.");
  }

  const contentType = getAudioContentType(response.headers.get("content-type"));
  const buffer = await response.arrayBuffer();

  return {
    buffer,
    contentType,
    size: buffer.byteLength,
  };
}

async function createSignedUrl(
  supabase: ReturnType<typeof createUserSupabaseClient>,
  storagePath: string | null,
) {
  if (!storagePath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(MUSIC_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

async function storeGeneratedAudio({
  audio,
  batchSize,
  caption,
  duration,
  index,
  lyrics,
  supabase,
  user,
}: {
  audio: AudioOutput;
  batchSize: number;
  caption: string;
  duration: number;
  index: number;
  lyrics: string;
  supabase: ReturnType<typeof createUserSupabaseClient>;
  user: User;
}) {
  const downloadedAudio = await downloadAudio(audio.url);
  const extension = getFileExtension(downloadedAudio.contentType);
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const storagePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(MUSIC_BUCKET)
    .upload(storagePath, downloadedAudio.buffer, {
      contentType: downloadedAudio.contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(getErrorMessage(uploadError, "Failed to upload music."));
  }

  const { data, error: insertError } = await supabase
    .from("MUSICs")
    .insert({
      user_id: user.id,
      title:
        index === 0 ? getTitle(caption) : `${getTitle(caption)} (${index + 1})`,
      prompt: caption,
      status: "completed",
      storage_bucket: MUSIC_BUCKET,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: downloadedAudio.contentType,
      file_size: downloadedAudio.size,
      duration_seconds: duration,
      completed_at: new Date().toISOString(),
      metadata: {
        batch_size: batchSize,
        lyrics,
        model: MODEL,
        source_url: audio.url,
      },
    })
    .select(
      "id,title,prompt,status,storage_bucket,storage_path,file_name,mime_type,file_size,duration_seconds,created_at,completed_at",
    )
    .single<StoredMusicRow>();

  if (insertError) {
    await supabase.storage.from(MUSIC_BUCKET).remove([storagePath]);
    throw new Error(getErrorMessage(insertError, "Failed to save music."));
  }

  return {
    ...data,
    signed_url: await createSignedUrl(supabase, data.storage_path),
  };
}

export async function POST(request: Request) {
  let chargedCredits = 0;
  let serviceSupabase: ServiceSupabaseClient | null = null;
  let userId: string | null = null;

  try {
    const authentication = await getAuthenticatedUser(request);

    if (!authentication) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as GenerateMusicRequest;
    const caption =
      typeof body.caption === "string"
        ? body.caption.trim()
        : typeof body.prompt === "string"
          ? body.prompt.trim()
          : "";
    const lyrics = typeof body.lyrics === "string" ? body.lyrics.trim() : "";
    const duration = Number(body.duration ?? 60);
    const batchSize = Number(body.batch_size ?? 1);

    if (!caption) {
      return Response.json({ error: "Caption is required." }, { status: 400 });
    }

    if (
      !Number.isInteger(duration) ||
      ![60, 120, 180].includes(duration) ||
      !Number.isInteger(batchSize) ||
      batchSize < 1 ||
      batchSize > 4
    ) {
      return Response.json(
        { error: "Invalid duration or batch_size." },
        { status: 400 },
      );
    }

    const requiredCredits = getCreditCost(duration, batchSize);

    userId = authentication.user.id;
    serviceSupabase = createServiceSupabaseClient();
    const remainingCredits = await consumeCredits({
      credits: requiredCredits,
      supabase: serviceSupabase,
      userId,
    });
    chargedCredits = requiredCredits;

    const replicate = new Replicate({
      auth: getEnv("REPLICATE_API_TOKEN"),
    });

    const output = await replicate.run(MODEL, {
      input: {
        caption: caption.slice(0, 512),
        duration,
        batch_size: batchSize,
        ...(lyrics ? { lyrics } : {}),
      },
      wait: {
        mode: "poll",
        interval: 2,
      },
    });
    const audio = toAudioOutputs(output);

    if (audio.length === 0) {
      return Response.json(
        { error: "The model did not return an audio file." },
        { status: 502 },
      );
    }

    const supabase = createUserSupabaseClient(authentication.token);
    const music = await Promise.all(
      audio.map((audioOutput, index) =>
        storeGeneratedAudio({
          audio: audioOutput,
          batchSize,
          caption,
          duration,
          index,
          lyrics,
          supabase,
          user: authentication.user,
        }),
      ),
    );

    return Response.json({ credits: remainingCredits, music });
  } catch (error) {
    if (chargedCredits > 0 && serviceSupabase && userId) {
      try {
        await refundCredits({
          credits: chargedCredits,
          supabase: serviceSupabase,
          userId,
        });
      } catch {
        // The original generation error is more useful to the caller.
      }
    }

    const { credits, message, status } = await getErrorResponse(error);

    return Response.json({ credits, error: message }, { status });
  }
}
