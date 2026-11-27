import Foundation
import Capacitor
import AVFoundation
import AVKit
import PhotosUI
import UIKit
import UniformTypeIdentifiers

/// JavaScript side: window.Capacitor.Plugins.VideoCard  (pickMedia / makeVideoCard / previewVideo / shareFile / deleteVideo)
/// The Race Log's video card, made natively: the phone's own video tools lay the card's overlay (a transparent PNG the web page draws) over the first seconds of the clip
/// in a second or two, instead of recording the screen in real time. A picked clip is kept as a real file in Documents/RaceLog.
@objc(VideoCardPlugin)
public class VideoCardPlugin: CAPPlugin, CAPBridgedPlugin, PHPickerViewControllerDelegate {
    public let identifier = "VideoCardPlugin"
    public let jsName = "VideoCard"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "pickMedia", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "makeVideoCard", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "previewVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "shareFile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteVideo", returnType: CAPPluginReturnPromise)
    ]

    private var pickCall: CAPPluginCall?

    private var folder: URL {
        let d = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("RaceLog", isDirectory: true)
        try? FileManager.default.createDirectory(at: d, withIntermediateDirectories: true)
        return d
    }
    private func clipURL(_ id: String) -> URL { folder.appendingPathComponent((id as NSString).lastPathComponent) }

    // MARK: picking

    @objc func pickMedia(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            var cfg = PHPickerConfiguration(photoLibrary: .shared())
            cfg.filter = .any(of: [.images, .videos])
            cfg.selectionLimit = 1
            cfg.preferredAssetRepresentationMode = .current
            let picker = PHPickerViewController(configuration: cfg)
            picker.delegate = self
            self.pickCall = call
            guard let vc = self.bridge?.viewController else { call.reject("no view controller"); self.pickCall = nil; return }
            vc.present(picker, animated: true)
        }
    }

    public func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)
        guard let call = pickCall else { return }
        pickCall = nil
        guard let item = results.first?.itemProvider else { call.resolve(["cancelled": true]); return }
        if item.hasItemConformingToTypeIdentifier(UTType.movie.identifier) {
            item.loadFileRepresentation(forTypeIdentifier: UTType.movie.identifier) { url, error in
                guard let url = url else { call.reject("could not read the video: \(error?.localizedDescription ?? "")"); return }
                // the system deletes the temporary file when this closure returns: copy it now
                let ext = url.pathExtension.isEmpty ? "mov" : url.pathExtension.lowercased()
                let id = UUID().uuidString + "." + ext
                let dest = self.clipURL(id)
                do { try? FileManager.default.removeItem(at: dest); try FileManager.default.copyItem(at: url, to: dest) } catch { call.reject("could not keep the video: \(error.localizedDescription)"); return }
                Task {
                    let asset = AVURLAsset(url: dest)
                    let dur = (try? await asset.load(.duration)).map { CMTimeGetSeconds($0) } ?? 0
                    var w = 0.0, h = 0.0
                    if let t = try? await asset.loadTracks(withMediaType: .video).first, let n = try? await t.load(.naturalSize), let pt = try? await t.load(.preferredTransform) {
                        let r = CGRect(origin: .zero, size: n).applying(pt); w = Double(abs(r.width)); h = Double(abs(r.height))
                    }
                    let gen = AVAssetImageGenerator(asset: asset); gen.appliesPreferredTrackTransform = true; gen.maximumSize = CGSize(width: 1600, height: 1600)
                    var poster = ""
                    if let cg = try? gen.copyCGImage(at: CMTime(seconds: min(0.2, max(0, dur / 2)), preferredTimescale: 600), actualTime: nil), let d = UIImage(cgImage: cg).jpegData(compressionQuality: 0.86) { poster = d.base64EncodedString() }
                    let bytes = (try? FileManager.default.attributesOfItem(atPath: dest.path)[.size] as? Int) ?? 0
                    call.resolve(["kind": "video", "id": id, "dur": dur, "w": w, "h": h, "bytes": bytes, "poster": poster])
                }
            }
        } else if item.canLoadObject(ofClass: UIImage.self) {
            item.loadObject(ofClass: UIImage.self) { obj, error in
                guard let img = obj as? UIImage else { call.reject("could not read the photo: \(error?.localizedDescription ?? "")"); return }
                let s = min(1, 1600 / max(img.size.width, img.size.height))
                let size = CGSize(width: (img.size.width * s).rounded(), height: (img.size.height * s).rounded())
                let fmt = UIGraphicsImageRendererFormat.default(); fmt.scale = 1
                let out = UIGraphicsImageRenderer(size: size, format: fmt).jpegData(withCompressionQuality: 0.86) { _ in img.draw(in: CGRect(origin: .zero, size: size)) }
                call.resolve(["kind": "image", "image": out.base64EncodedString()])
            }
        } else { call.resolve(["cancelled": true]) }
    }

    // MARK: the video card

    @objc func makeVideoCard(_ call: CAPPluginCall) {
        guard let id = call.getString("id"), let b64 = call.getString("overlay"), let overlayData = Data(base64Encoded: b64), let overlay = UIImage(data: overlayData)?.cgImage else { call.reject("missing fields"); return }
        let seconds = call.getDouble("seconds") ?? 6, W = CGFloat(call.getDouble("width") ?? 1080), H = CGFloat(call.getDouble("height") ?? 1920)
        let src = clipURL(id)
        guard FileManager.default.fileExists(atPath: src.path) else { call.reject("the clip is no longer on this phone"); return }
        Task {
            do {
                let asset = AVURLAsset(url: src)
                guard let vt = try await asset.loadTracks(withMediaType: .video).first else { call.reject("no video in that clip"); return }
                let total = CMTimeGetSeconds(try await asset.load(.duration))
                let secs = max(0.5, min(seconds, total))
                let range = CMTimeRange(start: .zero, duration: CMTime(seconds: secs, preferredTimescale: 600))
                let comp = AVMutableComposition()
                guard let cvt = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else { call.reject("could not build the video"); return }
                try cvt.insertTimeRange(range, of: vt, at: .zero)
                if let at = try await asset.loadTracks(withMediaType: .audio).first, let cat = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
                    try? cat.insertTimeRange(range, of: at, at: .zero)
                }
                let natural = try await vt.load(.naturalSize), pt = try await vt.load(.preferredTransform)
                let r = CGRect(origin: .zero, size: natural).applying(pt), ow = abs(r.width), oh = abs(r.height)
                let sc = max(W / ow, H / oh)   // fill the 9:16 frame, cropping the sides or the top and bottom
                let t = pt.concatenating(CGAffineTransform(translationX: -r.origin.x, y: -r.origin.y))
                    .concatenating(CGAffineTransform(scaleX: sc, y: sc))
                    .concatenating(CGAffineTransform(translationX: (W - ow * sc) / 2, y: (H - oh * sc) / 2))
                let li = AVMutableVideoCompositionLayerInstruction(assetTrack: cvt); li.setTransform(t, at: .zero)
                let ins = AVMutableVideoCompositionInstruction(); ins.timeRange = CMTimeRange(start: .zero, duration: comp.duration); ins.layerInstructions = [li]
                let vc = AVMutableVideoComposition(); vc.renderSize = CGSize(width: W, height: H); vc.frameDuration = CMTime(value: 1, timescale: 30); vc.instructions = [ins]
                let parent = CALayer(); parent.frame = CGRect(x: 0, y: 0, width: W, height: H)
                let videoLayer = CALayer(); videoLayer.frame = parent.frame
                let ov = CALayer(); ov.frame = parent.frame; ov.contents = overlay; ov.contentsGravity = .resize
                parent.addSublayer(videoLayer); parent.addSublayer(ov)
                vc.animationTool = AVVideoCompositionCoreAnimationTool(postProcessingAsVideoLayer: videoLayer, in: parent)
                let out = FileManager.default.temporaryDirectory.appendingPathComponent("trackside-pass-race-\(Int(Date().timeIntervalSince1970)).mp4")
                try? FileManager.default.removeItem(at: out)
                guard let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetHighestQuality) else { call.reject("could not start the export"); return }
                ex.outputURL = out; ex.outputFileType = .mp4; ex.videoComposition = vc; ex.shouldOptimizeForNetworkUse = true
                let timer = DispatchSource.makeTimerSource(queue: .main)
                timer.schedule(deadline: .now(), repeating: 0.15)
                timer.setEventHandler { [weak self] in self?.notifyListeners("progress", data: ["p": Double(ex.progress)]) }
                timer.resume()
                ex.exportAsynchronously {
                    timer.cancel()
                    if ex.status == .completed {
                        let bytes = (try? FileManager.default.attributesOfItem(atPath: out.path)[.size] as? Int) ?? 0
                        call.resolve(["path": out.path, "bytes": bytes, "seconds": secs])
                    } else { call.reject("the export failed: \(ex.error?.localizedDescription ?? "unknown")") }
                }
            } catch { call.reject("could not make the video: \(error.localizedDescription)") }
        }
    }

    // MARK: play and share

    @objc func previewVideo(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else { call.reject("missing path"); return }
        DispatchQueue.main.async {
            let pv = AVPlayerViewController(); pv.player = AVPlayer(url: URL(fileURLWithPath: path))
            self.bridge?.viewController?.present(pv, animated: true) { pv.player?.play() }
            call.resolve()
        }
    }

    @objc func shareFile(_ call: CAPPluginCall) {
        guard let path = call.getString("path") else { call.reject("missing path"); return }
        DispatchQueue.main.async {
            let av = UIActivityViewController(activityItems: [URL(fileURLWithPath: path)], applicationActivities: nil)
            if let pop = av.popoverPresentationController, let v = self.bridge?.viewController?.view { pop.sourceView = v; pop.sourceRect = CGRect(x: v.bounds.midX, y: v.bounds.maxY - 40, width: 1, height: 1); pop.permittedArrowDirections = [] }
            av.completionWithItemsHandler = { _, done, _, _ in call.resolve(["done": done]) }
            self.bridge?.viewController?.present(av, animated: true)
        }
    }

    @objc func deleteVideo(_ call: CAPPluginCall) {
        if let id = call.getString("id") { try? FileManager.default.removeItem(at: clipURL(id)) }
        call.resolve()
    }
}
