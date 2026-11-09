"use strict";
function _0x5034() {}
const _0x22fcab = _0x5034;

const { spawn } = require("child_process"),
  fs = require("fs"),
  fsp = require("fs/promises"),
  path = require("path"),
  MODEL_ID = "Xenova/whisper-small",
  MODEL_HOST = "https://huggingface.co",
  MODEL_DOWNLOAD_MB = 0xf2,
  REQUIRED_MODEL_FILES = [
    "config.json",
    "generation_config.json",
    "preprocessor_config.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "onnx/encoder_model_quantized.onnx",
    "onnx/decoder_model_merged_quantized.onnx",
  ],
  OPTIONAL_MODEL_FILES = [
    "added_tokens.json",
    "special_tokens_map.json",
    "normalizer.json",
    "merges.txt",
    "vocab.json",
    "quantize_config.json",
  ],
  WHISPER_SAMPLE_RATE = 0x3e80;
function registerSubtitleIpc({
  ipcMain: _0x3d46be,
  app: _0x586a60,
  getBinaryPath: _0x434b7a,
  toLocalUrl: _0x4f5fea,
  fromLocalUrl: _0x529e62,
  resolveMediaPath: resolveMediaPath = (_0x4e726d) => _0x4e726d,
  log: log = console["log"],
}) {
  const _0x56c784 = _0x22fcab,
    _0x1c794c = {
      ZdMjd: "string",
      PeMWt: "screencharm-local://",
      qKcyv: "file://",
      bSkEH: function (_0x12c2dd, _0x394464) {
        return _0x12c2dd(_0x394464);
      },
      ZYACW: function (_0x4820aa, _0x4e68e9) {
        return _0x4820aa(_0x4e68e9);
      },
      RSmBy: function (_0x44c329) {
        return _0x44c329();
      },
      cgOPn: function (_0x22608e, _0x198b35) {
        return _0x22608e === _0x198b35;
      },
      YiTQg: "IOLIe",
      GMnBT: function (_0x249503, _0x404f3a) {
        return _0x249503(_0x404f3a);
      },
      PnxWW: "@xenova/transformers/package.json",
      zzxcp: "dist",
      TixaL: "ort-wasm-simd.wasm",
      DbNZJ: function (_0x534730, _0x31a977) {
        return _0x534730 === _0x31a977;
      },
      TlGBx: "LvWeL",
      WjQGA: function (_0x40e761, _0x1e2216) {
        return _0x40e761(_0x1e2216);
      },
      rJzTX: function (_0x1617e4, _0x29ce37) {
        return _0x1617e4 !== _0x29ce37;
      },
      EoMYG: function (_0x27bfc0, _0xaf5d73, _0x3ef844, _0x143154, _0x3af5f1) {
        return _0x27bfc0(_0xaf5d73, _0x3ef844, _0x143154, _0x3af5f1);
      },
      LtOoH: "data",
      KNFSx: "error",
      eCyTy: "finish",
      XhPIH: function (_0x2d91da, _0x5ca046) {
        return _0x2d91da !== _0x5ca046;
      },
      rEatg: "JuQcn",
      yRrpY: "nHVyk",
      HUGNF: "https",
      XTxcB: function (_0xde7ef2, _0x21eaf3) {
        return _0xde7ef2(_0x21eaf3);
      },
      KOnlF: function (_0x228764, _0x355709) {
        return _0x228764 !== _0x355709;
      },
      VuvyU: "sTkln",
      DmUOA: "PcFtK",
      PUQsw: function (_0x532679, _0x12774e, _0x2af77e, _0x6f3630) {
        return _0x532679(_0x12774e, _0x2af77e, _0x6f3630);
      },
      ZEyWL: "subtitle-ort",
      ijICB: "resources",
      mzxTP: function (_0x415eca, _0x9a5833) {
        return _0x415eca(_0x9a5833);
      },
      pMkCp: function (_0x198979, _0x2520ad) {
        return _0x198979 !== _0x2520ad;
      },
      VHFHr: "mFjUE",
      mCqWF: "RVcTS",
      EYrce: function (_0x52df88, _0x43ba45) {
        return _0x52df88(_0x43ba45);
      },
      tZGjI: "subtitles-model-progress",
      zFQeZ: "hfGeE",
      YhOSa: "VhUAy",
      IjSrN: "onnx",
      xLCJO: "KIwNX",
      zplWr: function (_0xf17700, _0x3d481a, _0x489256) {
        return _0xf17700(_0x3d481a, _0x489256);
      },
      wqrAj: function (_0xb47f7d, _0x3463db) {
        return _0xb47f7d(_0x3463db);
      },
      NQCmB: function (_0x543ae0, _0x358770) {
        return _0x543ae0 * _0x358770;
      },
      nTJQw: function (_0x7896ea, _0x30c020) {
        return _0x7896ea === _0x30c020;
      },
      MRszk: "RIXpy",
      nliLI: "✅ Subtitles: model ready",
      uxYua:
        "The speech model is incomplete. Check your connection and try again.",
      UaNAM: function (_0xcb4911, _0x4b651c) {
        return _0xcb4911(_0x4b651c);
      },
      NWZec: function (_0x1080c9, _0x550d69) {
        return _0x1080c9 > _0x550d69;
      },
      NhZFt: function (_0x173609, _0x2817e0) {
        return _0x173609 !== _0x2817e0;
      },
      HjBED: "gYflO",
      qtnlu: "xLraR",
      iDkCv: function (_0x5ef9d2, _0x53815f) {
        return _0x5ef9d2(_0x53815f);
      },
      BCXlp: "no audio stream",
      KdolF: "ZRSse",
      CYsUX: "wJpux",
      kWrKt: "ffmpeg",
      wlNsO: "-vn",
      ezYqn: "-ac",
      IUGOd: "-ar",
      gHcZq: "-af",
      rCciE: "f32le",
      RKlNs: "-acodec",
      XWPOC: "pcm_f32le",
      pqKRb: "close",
      fYabK: function (_0xd6a38f, _0xedbf97) {
        return _0xd6a38f - _0xedbf97;
      },
      YWZvr: function (_0x398e99, _0x2b2b0b) {
        return _0x398e99 % _0x2b2b0b;
      },
      svfvZ: function (_0x5ea881, _0x24a6ea) {
        return _0x5ea881 < _0x24a6ea;
      },
      TgcCT: function (_0x2cbbf2, _0x1be5a3) {
        return _0x2cbbf2 > _0x1be5a3;
      },
      qloEy: function (_0x1b34b6, _0x1a752f) {
        return _0x1b34b6 * _0x1a752f;
      },
      gVnou: function (_0x26e67a, _0x431625) {
        return _0x26e67a / _0x431625;
      },
      YWPxt: function (_0x915364, _0x21687e) {
        return _0x915364 << _0x21687e;
      },
      OBIWu: function (_0x39f47a, _0x16e497) {
        return _0x39f47a / _0x16e497;
      },
      LNhfj: "YkHlV",
      DiaUV: function (_0x3be626, _0x4f339e) {
        return _0x3be626 !== _0x4f339e;
      },
      eeGIt: "wtQtg",
      VipdO: "mpJrX",
      zSpqc: function (_0x10a6f8, _0x208f05) {
        return _0x10a6f8(_0x208f05);
      },
      jOPzM: "No recorded audio was found for this project.",
      SUeHJ: "temp",
      iOLjA: "hLKrN",
      hIejP: "uUVnc",
      UGkXr: function (_0x346f44, _0x4704d5) {
        return _0x346f44(_0x4704d5);
      },
      Tnztc: function (_0x2648e4, _0x4f602e) {
        return _0x2648e4(_0x4f602e);
      },
      JVzKc: "IYaLH",
      xjSSM: "The\x20recorded\x20audio\x20could\x20not\x20be\x20decoded.",
      TeMWi: "This recording has no audio track to transcribe.",
      Luonn: "angNw",
      GwgGe:
        "The\x20recording\x20is\x20silent\x20—\x20no\x20voice\x20was\x20captured\x20on\x20any\x20audio\x20track.",
      JnoUk: function (_0x2b5f24, _0x217d33) {
        return _0x2b5f24(_0x217d33);
      },
      igxoo: "^$",
      vBEuq: "wtJXU",
      cAIly: "NsscJ",
      ySjhr: "subtitles-ensure-model",
      cFVci: "subtitles-extract-audio",
    },
    _0x235946 = () =>
      path["join"](_0x586a60["getPath"]("userData"), "subtitle-model"),
    _0x23a6b = () => path["join"](_0x235946(), ...MODEL_ID["split"]("/")),
    _0x989b86 = (_0xee61bb) => {
      const _0xba4630 = _0x56c784;
      if (!_0xee61bb || typeof _0xee61bb !== "string") return null;
      let _0x4db418 = _0xee61bb;
      if (_0x4db418["startsWith"]("screencharm-local://"))
        _0x4db418 = _0x529e62(_0x4db418);
      else {
        if (_0x4db418["startsWith"]("file://"))
          try {
            _0x4db418 = _0x1c794c["bSkEH"](
              decodeURIComponent,
              new URL(_0x4db418)["pathname"],
            );
          } catch {
            return null;
          }
      }
      if (!_0x4db418) return null;
      try {
        return _0x1c794c["ZYACW"](resolveMediaPath, _0x4db418) || _0x4db418;
      } catch {
        return _0x4db418;
      }
    },
    _0x27b75a = new Set([0x12d, 0x12e, 0x12f, 0x133, 0x134]),
    _0x3db63c = (_0x5e98c8, _0x16376e, _0x46c601, _0x30709e = 0x5) =>
      new Promise((_0x3c1d4a, _0x43598b) => {
        const _0x42054e = _0x56c784,
          _0x557f34 = {
            tlrkO: function (_0x1cc2c9) {
              const _0xd3e845 = _0x5034;
              return _0x1c794c["RSmBy"](_0x1cc2c9);
            },
            OFebX: function (_0x5413f5) {
              const _0x5a6f72 = _0x5034;
              return _0x1c794c["RSmBy"](_0x5413f5);
            },
            MAVcR: function (_0x472d7a, _0x181870) {
              const _0x58b8e2 = _0x5034;
              return _0x1c794c["cgOPn"](_0x472d7a, _0x181870);
            },
            vQLBx: "IOLIe",
            tCaCX: function (_0x20cc9f, _0x219a2e) {
              const _0x1684c0 = _0x42054e;
              return _0x1c794c["GMnBT"](_0x20cc9f, _0x219a2e);
            },
            wfhIc: function (_0x3aecf3, _0x1b858d) {
              const _0x569072 = _0x42054e;
              return _0x1c794c["bSkEH"](_0x3aecf3, _0x1b858d);
            },
            lCNOG: "@xenova/transformers/package.json",
            xIbAn: "dist",
            pDsYq: "ort-wasm-simd.wasm",
            qEwlw: function (_0x159504, _0x435b60) {
              const _0x50dcce = _0x42054e;
              return _0x1c794c["DbNZJ"](_0x159504, _0x435b60);
            },
            cdpSq: "LvWeL",
            JeBwj: function (_0x45ebcc, _0x1ba142) {
              const _0x566647 = _0x42054e;
              return _0x1c794c["WjQGA"](_0x45ebcc, _0x1ba142);
            },
            uRVWk: function (_0x59529a, _0x2757e4) {
              return _0x1c794c["rJzTX"](_0x59529a, _0x2757e4);
            },
            gCeuD: "bfBNX",
            XCRPq: function (
              _0x135846,
              _0x3af84a,
              _0x11f6b6,
              _0x1f0c56,
              _0x1a23ea,
            ) {
              const _0x1d574e = _0x42054e;
              return _0x1c794c["EoMYG"](
                _0x135846,
                _0x3af84a,
                _0x11f6b6,
                _0x1f0c56,
                _0x1a23ea,
              );
            },
            JsQFW: function (_0x3cbcbd, _0x44bf31) {
              return _0x1c794c["rJzTX"](_0x3cbcbd, _0x44bf31);
            },
            yUgyh: function (_0x1529b0, _0x9fd52e) {
              return _0x1529b0 === _0x9fd52e;
            },
            pcsEh: "jEvlI",
            pwcnd: "data",
            eiSgi: "error",
            TCONM: "finish",
          };
        if (_0x1c794c["XhPIH"]("JuQcn", "nHVyk")) {
          const _0x564749 = require("https");
          let _0x3d5d35 = ![];
          const _0x574e3f = () => {
              const _0x3795ba = _0x42054e;
              !_0x3d5d35 && ((_0x3d5d35 = !![]), _0x557f34["tlrkO"](_0x3c1d4a));
            },
            _0xa68d8d = (_0x502276) => {
              const _0x2c2cd6 = _0x42054e;
              !_0x3d5d35 &&
                (_0x557f34["MAVcR"]("WswkH", _0x557f34["vQLBx"])
                  ? ((_0x15a039 = !![]), _0x557f34["OFebX"](_0x59c48b))
                  : ((_0x3d5d35 = !![]),
                    _0x557f34["tCaCX"](_0x43598b, _0x502276)));
            },
            _0x1d4222 = {};
          _0x1d4222["User-Agent"] = "ScreenCharm";
          const _0x27b853 = {};
          _0x27b853["headers"] = _0x1d4222;
          const _0xedfdd0 = _0x564749["get"](
            _0x5e98c8,
            _0x27b853,
            (_0xceec8c) => {
              const _0x4659cf = _0x42054e,
                _0x4c0170 = {
                  KXhPT: function (_0x2c3a57, _0x2a7399) {
                    const _0x3ea042 = _0x5034;
                    return _0x557f34["wfhIc"](_0x2c3a57, _0x2a7399);
                  },
                  iFzdp: _0x557f34["lCNOG"],
                  UcTSL: _0x557f34["xIbAn"],
                  tzBZc: _0x557f34["pDsYq"],
                  SNzfk: function (_0x401bad, _0x18b377) {
                    return _0x401bad !== _0x18b377;
                  },
                  YAqFp: "jdLFX",
                  yJyJo: function (_0x513c76, _0x10fb23) {
                    const _0x48aaa4 = _0x4659cf;
                    return _0x557f34["qEwlw"](_0x513c76, _0x10fb23);
                  },
                  fwEoy: _0x557f34["cdpSq"],
                };
              if (_0x27b75a["has"](_0xceec8c["statusCode"])) {
                _0xceec8c["resume"]();
                const _0x46baa8 = _0xceec8c["headers"]["location"];
                if (!_0x46baa8) {
                  if (_0x557f34["qEwlw"]("KIfNv", "gXwUZ"))
                    !_0x10c01c &&
                      ((_0x29d65a = !![]),
                      _0x4c0170["KXhPT"](_0x21acf1, _0x55fa5a));
                  else {
                    _0xa68d8d(
                      new Error("Redirect without a location for " + _0x5e98c8),
                    );
                    return;
                  }
                }
                if (_0x30709e <= 0x0) {
                  _0x557f34["JeBwj"](
                    _0xa68d8d,
                    new Error("Too many redirects for " + _0x5e98c8),
                  );
                  return;
                }
                let _0x16f0fc;
                try {
                  _0x16f0fc = new URL(_0x46baa8, _0x5e98c8)["href"];
                } catch {
                  if (_0x557f34["uRVWk"]("bfBNX", "bfBNX"))
                    _0x3a3347["unlink"](_0x4f5775, () => _0x50b31e(_0x1ba6c7));
                  else {
                    _0xa68d8d(
                      new Error(
                        'Unusable redirect target "' +
                          _0x46baa8 +
                          "\x22\x20for\x20" +
                          _0x5e98c8,
                      ),
                    );
                    return;
                  }
                }
                (_0xedfdd0["setTimeout"](0x0),
                  _0x557f34["XCRPq"](
                    _0x3db63c,
                    _0x16f0fc,
                    _0x16376e,
                    _0x46c601,
                    _0x30709e - 0x1,
                  )["then"](_0x574e3f, _0xa68d8d));
                return;
              }
              if (_0x557f34["JsQFW"](_0xceec8c["statusCode"], 0xc8)) {
                if (_0x557f34["yUgyh"]("jEvlI", "jEvlI")) {
                  (_0xceec8c["resume"](),
                    _0xa68d8d(
                      Object["assign"](
                        new Error(
                          "HTTP " +
                            _0xceec8c["statusCode"] +
                            " for " +
                            _0x5e98c8,
                        ),
                        { statusCode: _0xceec8c["statusCode"] },
                      ),
                    ));
                  return;
                } else {
                  const _0x3c9aa9 = _0x5c6386["join"](
                    _0x35c03c["dirname"](
                      _0x45a904["resolve"](_0x4c0170["iFzdp"]),
                    ),
                    _0x4c0170["UcTSL"],
                  );
                  if (
                    _0x1a5e71["existsSync"](
                      _0x2b0414["join"](_0x3c9aa9, _0x4c0170["tzBZc"]),
                    )
                  )
                    return _0x3c9aa9;
                }
              }
              const _0x2deb1e = _0x16376e + ".part",
                _0x3741de = fs["createWriteStream"](_0x2deb1e);
              (_0xceec8c["on"](_0x557f34["pwcnd"], (_0x1e2adc) =>
                _0x46c601?.(_0x1e2adc["length"]),
              ),
                _0xceec8c["on"](_0x557f34["eiSgi"], (_0x414920) => {
                  const _0x581601 = _0x4659cf;
                  _0x4c0170["SNzfk"]("jdLFX", "XHAhj")
                    ? fs["unlink"](_0x2deb1e, () => _0xa68d8d(_0x414920))
                    : _0x3f075c["close"](() => {
                        const _0x86ba4c = _0x581601;
                        _0x45166a["rename"](
                          _0x1455b1,
                          _0x19d819,
                          (_0x40fd96) =>
                            _0x40fd96 ? _0x4b590b(_0x40fd96) : _0x4f93d7(),
                        );
                      });
                }),
                _0xceec8c["pipe"](_0x3741de),
                _0x3741de["on"](_0x557f34["TCONM"], () => {
                  const _0x2ba436 = _0x4659cf,
                    _0x5b0789 = {
                      ncQcP: function (_0x4bef4a, _0x25f9ff) {
                        return _0x4c0170["yJyJo"](_0x4bef4a, _0x25f9ff);
                      },
                      mLFOx: _0x4c0170["fwEoy"],
                    };
                  _0x3741de["close"](() => {
                    const _0x1aa6b9 = _0x2ba436;
                    if (_0x5b0789["ncQcP"](_0x5b0789["mLFOx"], "CeLel")) {
                      if (_0xdcc36a) {
                        const _0x1eae52 = _0x1cf63f["apply"](
                          _0x25a197,
                          arguments,
                        );
                        return ((_0x3e6015 = null), _0x1eae52);
                      }
                    } else
                      fs["rename"](_0x2deb1e, _0x16376e, (_0x2f0d94) =>
                        _0x2f0d94 ? _0xa68d8d(_0x2f0d94) : _0x574e3f(),
                      );
                  });
                }),
                _0x3741de["on"](_0x557f34["eiSgi"], (_0x102881) => {
                  const _0x523f83 = _0x4659cf;
                  fs["unlink"](_0x2deb1e, () => _0xa68d8d(_0x102881));
                }));
            },
          );
          (_0xedfdd0["on"]("error", _0xa68d8d),
            _0xedfdd0["setTimeout"](0x1d4c0, () =>
              _0xedfdd0["destroy"](
                new Error("Timed out downloading " + _0x5e98c8),
              ),
            ));
        } else
          _0x540967["rename"](_0x322f1d, _0x596471, (_0x53705c) =>
            _0x53705c ? _0x23efd4(_0x53705c) : _0x542289(),
          );
      }),
    _0x4f690e = async (_0x32fe4f, _0x148fdd, _0x3b7994) => {
      const _0x4def74 = _0x56c784;
      if (_0x1c794c["KOnlF"]("sTkln", "PcFtK"))
        try {
          return await _0x1c794c["PUQsw"](
            _0x3db63c,
            _0x32fe4f,
            _0x148fdd,
            _0x3b7994,
          );
        } catch (_0x1ad94d) {
          if (_0x1c794c["cgOPn"](_0x1ad94d["statusCode"], 0x194))
            throw _0x1ad94d;
          return (
            log(
              "⚠️ Subtitles: retrying " +
                path["basename"](_0x148fdd) +
                ' after "' +
                _0x1ad94d["message"] +
                "\x22",
            ),
            _0x3db63c(_0x32fe4f, _0x148fdd, _0x3b7994)
          );
        }
      else {
        _0x1c794c["XTxcB"](
          _0x3fbf82,
          new _0x1f7543("Too many redirects for " + _0x3641e6),
        );
        return;
      }
    };
  function _0x4c1429() {
    const _0x486d52 = _0x56c784,
      _0xbd1e7e = _0x586a60["isPackaged"]
        ? path["join"](process["resourcesPath"], "subtitle-ort")
        : path["join"](__dirname, "..", "resources", "subtitle-ort");
    if (fs["existsSync"](path["join"](_0xbd1e7e, "ort-wasm-simd.wasm")))
      return _0xbd1e7e;
    try {
      const _0x509dd0 = path["join"](
        path["dirname"](
          require["resolve"]("@xenova/transformers/package.json"),
        ),
        "dist",
      );
      if (fs["existsSync"](path["join"](_0x509dd0, "ort-wasm-simd.wasm")))
        return _0x509dd0;
    } catch {}
    return (
      _0x1c794c["mzxTP"](
        log,
        "⚠️\x20Subtitles:\x20ONNX\x20Runtime\x20binaries\x20not\x20found;\x20run\x20scripts/prepare-subtitle-assets.js",
      ),
      null
    );
  }
  const _0x1b3c84 = async (_0x5c4e90) => {
    const _0x2f44ba = _0x56c784,
      _0x16b43a = _0x235946();
    let _0x1d574f;
    try {
      const _0x5d7329 = {};
      ((_0x5d7329["withFileTypes"] = !![]),
        (_0x1d574f = await fsp["readdir"](_0x16b43a, _0x5d7329)));
    } catch {
      return;
    }
    const _0x4499b9 = [];
    for (const _0x32b605 of _0x1d574f) {
      if (_0x1c794c["pMkCp"]("mFjUE", "RVcTS")) {
        if (!_0x32b605["isDirectory"]()) continue;
        const _0xb26109 = path["join"](_0x16b43a, _0x32b605["name"]),
          _0xfabbe7 = {};
        _0xfabbe7["withFileTypes"] = !![];
        const _0x3bef6f = await fsp["readdir"](_0xb26109, _0xfabbe7)["catch"](
          () => [],
        );
        for (const _0x4bcfe0 of _0x3bef6f) {
          if (!_0x4bcfe0["isDirectory"]()) continue;
          const _0x3eb2a2 = path["join"](_0xb26109, _0x4bcfe0["name"]);
          if (path["resolve"](_0x3eb2a2) !== path["resolve"](_0x5c4e90))
            _0x4499b9["push"](_0x3eb2a2);
        }
      } else {
        const _0xee4b41 = _0x1b938a
          ? function () {
              const _0x34f100 = _0x2f44ba;
              if (_0x2f9646) {
                const _0x1a59ff = _0x35a4a1["apply"](_0x55506f, arguments);
                return ((_0x4c5bbe = null), _0x1a59ff);
              }
            }
          : function () {};
        return ((_0x4c1c03 = ![]), _0xee4b41);
      }
    }
    for (const _0xd5fd70 of _0x4499b9) {
      const _0x458f60 = {};
      ((_0x458f60["recursive"] = !![]),
        (_0x458f60["force"] = !![]),
        await fsp["rm"](_0xd5fd70, _0x458f60)["catch"](() => {}),
        _0x1c794c["EYrce"](
          log,
          "🧹\x20Subtitles:\x20removed\x20unused\x20model\x20" +
            path["relative"](_0x16b43a, _0xd5fd70),
        ));
    }
  };
  _0x3d46be["handle"]("subtitles-ensure-model", async (_0x21bda5) => {
    const _0x3230f8 = _0x56c784;
    if (_0x1c794c["cgOPn"]("hfGeE", "VhUAy")) return null;
    else {
      const _0x4c9ed3 = _0x23a6b(),
        _0x1a15a1 = {};
      ((_0x1a15a1["recursive"] = !![]),
        await fsp["mkdir"](path["join"](_0x4c9ed3, "onnx"), _0x1a15a1));
      const _0x28c9e8 = _0x1c794c["RSmBy"](_0x4c1429),
        _0x4d747b = [];
      for (const _0x24178b of [
        ...REQUIRED_MODEL_FILES,
        ...OPTIONAL_MODEL_FILES,
      ]) {
        if (!fs["existsSync"](path["join"](_0x4c9ed3, _0x24178b)))
          _0x4d747b["push"](_0x24178b);
      }
      if (_0x4d747b["length"]) {
        if (_0x1c794c["rJzTX"]("hoCCi", "KIwNX")) {
          const _0x1a97d1 = (_0x447cc2, _0x2da425) => {
              const _0x3505a5 = _0x3230f8;
              if (!_0x21bda5["sender"]["isDestroyed"]()) {
                const _0x22f5d1 = {};
                ((_0x22f5d1["message"] = _0x447cc2),
                  (_0x22f5d1["progress"] = _0x2da425),
                  _0x21bda5["sender"]["send"](
                    "subtitles-model-progress",
                    _0x22f5d1,
                  ));
              }
            },
            _0x84db72 =
              "Downloading\x20speech\x20model\x0a(one\x20time,\x20~" +
              MODEL_DOWNLOAD_MB +
              " MB)…";
          (_0x1c794c["zplWr"](_0x1a97d1, _0x84db72, 0x0),
            _0x1c794c["wqrAj"](
              log,
              "⬇️ Subtitles: downloading " +
                _0x4d747b["length"] +
                " model file(s) for " +
                MODEL_ID,
            ));
          let _0x854304 = 0x0;
          const _0x40449f =
            _0x1c794c["NQCmB"](MODEL_DOWNLOAD_MB, 0x400) * 0x400;
          for (const _0xf82205 of _0x4d747b) {
            if (_0x1c794c["nTJQw"]("RIXpy", "RIXpy")) {
              const _0x29c68a =
                MODEL_HOST + "/" + MODEL_ID + "/resolve/main/" + _0xf82205;
              try {
                await _0x4f690e(
                  _0x29c68a,
                  path["join"](_0x4c9ed3, _0xf82205),
                  (_0x22fb6f) => {
                    ((_0x854304 += _0x22fb6f),
                      _0x1a97d1(
                        _0x84db72,
                        Math["min"](0.99, _0x854304 / _0x40449f),
                      ));
                  },
                );
              } catch (_0x4063bb) {
                if (
                  OPTIONAL_MODEL_FILES["includes"](_0xf82205) &&
                  _0x4063bb["statusCode"] === 0x194
                )
                  continue;
                throw new Error(
                  "Could not download the speech model: " +
                    _0x4063bb["message"],
                );
              }
            } else return;
          }
          _0x1c794c["mzxTP"](log, "✅ Subtitles: model ready");
        } else {
          const _0x5ec0a0 = _0xfd7558["apply"](_0x179711, arguments);
          return ((_0x59e3de = null), _0x5ec0a0);
        }
      }
      for (const _0xcf99a9 of REQUIRED_MODEL_FILES) {
        if (!fs["existsSync"](path["join"](_0x4c9ed3, _0xcf99a9)))
          throw new Error(
            "The speech model is incomplete. Check your connection and try again.",
          );
      }
      return (
        await _0x1b3c84(_0x4c9ed3),
        {
          modelId: MODEL_ID,
          localModelPath:
            _0x1c794c["UaNAM"](_0x4f5fea, _0x1c794c["RSmBy"](_0x235946)) + "/",
          wasmPath: _0x28c9e8 ? _0x4f5fea(_0x28c9e8) + "/" : null,
        }
      );
    }
  });
  const _0x3f52fd = (_0x57b203, _0x3899b4) =>
      new Promise((_0x5e6397, _0x16d3b4) => {
        const _0x4b3ff3 = _0x56c784,
          _0x3d82b3 = {
            TBuxk: function (_0x4b37fa, _0xd1b3ac) {
              const _0x309e09 = _0x5034;
              return _0x1c794c["EYrce"](_0x4b37fa, _0xd1b3ac);
            },
            dSWif: function (_0x34b1b8, _0x36968b) {
              return _0x1c794c["pMkCp"](_0x34b1b8, _0x36968b);
            },
            HyPwq: "ZRSse",
          };
        if (_0x1c794c["DbNZJ"]("wJpux", "wJpux")) {
          const _0x35503b = _0x1c794c["zplWr"](
            spawn,
            _0x1c794c["wqrAj"](_0x434b7a, "ffmpeg"),
            [
              "-y",
              "-i",
              _0x57b203,
              "-vn",
              "-ac",
              "1",
              "-ar",
              String(WHISPER_SAMPLE_RATE),
              "-af",
              "highpass=f=80",
              "-f",
              "f32le",
              "-acodec",
              "pcm_f32le",
              _0x3899b4,
            ],
          );
          let _0x308b14 = "";
          (_0x35503b["stderr"]["on"]("data", (_0x17faa8) => {
            const _0x41ac5d = _0x4b3ff3;
            _0x3d82b3["dSWif"](_0x3d82b3["HyPwq"], "HItko")
              ? (_0x308b14 += _0x17faa8["toString"]())
              : (_0x1057c2 = _0x3d82b3["TBuxk"](
                  _0x147705,
                  new _0x268774(_0x31f794)["pathname"],
                ));
          }),
            _0x35503b["on"]("error", _0x16d3b4),
            _0x35503b["on"]("close", (_0x132d56) => {
              const _0x27abfc = _0x4b3ff3,
                _0x51cdc0 = {
                  nDLHG: function (_0xd46c7a, _0xed7b5f) {
                    const _0x324546 = _0x5034;
                    return _0x1c794c["NWZec"](_0xd46c7a, _0xed7b5f);
                  },
                  HVtZA: function (_0x297df2, _0x24656b) {
                    return _0x297df2 * _0x24656b;
                  },
                };
              if (_0x1c794c["NhZFt"]("gYflO", "xLraR")) {
                if (_0x132d56 === 0x0) return _0x1c794c["RSmBy"](_0x5e6397);
                const _0x1b7141 =
                  /does not contain any stream|Output file .* does not contain any stream/i[
                    "test"
                  ](_0x308b14);
                _0x1c794c["iDkCv"](
                  _0x16d3b4,
                  Object["assign"](
                    new Error(
                      _0x1b7141
                        ? "no audio stream"
                        : "ffmpeg\x20exit\x20" + _0x132d56,
                    ),
                    { noAudio: _0x1b7141 },
                  ),
                );
              } else {
                const _0x59380f = _0x1c87a2["readFloatLE"](_0xad8cd4),
                  _0x31ed58 = _0x1974e2["abs"](_0x59380f);
                if (_0x51cdc0["nDLHG"](_0x31ed58, _0x256dc0))
                  _0x482fa2 = _0x31ed58;
                _0x26b4e4 += _0x51cdc0["HVtZA"](_0x59380f, _0x59380f);
              }
            }));
        } else
          throw new _0x454b28(
            "The speech model is incomplete. Check your connection and try again.",
          );
      }),
    _0x5b74c1 = async (_0x23462e) => {
      const _0xba7b94 = _0x56c784,
        _0x5e63be = {
          EYLrJ: function (_0x18aa9d, _0x1051ee) {
            const _0x2c7118 = _0x5034;
            return _0x1c794c["fYabK"](_0x18aa9d, _0x1051ee);
          },
          xxekN: function (_0x4a31e6, _0x4d1c35) {
            const _0x1d9d39 = _0x5034;
            return _0x1c794c["YWZvr"](_0x4a31e6, _0x4d1c35);
          },
          gYRLI: function (_0x2c7ed6, _0x221ae5) {
            return _0x1c794c["svfvZ"](_0x2c7ed6, _0x221ae5);
          },
          yXBin: function (_0x4e745c, _0x2f6d3e) {
            const _0x25139c = _0x5034;
            return _0x1c794c["TgcCT"](_0x4e745c, _0x2f6d3e);
          },
          fieGj: function (_0x476462, _0x19d473) {
            const _0x1003b2 = _0x5034;
            return _0x1c794c["qloEy"](_0x476462, _0x19d473);
          },
          ZBDlv: function (_0xaa6d2c, _0x12bc5e) {
            const _0x2d278e = _0x5034;
            return _0x1c794c["gVnou"](_0xaa6d2c, _0x12bc5e);
          },
          rVkov: function (_0x102acf, _0xbf64e2) {
            return _0x1c794c["YWPxt"](_0x102acf, _0xbf64e2);
          },
          GMsql: "data",
          gsqlQ: "end",
        };
      let _0x31bebc = 0x0,
        _0xd78e5f = 0x0,
        _0x5cc2fa = 0x0;
      await new Promise((_0x199044, _0x3d5980) => {
        const _0x47a753 = _0xba7b94,
          _0x5210ad = fs["createReadStream"](_0x23462e, {
            highWaterMark: _0x5e63be["rVkov"](0x1, 0x14),
          });
        let _0xd2e94 = Buffer["alloc"](0x0);
        (_0x5210ad["on"](_0x5e63be["GMsql"], (_0xcacf18) => {
          const _0xa9af92 = _0x47a753,
            _0x1eefdb = _0xd2e94["length"]
              ? Buffer["concat"]([_0xd2e94, _0xcacf18])
              : _0xcacf18,
            _0x2a4c39 = _0x5e63be["EYLrJ"](
              _0x1eefdb["length"],
              _0x5e63be["xxekN"](_0x1eefdb["length"], 0x4),
            );
          for (
            let _0x386b3a = 0x0;
            _0x5e63be["gYRLI"](_0x386b3a, _0x2a4c39);
            _0x386b3a += 0x4
          ) {
            const _0x2978a1 = _0x1eefdb["readFloatLE"](_0x386b3a),
              _0x5f0289 = Math["abs"](_0x2978a1);
            if (_0x5e63be["yXBin"](_0x5f0289, _0x31bebc)) _0x31bebc = _0x5f0289;
            _0xd78e5f += _0x5e63be["fieGj"](_0x2978a1, _0x2978a1);
          }
          ((_0x5cc2fa += _0x5e63be["ZBDlv"](_0x2a4c39, 0x4)),
            (_0xd2e94 = _0x1eefdb["subarray"](_0x2a4c39)));
        }),
          _0x5210ad["on"]("error", _0x3d5980),
          _0x5210ad["on"]("end", _0x199044));
      });
      const _0x2217f1 = _0x5cc2fa
          ? Math["sqrt"](_0x1c794c["gVnou"](_0xd78e5f, _0x5cc2fa))
          : 0x0,
        _0xe798e2 = (_0x4e311a) =>
          _0x4e311a > 0x0 ? 0x14 * Math["log10"](_0x4e311a) : -Infinity;
      return {
        peakDb: _0x1c794c["XTxcB"](_0xe798e2, _0x31bebc),
        rmsDb: _0x1c794c["EYrce"](_0xe798e2, _0x2217f1),
        seconds: _0x1c794c["OBIWu"](_0x5cc2fa, WHISPER_SAMPLE_RATE),
      };
    },
    _0x258feb = -0x32;
  (_0x3d46be["handle"](
    "subtitles-extract-audio",
    async (_0x4dba71, _0x33fd6c = {}) => {
      const _0x898886 = _0x56c784,
        _0x459112 = {
          EsRLZ: function (_0x2944b8, _0x5c1d35) {
            return _0x1c794c["wqrAj"](_0x2944b8, _0x5c1d35);
          },
        };
      if ("oHEiL" === "YkHlV") {
        const _0x355dd4 = _0x1c794c["XTxcB"](_0x21daa5, _0x2c13e7);
        if (
          _0x355dd4 &&
          _0x4b3094["existsSync"](_0x355dd4) &&
          !_0x3f124f["includes"](_0x355dd4)
        )
          _0x157f33["push"](_0x355dd4);
      } else {
        const _0x3f7440 = Array["isArray"](_0x33fd6c["candidates"])
            ? _0x33fd6c["candidates"]
            : [],
          _0x11e26f = [];
        for (const _0x5adaa3 of _0x3f7440) {
          if (_0x1c794c["DiaUV"]("wtQtg", "mpJrX")) {
            const _0x5961ea = _0x1c794c["zSpqc"](_0x989b86, _0x5adaa3);
            if (
              _0x5961ea &&
              fs["existsSync"](_0x5961ea) &&
              !_0x11e26f["includes"](_0x5961ea)
            )
              _0x11e26f["push"](_0x5961ea);
          } else {
            const _0xc481f6 = {};
            ((_0xc481f6["message"] = _0x23d801),
              (_0xc481f6["progress"] = _0x3a5ed4),
              _0x12d0b9["sender"]["send"](
                "subtitles-model-progress",
                _0xc481f6,
              ));
          }
        }
        if (!_0x11e26f["length"])
          throw new Error("No recorded audio was found for this project.");
        const _0x233ad6 = path["join"](
            _0x586a60["getPath"]("temp"),
            "screencharm-subtitles",
          ),
          _0x1df1fa = {};
        ((_0x1df1fa["recursive"] = !![]),
          await fsp["mkdir"](_0x233ad6, _0x1df1fa));
        let _0x3c16c7 = null,
          _0x2f7935 = ![];
        for (const _0x2bbece of _0x11e26f) {
          if (_0x1c794c["KOnlF"]("pMuff", "hLKrN")) {
            const _0x525da6 = path["join"](
              _0x233ad6,
              "pcm-" +
                Date["now"]() +
                "-" +
                _0x11e26f["indexOf"](_0x2bbece) +
                ".f32",
            );
            try {
              await _0x1c794c["zplWr"](_0x3f52fd, _0x2bbece, _0x525da6);
            } catch (_0x3e6b73) {
              if (_0x1c794c["cgOPn"]("uUVnc", "uUVnc")) {
                (_0x1c794c["UGkXr"](
                  log,
                  "⚠️ Subtitles: could not decode " +
                    path["basename"](_0x2bbece) +
                    "\x20(" +
                    _0x3e6b73["message"] +
                    ")",
                ),
                  await fsp["unlink"](_0x525da6)["catch"](() => {}));
                continue;
              } else {
                _0x35032a["resume"]();
                const _0x18aa78 = {};
                ((_0x18aa78["statusCode"] = _0x16e15d["statusCode"]),
                  _0x1c794c["iDkCv"](
                    _0x396676,
                    _0x3a6972["assign"](
                      new _0x246d05(
                        "HTTP " + _0x449751["statusCode"] + " for " + _0x199ea6,
                      ),
                      _0x18aa78,
                    ),
                  ));
                return;
              }
            }
            _0x2f7935 = !![];
            const _0x25d34f = await _0x1c794c["Tnztc"](_0x5b74c1, _0x525da6);
            log(
              "🎙️\x20Subtitles:\x20" +
                path["basename"](_0x2bbece) +
                " — " +
                _0x25d34f["seconds"]["toFixed"](0x1) +
                "s,\x20peak\x20" +
                _0x25d34f["peakDb"]["toFixed"](0x1) +
                " dBFS, rms " +
                _0x25d34f["rmsDb"]["toFixed"](0x1) +
                "\x20dBFS",
            );
            if (
              _0x25d34f["seconds"] >= 0.5 &&
              _0x25d34f["peakDb"] >= _0x258feb
            ) {
              if ("IYaLH" === "DEheq") {
                if (
                  !_0x21d559["existsSync"](
                    _0x55de78["join"](_0x1a5ba6, _0x3ce4c0),
                  )
                )
                  _0x53d769["push"](_0x4cf04f);
              } else {
                if (_0x3c16c7)
                  await fsp["unlink"](_0x3c16c7["output"])["catch"](() => {});
                const _0x398d5e = {};
                ((_0x398d5e["source"] = _0x2bbece),
                  (_0x398d5e["output"] = _0x525da6),
                  (_0x398d5e["stats"] = _0x25d34f),
                  (_0x3c16c7 = _0x398d5e));
                break;
              }
            }
            if (
              !_0x3c16c7 ||
              _0x1c794c["TgcCT"](
                _0x25d34f["peakDb"],
                _0x3c16c7["stats"]["peakDb"],
              )
            ) {
              if (_0x3c16c7)
                await fsp["unlink"](_0x3c16c7["output"])["catch"](() => {});
              const _0x4035f5 = {};
              ((_0x4035f5["source"] = _0x2bbece),
                (_0x4035f5["output"] = _0x525da6),
                (_0x4035f5["stats"] = _0x25d34f),
                (_0x4035f5["weak"] = !![]),
                (_0x3c16c7 = _0x4035f5));
            } else await fsp["unlink"](_0x525da6)["catch"](() => {});
          } else ((_0x1d77b1 = !![]), _0xe6093e(_0x56b1f6));
        }
        if (!_0x3c16c7)
          throw new Error(
            _0x2f7935
              ? "The recorded audio could not be decoded."
              : "This recording has no audio track to transcribe.",
          );
        if (_0x3c16c7["weak"]) {
          if ("angNw" !== "angNw")
            return _0x459112["EsRLZ"](_0x3c4ad1, _0x4dae53) || _0x54e651;
          else {
            await fsp["unlink"](_0x3c16c7["output"])["catch"](() => {});
            throw new Error(
              "The recording is silent — no voice was captured on any audio track.",
            );
          }
        }
        return (
          log(
            "🎙️ Subtitles: transcribing " +
              path["basename"](_0x3c16c7["source"]),
          ),
          {
            url: _0x1c794c["JnoUk"](_0x4f5fea, _0x3c16c7["output"]),
            path: _0x3c16c7["output"],
            sampleRate: WHISPER_SAMPLE_RATE,
            source: path["basename"](_0x3c16c7["source"]),
          }
        );
      }
    },
  ),
    _0x3d46be["handle"](
      "subtitles-cleanup-audio",
      async (_0x58b5fd, _0x59d319) => {
        const _0x1964b6 = _0x56c784;
        if (_0x1c794c["nTJQw"]("wtJXU", "NsscJ"))
          return _0x262d5c["toString"]()
            ["search"](xzAHVl["igxoo"])
            ["toString"]()
            ["constructor"](_0x3560ea)
            ["search"](xzAHVl["igxoo"]);
        else {
          const _0x3bf996 = _0x989b86(_0x59d319);
          if (!_0x3bf996) return ![];
          const _0x2010cd = path["join"](
            _0x586a60["getPath"]("temp"),
            "screencharm-subtitles",
          );
          if (!_0x3bf996["startsWith"](_0x2010cd)) return ![];
          return (await fsp["unlink"](_0x3bf996)["catch"](() => {}), !![]);
        }
      },
    ));
}
const _0xdaa105 = {};
((_0xdaa105["registerSubtitleIpc"] = registerSubtitleIpc),
  (_0xdaa105["MODEL_ID"] = MODEL_ID),
  (_0xdaa105["WHISPER_SAMPLE_RATE"] = WHISPER_SAMPLE_RATE),
  (module["exports"] = _0xdaa105));

