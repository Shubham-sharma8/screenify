import AppKit
import Foundation

/// Native Xcode build bridge for Screenify.app.
/// During Xcode's build pipeline:
/// 1. Xcode compiles this target to establish build settings, signing identity, and entitlements.
/// 2. The "Assemble & Sign Screenify Electron Bundle" Run Script phase packages `app.asar`,
///    injects the Electron runtime (`Contents/MacOS/Screenify` and `Contents/Frameworks/*`),
///    embeds the freshly compiled `get-windows-arm64` and `activate-window-arm64` tools,
///    and signs all nested frameworks and Helper `.app` bundles with Xcode's signing identity.
/// 3. Xcode's final `CodeSign` step signs the outer `Screenify.app` bundle with `Screenify.entitlements`.
@main
public struct ScreenifyXcodeLauncher {
    public static let appName = "Screenify"
    public static let version = "1.12.0"
    public static let bundleIdentifier = "com.screenCharm.app"

    public static func main() {
        let bundlePath = Bundle.main.bundlePath
        let electronExecutable = (bundlePath as NSString).appendingPathComponent("Contents/MacOS/Screenify")
        print("Screenify \(version) (\(bundleIdentifier)) at \(electronExecutable)")
    }
}
