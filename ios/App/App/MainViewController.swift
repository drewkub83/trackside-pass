import UIKit
import Capacitor

/// The web view controller, with the app's own plugins registered (Live Activities).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(LiveSessionPlugin())
    }
}
