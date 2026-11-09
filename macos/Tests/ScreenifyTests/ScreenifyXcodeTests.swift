import CryptoKit
import Foundation
import XCTest

final class ScreenifyXcodeTests: XCTestCase {
    private var builtAppURL: URL {
        if let builtProductsDir = ProcessInfo.processInfo.environment["BUILT_PRODUCTS_DIR"] {
            let candidate = URL(fileURLWithPath: builtProductsDir).appendingPathComponent("Screenify.app")
            if FileManager.default.fileExists(atPath: candidate.path) {
                return candidate
            }
        }
        let testBundleDir = Bundle(for: ScreenifyXcodeTests.self).bundleURL.deletingLastPathComponent()
        let siblingCandidate = testBundleDir.appendingPathComponent("Screenify.app")
        if FileManager.default.fileExists(atPath: siblingCandidate.path) {
            return siblingCandidate
        }
        return URL(fileURLWithPath: "/Applications/Screenify.app")
    }

    func testAppBundleStructureAndResources() throws {
        let appURL = builtAppURL
        let fm = FileManager.default
        XCTAssertTrue(fm.fileExists(atPath: appURL.path), "Screenify.app bundle must exist at \(appURL.path)")

        let requiredPaths = [
            "Contents/MacOS/Screenify",
            "Contents/Info.plist",
            "Contents/Resources/app.asar",
            "Contents/Resources/RecordingCoordinator-arm64",
            "Contents/Resources/get-windows-arm64",
            "Contents/Resources/activate-window-arm64",
            "Contents/Resources/ffmpeg-arm64",
            "Contents/Resources/deep-filter-arm64",
            "Contents/Frameworks/Electron Framework.framework",
            "Contents/Frameworks/Screenify Helper.app",
            "Contents/Frameworks/Screenify Helper (GPU).app",
            "Contents/Frameworks/Screenify Helper (Plugin).app",
            "Contents/Frameworks/Screenify Helper (Renderer).app",
        ]

        for relPath in requiredPaths {
            let fullPath = appURL.appendingPathComponent(relPath).path
            XCTAssertTrue(fm.fileExists(atPath: fullPath), "Missing required bundle component: \(relPath)")
        }
    }

    func testCodeSignatureAndEntitlements() throws {
        let appURL = builtAppURL
        let rendererURL = appURL.appendingPathComponent("Contents/Frameworks/Screenify Helper (Renderer).app")

        // Verify codesign validity on outer bundle
        let verifyProc = Process()
        verifyProc.executableURL = URL(fileURLWithPath: "/usr/bin/codesign")
        verifyProc.arguments = ["--verify", "--deep", "--strict", appURL.path]
        let verifyErr = Pipe()
        verifyProc.standardError = verifyErr
        try verifyProc.run()
        verifyProc.waitUntilExit()
        let errText = String(data: verifyErr.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        XCTAssertEqual(verifyProc.terminationStatus, 0, "codesign --verify failed: \(errText)")

        // Verify Renderer Helper has V8 JIT entitlements
        let entProc = Process()
        entProc.executableURL = URL(fileURLWithPath: "/usr/bin/codesign")
        entProc.arguments = ["-d", "--entitlements", ":-", rendererURL.path]
        let entOut = Pipe()
        entProc.standardOutput = entOut
        entProc.standardError = Pipe()
        try entProc.run()
        entProc.waitUntilExit()
        let entXml = String(data: entOut.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        XCTAssertTrue(entXml.contains("com.apple.security.cs.allow-jit"), "Renderer helper must include allow-jit entitlement")
        XCTAssertTrue(entXml.contains("com.apple.security.cs.allow-unsigned-executable-memory"), "Renderer helper must include allow-unsigned-executable-memory entitlement")
    }

    func testNativeGetWindowsHelperOutput() throws {
        let binURL = builtAppURL.appendingPathComponent("Contents/Resources/get-windows-arm64")
        let proc = Process()
        proc.executableURL = binURL
        proc.arguments = ["true"]
        let outPipe = Pipe()
        proc.standardOutput = outPipe
        try proc.run()
        proc.waitUntilExit()

        XCTAssertEqual(proc.terminationStatus, 0, "get-windows-arm64 should exit with code 0")
        let data = outPipe.fileHandleForReading.readDataToEndOfFile()
        let parsed = try JSONSerialization.jsonObject(with: data, options: []) as? [[String: Any]]
        XCTAssertNotNil(parsed, "get-windows-arm64 output must be a valid JSON array of window dictionaries")
    }

    func testAsarIntegrityAndManifest() throws {
        let appURL = builtAppURL
        let asarURL = appURL.appendingPathComponent("Contents/Resources/app.asar")
        let plistURL = appURL.appendingPathComponent("Contents/Info.plist")

        let handle = try FileHandle(forReadingFrom: asarURL)
        defer { try? handle.close() }

        guard let preamble = try handle.read(upToCount: 16), preamble.count == 16 else {
            XCTFail("Unable to read 16-byte ASAR pickle header")
            return
        }

        let headerStringSize = preamble.withUnsafeBytes { rawBuf -> UInt32 in
            rawBuf.load(fromByteOffset: 12, as: UInt32.self).littleEndian
        }
        guard let headerData = try handle.read(upToCount: Int(headerStringSize)),
              headerData.count == Int(headerStringSize) else {
            XCTFail("Unable to read ASAR header JSON bytes")
            return
        }

        let computedHash = SHA256.hash(data: headerData)
            .compactMap { String(format: "%02x", $0) }
            .joined()

        let plistData = try Data(contentsOf: plistURL)
        let plist = try XCTUnwrap(
            PropertyListSerialization.propertyList(from: plistData, options: [], format: nil) as? [String: Any]
        )
        let integrity = try XCTUnwrap(plist["ElectronAsarIntegrity"] as? [String: Any])
        let asarEntry = try XCTUnwrap(integrity["Resources/app.asar"] as? [String: Any])
        let plistHash = try XCTUnwrap(asarEntry["hash"] as? String)

        XCTAssertEqual(computedHash, plistHash, "app.asar SHA256 header hash must match ElectronAsarIntegrity in Info.plist")

        let manifest = try XCTUnwrap(JSONSerialization.jsonObject(with: headerData, options: []) as? [String: Any])
        let rootFiles = try XCTUnwrap(manifest["files"] as? [String: Any])
        let mainEntry = try XCTUnwrap(rootFiles["main"] as? [String: Any])
        let mainFiles = try XCTUnwrap(mainEntry["files"] as? [String: Any])

        for expectedFile in ["index.js", "preload.js", "editorPresets.js", "teleprompter.js", "aiEditService.js", "cursorMotionPipeline.js"] {
            XCTAssertNotNil(mainFiles[expectedFile], "app.asar main/ must contain \(expectedFile)")
        }
    }
}
