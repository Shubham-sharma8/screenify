import CoreGraphics
import Foundation

struct Window: Codable {
    var pid: Int = 0
    var ownerName: String = ""
    var name: String = ""
    var x: Int = 0
    var y: Int = 0
    var width: Int = 0
    var height: Int = 0
    var number: Int = 0

    func convertToDictionary() -> [String: Any] {
        return [
            "pid": pid,
            "ownerName": ownerName,
            "name": name,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "number": number,
        ]
    }
}

func getWindows(onScreenOnly: Bool) -> [Window] {
    var options: CGWindowListOption = [.excludeDesktopElements]
    if onScreenOnly {
        options = [.excludeDesktopElements, .optionOnScreenOnly]
    }

    guard let windowInfoList = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] else {
        return []
    }

    var windows: [Window] = []
    for info in windowInfoList {
        let alpha = (info[kCGWindowAlpha as String] as? Double) ?? 0.0
        if alpha <= 0.0 {
            continue
        }

        guard let bounds = info[kCGWindowBounds as String] as? [String: Any] else {
            continue
        }

        let x = Int((bounds["X"] as? Double) ?? Double((bounds["X"] as? Int) ?? 0))
        let y = Int((bounds["Y"] as? Double) ?? Double((bounds["Y"] as? Int) ?? 0))
        let width = Int((bounds["Width"] as? Double) ?? Double((bounds["Width"] as? Int) ?? 0))
        let height = Int((bounds["Height"] as? Double) ?? Double((bounds["Height"] as? Int) ?? 0))

        if width <= 0 || height <= 0 {
            continue
        }

        let pid = (info[kCGWindowOwnerPID as String] as? Int) ?? 0
        let ownerName = (info[kCGWindowOwnerName as String] as? String) ?? ""
        let name = (info[kCGWindowName as String] as? String) ?? ""
        let number = (info[kCGWindowNumber as String] as? Int) ?? 0

        windows.append(
            Window(
                pid: pid,
                ownerName: ownerName,
                name: name,
                x: x,
                y: y,
                width: width,
                height: height,
                number: number
            )
        )
    }

    return windows
}

func toJson(windows: [Window]) -> String {
    let dictionaries = windows.map { $0.convertToDictionary() }
    guard
        JSONSerialization.isValidJSONObject(dictionaries),
        let data = try? JSONSerialization.data(withJSONObject: dictionaries, options: [.prettyPrinted]),
        let jsonString = String(data: data, encoding: .utf8)
    else {
        return "[]"
    }
    return jsonString
}

let onScreenOnly: Bool = {
    if CommandLine.arguments.count > 1, let parsed = Bool(CommandLine.arguments[1]) {
        return parsed
    }
    return true
}()

let windows = getWindows(onScreenOnly: onScreenOnly)
print(toJson(windows: windows))
