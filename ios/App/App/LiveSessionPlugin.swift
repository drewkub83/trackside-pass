import Foundation
import Capacitor
import ActivityKit

/// JavaScript side: window.Capacitor.Plugins.LiveSession  (sync / end / supported)
/// The web app only calls sync() when the phone's location puts it at a track, so there is never an activity for a track you are not at.
@objc(LiveSessionPlugin)
public class LiveSessionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LiveSessionPlugin"
    public let jsName = "LiveSession"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "supported", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sync", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise)
    ]

    @objc func supported(_ call: CAPPluginCall) {
        if #available(iOS 16.2, *) { call.resolve(["ok": ActivityAuthorizationInfo().areActivitiesEnabled]) } else { call.resolve(["ok": false]) }
    }

    @objc func sync(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else { call.resolve(["state": "unsupported"]); return }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { call.resolve(["state": "disabled"]); return }
        guard let trackId = call.getString("trackId"), let track = call.getString("track"), let name = call.getString("sessionName"),
              let startMs = call.getDouble("startMs"), let endMs = call.getDouble("endMs") else { call.reject("missing fields"); return }
        let start = Date(timeIntervalSince1970: startMs / 1000), end = Date(timeIntervalSince1970: endMs / 1000)
        let nextStart = call.getDouble("nextStartMs").map { Date(timeIntervalSince1970: $0 / 1000) }
        let state = LiveSessionAttributes.ContentState(sessionName: name, series: call.getString("series") ?? "", kind: call.getString("kind") ?? "other",
                                                       start: start, end: end, nextName: call.getString("nextName") ?? "", nextStart: nextStart)
        // Stale at the start time: the lock screen then flips from "Starts in" to "On track now" by itself, with no update from us.
        let content = ActivityContent(state: state, staleDate: start > Date() ? start : end)
        Task {
            // an activity for any other track is ended: only the track you are at is shown
            for a in Activity<LiveSessionAttributes>.activities where a.attributes.trackId != trackId { await a.end(nil, dismissalPolicy: .immediate) }
            if let existing = Activity<LiveSessionAttributes>.activities.first(where: { $0.attributes.trackId == trackId }) {
                await existing.update(content)
                call.resolve(["state": "updated"])
            } else {
                do {
                    _ = try Activity.request(attributes: LiveSessionAttributes(trackId: trackId, track: track), content: content, pushType: nil)
                    call.resolve(["state": "started"])
                } catch { call.resolve(["state": "error", "message": "\(error)"]) }
            }
        }
    }

    @objc func end(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else { call.resolve(); return }
        Task {
            for a in Activity<LiveSessionAttributes>.activities { await a.end(nil, dismissalPolicy: .immediate) }
            call.resolve()
        }
    }
}
