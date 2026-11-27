package com.tracksidepass.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.effect.BitmapOverlay;
import androidx.media3.effect.OverlayEffect;
import androidx.media3.effect.Presentation;
import androidx.media3.transformer.Composition;
import androidx.media3.transformer.EditedMediaItem;
import androidx.media3.transformer.Effects;
import androidx.media3.transformer.ExportException;
import androidx.media3.transformer.ExportResult;
import androidx.media3.transformer.ProgressHolder;
import androidx.media3.transformer.Transformer;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.common.collect.ImmutableList;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

/**
 * JavaScript side: window.Capacitor.Plugins.VideoCard (pickMedia / makeVideoCard / previewVideo / shareFile / deleteVideo), the same API as the iPhone plugin.
 * The Race Log's video card made natively: Media3 Transformer trims the first seconds of the clip, fills a 9:16 frame and lays the card overlay (a transparent PNG the
 * web page draws) over every frame, far quicker than recording the screen. A picked clip is kept as a real file in files/RaceLog.
 */
@CapacitorPlugin(name = "VideoCard")
public class VideoCardPlugin extends Plugin {
    private final Handler main = new Handler(Looper.getMainLooper());

    private File folder() {
        File d = new File(getContext().getFilesDir(), "RaceLog");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private File clipFile(String id) { return new File(folder(), new File(id).getName()); }

    // ---------------------------------------------------------------- picking

    @PluginMethod
    public void pickMedia(PluginCall call) {
        Intent intent;
        if (Build.VERSION.SDK_INT >= 33) {
            intent = new Intent(MediaStore.ACTION_PICK_IMAGES);   // the system photo picker: photos and videos, no permission needed
        } else {
            intent = new Intent(Intent.ACTION_GET_CONTENT);
            intent.setType("*/*");
            intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/*", "video/*"});
            intent.addCategory(Intent.CATEGORY_OPENABLE);
        }
        startActivityForResult(call, intent, "pickResult");
    }

    @ActivityCallback
    private void pickResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            JSObject r = new JSObject(); r.put("cancelled", true); call.resolve(r); return;
        }
        final Uri uri = result.getData().getData();
        new Thread(() -> {
            try {
                ContentResolver cr = getContext().getContentResolver();
                String type = cr.getType(uri); if (type == null) type = "";
                if (type.startsWith("video/")) resolveVideo(call, uri, type); else resolveImage(call, uri);
            } catch (Exception e) { call.reject("could not read that: " + e.getMessage()); }
        }).start();
    }

    private void resolveVideo(PluginCall call, Uri uri, String type) throws Exception {
        String ext = type.contains("webm") ? "webm" : "mp4";
        String id = UUID.randomUUID().toString() + "." + ext;
        File dest = clipFile(id);
        try (InputStream in = getContext().getContentResolver().openInputStream(uri); OutputStream out = new FileOutputStream(dest)) {
            byte[] buf = new byte[1 << 16]; int n; while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
        }
        MediaMetadataRetriever mmr = new MediaMetadataRetriever();
        mmr.setDataSource(dest.getAbsolutePath());
        double dur = parse(mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)) / 1000.0;
        double w = parse(mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)), h = parse(mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT));
        double rot = parse(mmr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION));
        if (rot == 90 || rot == 270) { double t = w; w = h; h = t; }
        Bitmap frame = mmr.getFrameAtTime(Math.min(200000L, (long) (dur * 500000L)), MediaMetadataRetriever.OPTION_CLOSEST_SYNC);
        mmr.release();
        String poster = "";
        if (frame != null) { poster = jpegBase64(fit(frame, 1600)); }
        JSObject r = new JSObject();
        r.put("kind", "video"); r.put("id", id); r.put("dur", dur); r.put("w", w); r.put("h", h); r.put("bytes", dest.length()); r.put("poster", poster);
        call.resolve(r);
    }

    private void resolveImage(PluginCall call, Uri uri) throws Exception {
        ContentResolver cr = getContext().getContentResolver();
        BitmapFactory.Options o = new BitmapFactory.Options(); o.inJustDecodeBounds = true;
        try (InputStream in = cr.openInputStream(uri)) { BitmapFactory.decodeStream(in, null, o); }
        int sample = 1; while (Math.max(o.outWidth, o.outHeight) / (sample * 2) >= 1600) sample *= 2;
        BitmapFactory.Options o2 = new BitmapFactory.Options(); o2.inSampleSize = sample;
        Bitmap bmp; try (InputStream in = cr.openInputStream(uri)) { bmp = BitmapFactory.decodeStream(in, null, o2); }
        if (bmp == null) { call.reject("could not read the photo"); return; }
        int orient = ExifInterface.ORIENTATION_NORMAL;
        try (InputStream in = cr.openInputStream(uri)) { orient = new ExifInterface(in).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL); } catch (Exception ignored) {}
        Matrix m = new Matrix();
        switch (orient) {
            case ExifInterface.ORIENTATION_ROTATE_90: m.postRotate(90); break;
            case ExifInterface.ORIENTATION_ROTATE_180: m.postRotate(180); break;
            case ExifInterface.ORIENTATION_ROTATE_270: m.postRotate(270); break;
            case ExifInterface.ORIENTATION_FLIP_HORIZONTAL: m.postScale(-1, 1); break;
            case ExifInterface.ORIENTATION_FLIP_VERTICAL: m.postScale(1, -1); break;
            default: break;
        }
        if (!m.isIdentity()) bmp = Bitmap.createBitmap(bmp, 0, 0, bmp.getWidth(), bmp.getHeight(), m, true);
        JSObject r = new JSObject(); r.put("kind", "image"); r.put("image", jpegBase64(fit(bmp, 1600))); call.resolve(r);
    }

    private static double parse(String s) { try { return s == null ? 0 : Double.parseDouble(s); } catch (Exception e) { return 0; } }

    private static Bitmap fit(Bitmap b, int max) {
        float s = Math.min(1f, (float) max / Math.max(b.getWidth(), b.getHeight()));
        return s >= 1f ? b : Bitmap.createScaledBitmap(b, Math.round(b.getWidth() * s), Math.round(b.getHeight() * s), true);
    }

    private static String jpegBase64(Bitmap b) {
        ByteArrayOutputStream bos = new ByteArrayOutputStream(); b.compress(Bitmap.CompressFormat.JPEG, 86, bos);
        return Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP);
    }

    // ---------------------------------------------------------------- the video card

    @PluginMethod
    public void makeVideoCard(PluginCall call) {
        String id = call.getString("id"), b64 = call.getString("overlay");
        if (id == null || b64 == null) { call.reject("missing fields"); return; }
        final double seconds = call.getDouble("seconds", 6.0);
        final int width = call.getInt("width", 1080), height = call.getInt("height", 1920);
        final File src = clipFile(id);
        if (!src.exists()) { call.reject("the clip is no longer on this phone"); return; }
        final byte[] png = Base64.decode(b64, Base64.DEFAULT);
        BitmapFactory.Options oo = new BitmapFactory.Options();
        oo.inPremultiplied = false;   // keep the PNG's straight (not pre-multiplied) alpha: the video effects blend it themselves, and pre-multiplied pixels came out too dark
        final Bitmap overlay = BitmapFactory.decodeByteArray(png, 0, png.length, oo);
        if (overlay == null) { call.reject("bad overlay"); return; }
        final File out = new File(getContext().getCacheDir(), "trackside-pass-race-" + (System.currentTimeMillis() / 1000) + ".mp4");
        if (out.exists()) out.delete();
        main.post(() -> {
            try {
                Context ctx = getContext();
                MediaItem item = new MediaItem.Builder().setUri(Uri.fromFile(src))
                        .setClippingConfiguration(new MediaItem.ClippingConfiguration.Builder().setStartPositionMs(0).setEndPositionMs((long) (seconds * 1000)).build()).build();
                Effects effects = new Effects(ImmutableList.of(),
                        ImmutableList.of(Presentation.createForWidthAndHeight(width, height, Presentation.LAYOUT_SCALE_TO_FIT_WITH_CROP),
                                new OverlayEffect(ImmutableList.of(BitmapOverlay.createStaticBitmapOverlay(overlay)))));
                EditedMediaItem edited = new EditedMediaItem.Builder(item).setEffects(effects).build();
                final long t0 = System.currentTimeMillis();
                final Transformer tr = new Transformer.Builder(ctx).setVideoMimeType(MimeTypes.VIDEO_H264).setAudioMimeType(MimeTypes.AUDIO_AAC)
                        .addListener(new Transformer.Listener() {
                            @Override public void onCompleted(Composition composition, ExportResult r) {
                                JSObject o = new JSObject(); o.put("path", out.getAbsolutePath()); o.put("bytes", out.length()); o.put("seconds", Math.min(seconds, r.durationMs / 1000.0 + 0.0001));
                                call.resolve(o);
                            }
                            @Override public void onError(Composition composition, ExportResult r, ExportException e) { call.reject("the export failed: " + e.getMessage()); }
                        }).build();
                tr.start(edited, out.getAbsolutePath());
                final ProgressHolder ph = new ProgressHolder();
                final Runnable poll = new Runnable() {
                    @Override public void run() {
                        if (tr.getProgress(ph) != Transformer.PROGRESS_STATE_NOT_STARTED) { JSObject p = new JSObject(); p.put("p", ph.progress / 100.0); notifyListeners("progress", p); }
                        if (!out.exists() || System.currentTimeMillis() - t0 < 120000) main.postDelayed(this, 200);
                    }
                };
                main.postDelayed(poll, 200);
            } catch (Exception e) { call.reject("could not make the video: " + e.getMessage()); }
        });
    }

    // ---------------------------------------------------------------- play and share

    private Uri shareUri(String path) {
        return FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", new File(path));
    }

    @PluginMethod
    public void previewVideo(PluginCall call) {
        String path = call.getString("path"); if (path == null) { call.reject("missing path"); return; }
        Intent i = new Intent(Intent.ACTION_VIEW); i.setDataAndType(shareUri(path), "video/mp4");
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        try { getContext().startActivity(i); call.resolve(); } catch (Exception e) { call.reject("no video player found"); }
    }

    @PluginMethod
    public void shareFile(PluginCall call) {
        String path = call.getString("path"); if (path == null) { call.reject("missing path"); return; }
        Intent s = new Intent(Intent.ACTION_SEND); s.setType("video/mp4"); s.putExtra(Intent.EXTRA_STREAM, shareUri(path)); s.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        Intent chooser = Intent.createChooser(s, "Share your video card"); chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(chooser);
        JSObject r = new JSObject(); r.put("done", true); call.resolve(r);
    }

    @PluginMethod
    public void deleteVideo(PluginCall call) {
        String id = call.getString("id"); if (id != null) clipFile(id).delete();
        call.resolve();
    }
}
