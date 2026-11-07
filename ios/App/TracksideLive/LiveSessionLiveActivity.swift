import ActivityKit
import WidgetKit
import SwiftUI

private func kindColor(_ kind: String) -> Color {
    switch kind {
    case "qualifying": return Color(red: 0.89, green: 0.65, blue: 0.18)   // amber, like the schedule
    case "race": return Color(red: 0.42, green: 0.39, blue: 0.85)         // indigo
    default: return Color(white: 0.6)
    }
}
private func kindLabel(_ kind: String) -> String {
    switch kind { case "qualifying": return "Qualifying"; case "race": return "Race"; case "practice": return "Practice"; default: return "Session" }
}

/// The timing line. It must read correctly with NO update from the app (the app can only update while it is open), so it is built from text the system keeps current by itself:
/// the time range, a relative time ("in 12 min" before the start, "3 min ago" after it) and a bar that fills from the start to the end of the session.
/// When iOS marks the activity stale at the start time (the app sets that), "On track now" replaces the "in 12 min".
@available(iOS 16.2, *)
private struct SessionTimer: View {
    let state: LiveSessionAttributes.ContentState
    let stale: Bool
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(spacing: 5) {
                Text(state.start, style: .time); Text("to").foregroundStyle(.secondary); Text(state.end, style: .time)
            }
            HStack(spacing: 5) {
                if state.live || stale {
                    Text("On track now").foregroundStyle(kindColor(state.kind))
                    Text("· ends in").foregroundStyle(.secondary)
                    Text(timerInterval: state.start...max(state.end, state.start.addingTimeInterval(1)), countsDown: true).monospacedDigit()
                } else {
                    Text("Starts").foregroundStyle(.secondary); Text(state.start, style: .relative)
                }
            }
            ProgressView(timerInterval: state.start...max(state.end, state.start.addingTimeInterval(1)), countsDown: false, label: { EmptyView() }, currentValueLabel: { EmptyView() })
                .progressViewStyle(.linear).tint(kindColor(state.kind))
        }
    }
}

@available(iOS 16.2, *)
struct LiveSessionLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LiveSessionAttributes.self) { context in
            let s = context.state
            HStack(alignment: .center, spacing: 12) {
                RoundedRectangle(cornerRadius: 3).fill(kindColor(s.kind)).frame(width: 4)
                VStack(alignment: .leading, spacing: 3) {
                    Text("\(context.attributes.track) · \(s.series)").font(.caption).foregroundStyle(.secondary)
                    Text(s.sessionName).font(.headline).lineLimit(2)
                    SessionTimer(state: s, stale: context.isStale).font(.subheadline)
                    if !s.nextName.isEmpty, let ns = s.nextStart {
                        HStack(spacing: 4) { Text("Next:").foregroundStyle(.secondary); Text(s.nextName).lineLimit(1); Text(ns, style: .time).foregroundStyle(.secondary) }.font(.caption)
                    }
                }
                Spacer(minLength: 0)
            }
            .padding(14)
            .activityBackgroundTint(Color.black.opacity(0.55))
            .activitySystemActionForegroundColor(.white)
            .widgetURL(URL(string: "https://tracksidepass.com/?track=\(context.attributes.trackId)"))
        } dynamicIsland: { context in
            let s = context.state
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) { Image(systemName: "flag.checkered").foregroundStyle(kindColor(s.kind)) }
                DynamicIslandExpandedRegion(.trailing) { Text(kindLabel(s.kind)).font(.caption).foregroundStyle(kindColor(s.kind)) }
                DynamicIslandExpandedRegion(.center) { Text(s.sessionName).font(.headline).lineLimit(1) }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        SessionTimer(state: s, stale: context.isStale).font(.subheadline)
                        Text("\(context.attributes.track) · \(s.series)").font(.caption).foregroundStyle(.secondary)
                    }
                }
            } compactLeading: {
                Image(systemName: "flag.checkered").foregroundStyle(kindColor(s.kind))
            } compactTrailing: {
                // short and numeric so it never truncates: minutes and seconds left (live) or until the start (to come)
                Group {
                    if s.live || context.isStale { Text(timerInterval: s.start...max(s.end, s.start.addingTimeInterval(1)), pauseTime: nil, countsDown: true, showsHours: false) }
                    else { Text(timerInterval: Date.now...max(s.start, Date.now.addingTimeInterval(1)), pauseTime: nil, countsDown: true, showsHours: false) }
                }
                .monospacedDigit().font(.caption2).minimumScaleFactor(0.7).lineLimit(1).frame(width: 46)
            } minimal: {
                Image(systemName: "flag.checkered").foregroundStyle(kindColor(s.kind))
            }
            .keylineTint(kindColor(s.kind))
        }
    }
}
