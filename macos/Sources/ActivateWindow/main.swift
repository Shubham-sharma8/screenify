import AppKit
import ApplicationServices
import Foundation

struct WindowFrame: Codable {
    var x: Double?
    var y: Double?
    var width: Double?
    var height: Double?
}

struct WindowInfo: Codable {
    var title: String?
    var applicationName: String?
    var applicationProcessId: Int32?
    var level: Int?
    var frame: WindowFrame?

    enum CodingKeys: String, CodingKey {
        case title
        case applicationName = "application_name"
        case applicationProcessId = "application_process_id"
        case level
        case frame
    }
}

func isValidJSON(_ input: String) -> Bool {
    let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)
    guard trimmed.hasPrefix("{") || trimmed.hasPrefix("[") else {
        return false
    }
    guard let data = trimmed.data(using: .utf8) else {
        return false
    }
    return (try? JSONSerialization.jsonObject(with: data, options: [])) != nil
}

@discardableResult
func raiseMatchingAXWindow(pid: pid_t, matchingTitle targetTitle: String) -> Bool {
    let appElement = AXUIElementCreateApplication(pid)
    var value: CFTypeRef?
    let result = AXUIElementCopyAttributeValue(appElement, kAXWindowsAttribute as CFString, &value)
    guard result == .success, let axWindows = value as? [AXUIElement] else {
        return false
    }

    let normalizedTarget = targetTitle.lowercased()
    for window in axWindows {
        var titleValue: CFTypeRef?
        if AXUIElementCopyAttributeValue(window, kAXTitleAttribute as CFString, &titleValue) == .success,
           let windowTitle = titleValue as? String {
            if windowTitle == targetTitle || windowTitle.lowercased().contains(normalizedTarget) {
                AXUIElementSetAttributeValue(window, kAXMainAttribute as CFString, kCFBooleanTrue)
                AXUIElementPerformAction(window, kAXRaiseAction as CFString)
                return true
            }
        }
    }
    return false
}

func activateWindow(matchingTitle targetTitle: String, preferredPid: pid_t? = nil, preferredAppName: String? = nil) {
    let runningApps = NSWorkspace.shared.runningApplications.filter {
        $0.activationPolicy == .regular
    }

    if let pid = preferredPid,
       let targetApp = runningApps.first(where: { $0.processIdentifier == pid }) {
        targetApp.activate(options: [.activateIgnoringOtherApps])
        _ = raiseMatchingAXWindow(pid: pid, matchingTitle: targetTitle)
        return
    }

    if let appName = preferredAppName, !appName.isEmpty,
       let targetApp = runningApps.first(where: {
           ($0.localizedName ?? "").caseInsensitiveCompare(appName) == .orderedSame
       }) {
        targetApp.activate(options: [.activateIgnoringOtherApps])
        _ = raiseMatchingAXWindow(pid: targetApp.processIdentifier, matchingTitle: targetTitle)
        return
    }

    for app in runningApps {
        if raiseMatchingAXWindow(pid: app.processIdentifier, matchingTitle: targetTitle) {
            app.activate(options: [.activateIgnoringOtherApps])
            return
        }
    }

    let normalizedTarget = targetTitle.lowercased()
    if let fallbackApp = runningApps.first(where: {
        ($0.localizedName ?? "").lowercased().contains(normalizedTarget)
    }) {
        fallbackApp.activate(options: [.activateIgnoringOtherApps])
    }
}

guard CommandLine.arguments.count > 1 else {
    fputs("Error: Please provide a window title or JSON string\n", stderr)
    exit(1)
}

let argument = CommandLine.arguments[1]
if isValidJSON(argument), let data = argument.data(using: .utf8) {
    let decoder = JSONDecoder()
    if argument.trimmingCharacters(in: .whitespacesAndNewlines).hasPrefix("{") {
        if let info = try? decoder.decode(WindowInfo.self, from: data),
           let title = info.title, !title.isEmpty {
            activateWindow(
                matchingTitle: title,
                preferredPid: info.applicationProcessId,
                preferredAppName: info.applicationName
            )
            exit(0)
        }
    } else if let list = try? decoder.decode([WindowInfo].self, from: data),
              let firstWithTitle = list.first(where: { ($0.title ?? "").isEmpty == false }),
              let title = firstWithTitle.title {
        activateWindow(
            matchingTitle: title,
            preferredPid: firstWithTitle.applicationProcessId,
            preferredAppName: firstWithTitle.applicationName
        )
        exit(0)
    }
}

activateWindow(matchingTitle: argument)
