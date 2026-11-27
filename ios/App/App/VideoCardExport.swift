import Foundation
import AVFoundation
import CoreGraphics
import QuartzCore

/// The Race Log's video card export, kept free of UIKit so it can also be run from a small test on a Mac:
/// the first `seconds` of the clip, filled into a width x height frame, with a transparent overlay image laid over every frame, written as an MP4.
enum VideoCardExport {
    struct Result { let url: URL; let bytes: Int; let seconds: Double }
    enum Failure: Error, CustomStringConvertible {
        case message(String)
        var description: String { if case .message(let m) = self { return m }; return "failed" }
    }

    static func export(source: URL, overlay: CGImage, seconds: Double, width W: CGFloat, height H: CGFloat, output: URL, progress: ((Float) -> Void)? = nil) async throws -> Result {
        let asset = AVURLAsset(url: source)
        guard let vt = try await asset.loadTracks(withMediaType: .video).first else { throw Failure.message("no video in that clip") }
        let total = CMTimeGetSeconds(try await asset.load(.duration))
        let secs = max(0.5, min(seconds, total))
        let range = CMTimeRange(start: .zero, duration: CMTime(seconds: secs, preferredTimescale: 600))
        let comp = AVMutableComposition()
        guard let cvt = comp.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else { throw Failure.message("could not build the video") }
        try cvt.insertTimeRange(range, of: vt, at: .zero)
        if let at = try await asset.loadTracks(withMediaType: .audio).first, let cat = comp.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
            try? cat.insertTimeRange(range, of: at, at: .zero)
        }
        let natural = try await vt.load(.naturalSize), pt = try await vt.load(.preferredTransform)
        let r = CGRect(origin: .zero, size: natural).applying(pt), ow = abs(r.width), oh = abs(r.height)
        let sc = max(W / ow, H / oh)   // fill the frame, cropping the sides or the top and bottom
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
        try? FileManager.default.removeItem(at: output)
        guard let ex = AVAssetExportSession(asset: comp, presetName: AVAssetExportPresetHighestQuality) else { throw Failure.message("could not start the export") }
        ex.outputURL = output; ex.outputFileType = .mp4; ex.videoComposition = vc; ex.shouldOptimizeForNetworkUse = true
        let timer = DispatchSource.makeTimerSource(queue: .main)
        timer.schedule(deadline: .now(), repeating: 0.15)
        timer.setEventHandler { progress?(ex.progress) }
        timer.resume()
        return try await withCheckedThrowingContinuation { cont in
            ex.exportAsynchronously {
                timer.cancel()
                if ex.status == .completed {
                    let bytes = (try? FileManager.default.attributesOfItem(atPath: output.path)[.size] as? Int) ?? 0
                    cont.resume(returning: Result(url: output, bytes: bytes, seconds: secs))
                } else { cont.resume(throwing: Failure.message("the export failed: \(ex.error?.localizedDescription ?? "unknown")")) }
            }
        }
    }
}
