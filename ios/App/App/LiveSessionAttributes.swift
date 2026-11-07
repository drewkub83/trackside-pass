import Foundation
import ActivityKit

/// Shared by the app (which starts and updates the activity) and the TracksideLive widget extension (which draws it).
/// The activity follows ONE track: the one the phone is at.
@available(iOS 16.2, *)
public struct LiveSessionAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var sessionName: String    // "Qualifying - Hypercar"
        public var series: String         // "FIA WEC"
        public var kind: String           // "qualifying", "race", "practice" or "other"
        public var start: Date
        public var end: Date
        public var nextName: String       // the session after this one ("" when none)
        public var nextStart: Date?
        public var live: Bool             // true once the session is on track (set by the app when it syncs)
        public init(sessionName: String, series: String, kind: String, start: Date, end: Date, nextName: String, nextStart: Date?, live: Bool) {
            self.sessionName = sessionName; self.series = series; self.kind = kind; self.start = start; self.end = end; self.nextName = nextName; self.nextStart = nextStart; self.live = live
        }
    }
    public var trackId: String
    public var track: String              // short name, "Monza"
    public init(trackId: String, track: String) { self.trackId = trackId; self.track = track }
}
