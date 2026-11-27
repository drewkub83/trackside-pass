import UIKit
import Capacitor

/// The web view controller, with the app's own plugins registered (Live Activities, the Race Log video card).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(LiveSessionPlugin())
        bridge?.registerPluginInstance(VideoCardPlugin())
    }
}
