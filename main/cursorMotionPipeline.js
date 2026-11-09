"use strict";
function _0xe013() {}
const _0x14ca87 = _0xe013;

const DEFAULT_FPS = 0x3c,
  OUTLIER_MULT = 0x8,
  OUTLIER_MIN_PX = 0x78,
  CURSOR_TYPE_MIN_FRAMES = 0x1e,
  CURSOR_TYPE_MAX_STABILIZE_PASSES = 0x40,
  STILL_BBOX_PX = 0x6,
  STILL_MIN_FRAMES = 0xa,
  STILL_LOCK_RADIUS_PX = 0x4,
  SHAKE_MAX_PX = 0x8,
  SHAKE_WINDOW_S = 0.08,
  IDLE_GAP_S = 0.1,
  SIM_STEP_S = 0x1 / 0xf0,
  _0x436e45 = {};
_0x436e45["omega"] = 0x14;
const _0x32fbcd = {};
_0x32fbcd["omega"] = 0x1e;
const _0x3c20f7 = {};
_0x3c20f7["omega"] = 0x28;
const SPRING_PROFILES = Object["freeze"]({
    default: Object["freeze"](_0x436e45),
    snappy: Object["freeze"](_0x32fbcd),
    drag: Object["freeze"](_0x3c20f7),
  }),
  CLICK_STIFFEN_S = 0.15,
  CLICK_ANTICIPATE_S = 0.45,
  LEAD_EASE_TAU_S = 0.12,
  REST_DISTANCE_PX = 0.5,
  REST_SPEED_PX_S = 0xa,
  CURSOR_TRACK_VERSION_BAKED = 0x3;

function clampOutlierJumps(_0x2b585f) {
  const _0x748d04 = _0x14ca87,
    _0x285051 = {
      RTWDw: function (_0x630f99, _0x2fcb52) {
        return _0x630f99 / _0x2fcb52;
      },
      bJlwD: function (_0x38b90, _0x2992ae) {
        return _0x38b90 + _0x2992ae;
      },
      svart: function (_0x570e38, _0x52c48d) {
        return _0x570e38 * _0x52c48d;
      },
      txhFJ: function (_0x4d6a19, _0x2bfbe0) {
        return _0x4d6a19 - _0x2bfbe0;
      },
      pUFNK: function (_0x5e6ba2, _0x57e678) {
        return _0x5e6ba2 + _0x57e678;
      },
      qwVuZ: function (_0x14533e, _0x2f9680, _0x564dd0) {
        return _0x14533e(_0x2f9680, _0x564dd0);
      },
      zofQO: function (_0x4386e1, _0xd53bbf) {
        return _0x4386e1(_0xd53bbf);
      },
      NnmmZ: function (_0x60a761, _0x510a1e) {
        return _0x60a761 - _0x510a1e;
      },
      mTDau: function (_0xd0d0db, _0x5d9fae) {
        return _0xd0d0db / _0x5d9fae;
      },
      eLuuS: function (_0x52f76d, _0x1deea6) {
        return _0x52f76d * _0x1deea6;
      },
      bIYoM: function (_0x23fa39, _0x365593) {
        return _0x23fa39 - _0x365593;
      },
      fxJll: function (_0x501f36, _0x28b5f3) {
        return _0x501f36 + _0x28b5f3;
      },
      yTxwB: function (_0x1aecd, _0x41be3f) {
        return _0x1aecd - _0x41be3f;
      },
      ABPzg: function (_0x4bfbbd, _0x1239c4) {
        return _0x4bfbbd < _0x1239c4;
      },
      TOiQK: function (_0x391d6b, _0x126457) {
        return _0x391d6b === _0x126457;
      },
      ltrnH: "QwYUT",
      CMoKw: function (_0xc93907, _0x408f8a) {
        return _0xc93907 - _0x408f8a;
      },
      EHAHm: function (_0x446591, _0x233600) {
        return _0x446591 - _0x233600;
      },
      zwmsu: function (_0x402428, _0xa84048) {
        return _0x402428 / _0xa84048;
      },
      FdCKM: function (_0x39fd59, _0x348a3f) {
        return _0x39fd59 === _0x348a3f;
      },
      OFPMg: "xgCyi",
      qiKuo: function (_0x4117c4, _0x4855d1) {
        return _0x4117c4 > _0x4855d1;
      },
      MbymC: "FJMOy",
      HTxwi: function (_0x58f1e8, _0x2f0a8e) {
        return _0x58f1e8 / _0x2f0a8e;
      },
      JRsOp: function (_0x50cfe5, _0x81a5) {
        return _0x50cfe5 + _0x81a5;
      },
      uvcmI: function (_0x563d7f, _0x1a301d) {
        return _0x563d7f - _0x1a301d;
      },
      sxouC: function (_0x221d50, _0x59b15f) {
        return _0x221d50 * _0x59b15f;
      },
      iQpkq: function (_0x488d28, _0x1e614e) {
        return _0x488d28 - _0x1e614e;
      },
    };
  if (_0x285051["ABPzg"](_0x2b585f["length"], 0x3))
    return _0x2b585f["map"]((_0x5d2d62) => ({ ..._0x5d2d62 }));
  const _0x3faddc = [];
  for (
    let _0x5c2929 = 0x1;
    _0x285051["ABPzg"](_0x5c2929, _0x2b585f["length"]);
    _0x5c2929++
  ) {
    if (_0x285051["TOiQK"]("QwYUT", "QwYUT"))
      _0x3faddc["push"](
        Math["hypot"](
          _0x2b585f[_0x5c2929]["x"] - _0x2b585f[_0x5c2929 - 0x1]["x"],
          _0x285051["CMoKw"](
            _0x2b585f[_0x5c2929]["y"],
            _0x2b585f[_0x285051["EHAHm"](_0x5c2929, 0x1)]["y"],
          ),
        ),
      );
    else {
      const _0x196482 = _0x285051["RTWDw"](_0x5b20cf, _0x1b1d58);
      ((_0x46fc30["x"] = _0x285051["bJlwD"](
        _0x4cdef1["x"],
        _0x285051["svart"](
          _0x285051["txhFJ"](_0x23f22b["x"], _0xeb33b["x"]),
          _0x196482,
        ),
      )),
        (_0x24259a["y"] = _0x285051["pUFNK"](
          _0x313cc4["y"],
          _0x285051["svart"](
            _0x285051["txhFJ"](_0xd7a202["y"], _0x5bc5c9["y"]),
            _0x196482,
          ),
        )));
    }
  }
  const _0x58e004 = [..._0x3faddc]["sort"](
      (_0xf0399e, _0xcd13f1) => _0xf0399e - _0xcd13f1,
    ),
    _0x12bb23 =
      _0x58e004[Math["floor"](_0x285051["zwmsu"](_0x58e004["length"], 0x2))] ||
      0x1,
    _0x14533d = Math["max"](
      OUTLIER_MIN_PX,
      _0x285051["eLuuS"](_0x12bb23, OUTLIER_MULT),
    ),
    _0x4be8f9 = [_0x2b585f[0x0]];
  for (let _0x4e72f0 = 0x1; _0x4e72f0 < _0x2b585f["length"]; _0x4e72f0++) {
    if (_0x285051["FdCKM"]("xgCyi", "xgCyi")) {
      const _0x15ba09 = _0x4be8f9[_0x4be8f9["length"] - 0x1],
        _0x556b86 = { ..._0x2b585f[_0x4e72f0] },
        _0x1fb15d = _0x556b86,
        _0x5f2ab7 = Math["hypot"](
          _0x285051["EHAHm"](_0x1fb15d["x"], _0x15ba09["x"]),
          _0x1fb15d["y"] - _0x15ba09["y"],
        );
      if (_0x285051["qiKuo"](_0x5f2ab7, _0x14533d)) {
        if (_0x285051["TOiQK"]("FJMOy", "FJMOy")) {
          const _0x544f75 = _0x285051["HTxwi"](_0x14533d, _0x5f2ab7);
          ((_0x1fb15d["x"] = _0x285051["JRsOp"](
            _0x15ba09["x"],
            _0x285051["uvcmI"](_0x1fb15d["x"], _0x15ba09["x"]) * _0x544f75,
          )),
            (_0x1fb15d["y"] = _0x285051["pUFNK"](
              _0x15ba09["y"],
              _0x285051["sxouC"](
                _0x285051["iQpkq"](_0x1fb15d["y"], _0x15ba09["y"]),
                _0x544f75,
              ),
            )));
        } else {
          const _0x66a7ef = _0x285051["qwVuZ"](
              _0x5c8e3a,
              _0x1af705["rawEvents"],
              _0x4ec0b3["opts"],
            ),
            _0x54adcf = {};
          ((_0x54adcf["ok"] = !![]),
            (_0x54adcf["result"] = _0x66a7ef),
            _0x271484["postMessage"](_0x54adcf));
        }
      }
      _0x4be8f9["push"](_0x1fb15d);
    } else {
      const _0x28f451 = _0x285051["zofQO"](
        _0xbfd3e6,
        _0x285051["NnmmZ"](
          0x1,
          _0x285051["mTDau"](
            _0x285051["txhFJ"](_0xb81d25, _0x260c3c),
            _0x372b48,
          ),
        ),
      );
      _0x3d920f = {
        x: _0x285051["pUFNK"](
          _0x289d6f["x"],
          _0x285051["eLuuS"](
            _0x285051["bIYoM"](_0x33d886["x"], _0xbf51f3["x"]),
            _0x28f451,
          ),
        ),
        y: _0x285051["fxJll"](
          _0x523ab1["y"],
          _0x285051["yTxwB"](_0x507fd2["y"], _0x5e09f0["y"]) * _0x28f451,
        ),
      };
    }
  }
  return _0x4be8f9;
}
function removeShake(_0x2dfad1) {
  const _0x287bcf = _0x14ca87,
    _0x1f53ec = {};
  ((_0x1f53ec["VUadz"] = function (_0x209202, _0x3cff23) {
    return _0x209202 < _0x3cff23;
  }),
    (_0x1f53ec["NHKBK"] = function (_0x30a312, _0x57534c) {
      return _0x30a312 - _0x57534c;
    }),
    (_0x1f53ec["rUqRQ"] = function (_0x1ab0fb, _0x53579a) {
      return _0x1ab0fb - _0x53579a;
    }),
    (_0x1f53ec["NgZFG"] = function (_0x17d66f, _0x46f3a4) {
      return _0x17d66f - _0x46f3a4;
    }),
    (_0x1f53ec["qBiFr"] = function (_0x18374c, _0x4b92d3) {
      return _0x18374c + _0x4b92d3;
    }),
    (_0x1f53ec["JPVGR"] = function (_0x2a8079, _0x33e60c) {
      return _0x2a8079 * _0x33e60c;
    }),
    (_0x1f53ec["LTNtU"] = function (_0x23ff5e, _0x316327) {
      return _0x23ff5e === _0x316327;
    }),
    (_0x1f53ec["lqWke"] = function (_0x47a478, _0x2ce47f) {
      return _0x47a478 && _0x2ce47f;
    }),
    (_0x1f53ec["DtOMR"] = function (_0x289e0c, _0x22d5e3) {
      return _0x289e0c <= _0x22d5e3;
    }),
    (_0x1f53ec["ydvXn"] = function (_0x5b0ef5, _0x396df9) {
      return _0x5b0ef5 - _0x396df9;
    }));
  const _0x573c88 = _0x1f53ec;
  if (_0x573c88["VUadz"](_0x2dfad1["length"], 0x3)) return _0x2dfad1;
  const _0x3c710d = [_0x2dfad1[0x0]];
  for (
    let _0x24dc2f = 0x1;
    _0x573c88["VUadz"](_0x24dc2f, _0x573c88["NHKBK"](_0x2dfad1["length"], 0x1));
    _0x24dc2f++
  ) {
    const _0x153e3b = _0x3c710d[_0x573c88["rUqRQ"](_0x3c710d["length"], 0x1)],
      _0x3af7fb = _0x2dfad1[_0x24dc2f],
      _0x3f32f1 = _0x2dfad1[_0x24dc2f + 0x1],
      _0x4b65a4 = _0x3af7fb["x"] - _0x153e3b["x"],
      _0x1a7bd9 = _0x573c88["NHKBK"](_0x3af7fb["y"], _0x153e3b["y"]),
      _0x3311ea = _0x573c88["NgZFG"](_0x3f32f1["x"], _0x3af7fb["x"]),
      _0x57b6cf = _0x3f32f1["y"] - _0x3af7fb["y"],
      _0x4bdd47 = _0x573c88["VUadz"](
        _0x573c88["qBiFr"](
          _0x573c88["JPVGR"](_0x4b65a4, _0x3311ea),
          _0x573c88["JPVGR"](_0x1a7bd9, _0x57b6cf),
        ),
        0x0,
      ),
      _0x426130 =
        _0x573c88["VUadz"](Math["hypot"](_0x4b65a4, _0x1a7bd9), SHAKE_MAX_PX) &&
        _0x573c88["VUadz"](Math["hypot"](_0x3311ea, _0x57b6cf), SHAKE_MAX_PX),
      _0x36422f =
        _0x573c88["LTNtU"](_0x3af7fb["ct"], _0x153e3b["ct"]) &&
        _0x573c88["LTNtU"](_0x3af7fb["ct"], _0x3f32f1["ct"]);
    if (
      _0x573c88["lqWke"](_0x4bdd47, _0x426130) &&
      _0x36422f &&
      !_0x3af7fb["drag"] &&
      _0x573c88["DtOMR"](
        _0x573c88["ydvXn"](_0x3f32f1["t"], _0x153e3b["t"]),
        SHAKE_WINDOW_S,
      )
    )
      continue;
    _0x3c710d["push"](_0x3af7fb);
  }
  return (
    _0x3c710d["push"](_0x2dfad1[_0x573c88["rUqRQ"](_0x2dfad1["length"], 0x1)]),
    _0x3c710d
  );
}
function resampleToFps(_0x3aaeea, _0x1c72cc, _0x45240d) {
  const _0x1e268f = _0x14ca87,
    _0x1f96ad = {
      GjJlv: function (_0x350b82, _0x469f9a) {
        return _0x350b82 + _0x469f9a;
      },
      hNKev: function (_0x119a73, _0x15c4c2) {
        return _0x119a73 - _0x15c4c2;
      },
      dTgPV: function (_0x139e4e, _0x16bafc) {
        return _0x139e4e / _0x16bafc;
      },
      SHEsJ: function (_0x147430, _0x312359) {
        return _0x147430 + _0x312359;
      },
      FCYZQ: function (_0x614ceb, _0x38dbb1) {
        return _0x614ceb + _0x38dbb1;
      },
      wrhFe: function (_0x20095d, _0x224bd2) {
        return _0x20095d * _0x224bd2;
      },
      SFBvB: function (_0x64e62e, _0x5cddc4, _0x52e5be, _0x25d489, _0x1b0e01) {
        return _0x64e62e(_0x5cddc4, _0x52e5be, _0x25d489, _0x1b0e01);
      },
      nLhRl: function (_0x472f75, _0x1d20c4) {
        return _0x472f75 !== _0x1d20c4;
      },
      VpnlO: function (_0x1c428c, _0x3ee16a) {
        return _0x1c428c === _0x3ee16a;
      },
      iKHna: "UJIKb",
      uTBRZ: function (_0x43bebd, _0x37ab31) {
        return _0x43bebd < _0x37ab31;
      },
      PXOUJ: function (_0x2a6727, _0x35b11b) {
        return _0x2a6727 < _0x35b11b;
      },
      MZFft: "xSXOz",
      NSqux: "zopxu",
      QGyWb: function (_0x441f75, _0xd03b49) {
        return _0x441f75 <= _0xd03b49;
      },
      YOriH: function (_0x4cb073, _0x3758db) {
        return _0x4cb073 === _0x3758db;
      },
      biBtW: function (_0x6b4d0, _0x2640d9) {
        return _0x6b4d0 >= _0x2640d9;
      },
      tviKW: function (_0x534b57, _0x1c80cc) {
        return _0x534b57 + _0x1c80cc;
      },
      xwiOE: function (_0x19b178, _0x29670e) {
        return _0x19b178 + _0x29670e;
      },
      VsGDE: function (_0x93f652, _0xd172a7) {
        return _0x93f652 - _0xd172a7;
      },
      TiAmf: function (_0x20b62b, _0x1860c2) {
        return _0x20b62b > _0x1860c2;
      },
      PaqIv: function (_0xc15b8a, _0x54e7e5) {
        return _0xc15b8a / _0x54e7e5;
      },
      wteiD: function (_0x51525c, _0x27863e) {
        return _0x51525c - _0x27863e;
      },
      qoRta: function (_0x1406ae, _0x24c5d4) {
        return _0x1406ae < _0x24c5d4;
      },
    },
    _0x1a52b8 = 0x1 / _0x45240d,
    _0x11f9ca = new Array(_0x1c72cc),
    _0x45f119 = _0x3aaeea["length"];
  if (_0x1f96ad["VpnlO"](_0x45f119, 0x0)) {
    if (_0x1f96ad["nLhRl"]("UJIKb", "UJIKb")) return [];
    else {
      for (
        let _0x5d2757 = 0x0;
        _0x1f96ad["uTBRZ"](_0x5d2757, _0x1c72cc);
        _0x5d2757++
      ) {
        if ("PCIWs" === "ajmzs") {
          const _0x22d5a3 = _0x1f96ad["GjJlv"](
            _0x1f96ad["hNKev"](_0x2d9eb0, 0x1),
            _0x1f96ad["dTgPV"](_0x20691c, _0xbb7b0c),
          );
          _0xa1d279 = _0x4d159b(
            _0x525a28,
            _0x1f96ad["SHEsJ"](_0x22d5a3, _0x11ad66),
          );
          if (_0x4832c5) {
            const _0x5dd69b = _0x53e898(
              _0x1f96ad["hNKev"](
                0x1,
                _0x1f96ad["hNKev"](_0xb2de78, _0x22d5a3) / _0x22aceb,
              ),
            );
            _0x2e4cfe = {
              x: _0x1f96ad["FCYZQ"](
                _0x376f99["x"],
                _0x1f96ad["wrhFe"](_0x17e03c["x"] - _0x34bf4f["x"], _0x5dd69b),
              ),
              y: _0x1f96ad["SHEsJ"](
                _0x3122cf["y"],
                (_0x39810a["y"] - _0x540b8f["y"]) * _0x5dd69b,
              ),
            };
          }
          (_0x1f96ad["SFBvB"](
            _0x29b68c,
            _0xd36886,
            _0x1ba885["x"],
            _0x5d27cb["omega"],
            _0x28cb26,
          ),
            _0x1f96ad["SFBvB"](
              _0x4955ca,
              _0x2af45a,
              _0x3b7d16["y"],
              _0xce43f8["omega"],
              _0x2135eb,
            ));
        } else
          _0x11f9ca[_0x5d2757] = {
            f: _0x5d2757,
            x: 0x0,
            y: 0x0,
            ct: "cursor",
            drag: ![],
          };
      }
      return _0x11f9ca;
    }
  }
  const _0x57688f = _0x3aaeea[0x0],
    _0x228b8f = _0x3aaeea[_0x1f96ad["hNKev"](_0x45f119, 0x1)];
  let _0x74a76c = 0x0;
  for (
    let _0x577373 = 0x0;
    _0x1f96ad["PXOUJ"](_0x577373, _0x1c72cc);
    _0x577373++
  ) {
    if (_0x1f96ad["VpnlO"]("xSXOz", "zopxu")) {
      const _0x28ebf9 = {};
      ((_0x28ebf9["ok"] = ![]),
        (_0x28ebf9["error"] = _0x2ae146["message"]),
        _0x48862f["postMessage"](_0x28ebf9));
    } else {
      const _0x418327 = _0x1f96ad["wrhFe"](_0x577373, _0x1a52b8);
      if (_0x1f96ad["QGyWb"](_0x418327, _0x57688f["t"])) {
        if (_0x1f96ad["YOriH"]("PJWfr", "PJWfr")) {
          _0x11f9ca[_0x577373] = {
            f: _0x577373,
            x: _0x57688f["x"],
            y: _0x57688f["y"],
            ct: _0x57688f["ct"],
            drag: !!_0x57688f["drag"],
          };
          continue;
        } else
          (_0x50370a === _0x4b58c4 ||
            _0x1f96ad["nLhRl"](
              _0x5443ac[_0x7d477d]["ct"],
              _0x5137e0[_0x2da73f]["ct"],
            )) &&
            (_0x3f4ef3["push"]({
              type: _0x38acfc[_0xb4217d]["ct"],
              start: _0x15e000,
              length: _0x1f96ad["hNKev"](_0x3f63d5, _0x1ba3fb),
            }),
            (_0x3aeed8 = _0x4deae4));
      }
      if (_0x1f96ad["biBtW"](_0x418327, _0x228b8f["t"])) {
        _0x11f9ca[_0x577373] = {
          f: _0x577373,
          x: _0x228b8f["x"],
          y: _0x228b8f["y"],
          ct: _0x228b8f["ct"],
          drag: !!_0x228b8f["drag"],
        };
        continue;
      }
      while (
        _0x1f96ad["SHEsJ"](_0x74a76c, 0x1) < _0x45f119 &&
        _0x1f96ad["PXOUJ"](
          _0x3aaeea[_0x1f96ad["tviKW"](_0x74a76c, 0x1)]["t"],
          _0x418327,
        )
      )
        _0x74a76c++;
      const _0x2f71bf = _0x3aaeea[_0x74a76c],
        _0x4abc45 = _0x3aaeea[_0x1f96ad["xwiOE"](_0x74a76c, 0x1)],
        _0x3422d1 = _0x1f96ad["VsGDE"](_0x4abc45["t"], _0x2f71bf["t"]),
        _0x4c5db7 =
          _0x3422d1 > IDLE_GAP_S
            ? 0x0
            : _0x1f96ad["TiAmf"](_0x3422d1, 1e-9)
              ? _0x1f96ad["PaqIv"](_0x418327 - _0x2f71bf["t"], _0x3422d1)
              : 0x0;
      _0x11f9ca[_0x577373] = {
        f: _0x577373,
        x:
          _0x2f71bf["x"] +
          _0x1f96ad["wrhFe"](
            _0x1f96ad["wteiD"](_0x4abc45["x"], _0x2f71bf["x"]),
            _0x4c5db7,
          ),
        y: _0x1f96ad["SHEsJ"](
          _0x2f71bf["y"],
          _0x1f96ad["hNKev"](_0x4abc45["y"], _0x2f71bf["y"]) * _0x4c5db7,
        ),
        ct: _0x1f96ad["qoRta"](_0x4c5db7, 0.5)
          ? _0x2f71bf["ct"]
          : _0x4abc45["ct"],
        drag: !!(_0x2f71bf["drag"] || _0x4abc45["drag"]),
      };
    }
  }
  return _0x11f9ca;
}
function stabilizeHoverIslands(_0x3dd7af) {
  const _0x3033c6 = _0x14ca87,
    _0x1487ab = {};
  ((_0x1487ab["bNjym"] = function (_0x459b35, _0x464932) {
    return _0x459b35 > _0x464932;
  }),
    (_0x1487ab["RJNBm"] = function (_0x5b4e93, _0x54c3a6) {
      return _0x5b4e93 + _0x54c3a6;
    }),
    (_0x1487ab["lEcAi"] = function (_0x1fa393, _0x44c584) {
      return _0x1fa393 * _0x44c584;
    }),
    (_0x1487ab["RiQGF"] = function (_0x48260f, _0x3fefcd) {
      return _0x48260f - _0x3fefcd;
    }),
    (_0x1487ab["fmtoy"] = function (_0xf658a, _0x1abcb3) {
      return _0xf658a * _0x1abcb3;
    }),
    (_0x1487ab["pTKMp"] = function (_0x5c6ef3, _0x59ac74) {
      return _0x5c6ef3 < _0x59ac74;
    }),
    (_0x1487ab["DAjHZ"] = function (_0x2e0d1a, _0x230e39) {
      return _0x2e0d1a - _0x230e39;
    }),
    (_0x1487ab["VEWNh"] = function (_0x1aa673, _0x1a56b3) {
      return _0x1aa673 / _0x1a56b3;
    }),
    (_0x1487ab["cjwif"] = function (_0x2979f3, _0xa26a3a) {
      return _0x2979f3 - _0xa26a3a;
    }),
    (_0x1487ab["ypdmx"] = function (_0x592e3a, _0x2e211c) {
      return _0x592e3a - _0x2e211c;
    }),
    (_0x1487ab["XrWyp"] = function (_0x26f2ee, _0x5bb0cb) {
      return _0x26f2ee * _0x5bb0cb;
    }),
    (_0x1487ab["lHfbJ"] = function (_0x54a9a6, _0x48a01a) {
      return _0x54a9a6 - _0x48a01a;
    }),
    (_0x1487ab["CIQOC"] = function (_0x50267a, _0x2831e6) {
      return _0x50267a + _0x2831e6;
    }),
    (_0x1487ab["iDGQI"] = function (_0x4d0b5e, _0x342364) {
      return _0x4d0b5e - _0x342364;
    }),
    (_0x1487ab["oJont"] = function (_0x3fb872, _0x26c512) {
      return _0x3fb872 + _0x26c512;
    }),
    (_0x1487ab["OnpyJ"] = "cursor"),
    (_0x1487ab["FeWxi"] = function (_0x5d8fc4, _0x213315) {
      return _0x5d8fc4 * _0x213315;
    }),
    (_0x1487ab["zRRzt"] = function (_0xf8037b, _0x47e879) {
      return _0xf8037b * _0x47e879;
    }),
    (_0x1487ab["HGbdG"] = function (_0x595b8a, _0x1b0ae6) {
      return _0x595b8a === _0x1b0ae6;
    }),
    (_0x1487ab["IIvcg"] = "dragged"),
    (_0x1487ab["KAyuV"] = "worker_threads"),
    (_0x1487ab["LuAdD"] = function (_0x531b5c, _0x5b7825) {
      return _0x531b5c < _0x5b7825;
    }),
    (_0x1487ab["VYbQM"] = function (_0x32f1e6, _0x5392e5) {
      return _0x32f1e6 !== _0x5392e5;
    }),
    (_0x1487ab["NhIkv"] = "mogqI"),
    (_0x1487ab["IRord"] = function (_0x169844, _0x4ed433) {
      return _0x169844 < _0x4ed433;
    }),
    (_0x1487ab["IGEiU"] = function (_0xa65a82, _0x40a617) {
      return _0xa65a82 === _0x40a617;
    }),
    (_0x1487ab["strTt"] = "awZMe"),
    (_0x1487ab["acKIZ"] = function (_0x5036c4, _0x10c58f) {
      return _0x5036c4 > _0x10c58f;
    }),
    (_0x1487ab["sxbpr"] = function (_0x417450, _0x372258) {
      return _0x417450 - _0x372258;
    }),
    (_0x1487ab["iiTqo"] = "GHIKR"),
    (_0x1487ab["KAJoG"] = "xTYVi"),
    (_0x1487ab["VOfxW"] = function (_0x26591b, _0x13ffee) {
      return _0x26591b >> _0x13ffee;
    }),
    (_0x1487ab["lLScD"] = function (_0x495a1e, _0x3cf0df) {
      return _0x495a1e / _0x3cf0df;
    }),
    (_0x1487ab["EfeBH"] = function (_0x28a7cd, _0x469005) {
      return _0x28a7cd + _0x469005;
    }),
    (_0x1487ab["kwgTl"] = function (_0x54930b, _0x300caf) {
      return _0x54930b & _0x300caf;
    }),
    (_0x1487ab["dfcKf"] = function (_0x2c10f0, _0x58e3bc) {
      return _0x2c10f0 > _0x58e3bc;
    }),
    (_0x1487ab["obwcF"] = function (_0x56ab03, _0xebc43f) {
      return _0x56ab03 - _0xebc43f;
    }),
    (_0x1487ab["rUawR"] = function (_0x4fd01e, _0x2a9754) {
      return _0x4fd01e - _0x2a9754;
    }),
    (_0x1487ab["zCTFq"] = function (_0x7695e5, _0x11d9c8) {
      return _0x7695e5 - _0x11d9c8;
    }),
    (_0x1487ab["YQvZG"] = "dvhNZ"),
    (_0x1487ab["uaOHW"] = function (_0x3e8327, _0x27060a) {
      return _0x3e8327 <= _0x27060a;
    }),
    (_0x1487ab["XWzyL"] = function (_0x58bbf4, _0x33c3d9) {
      return _0x58bbf4 - _0x33c3d9;
    }),
    (_0x1487ab["deoLJ"] = "bgDXw"),
    (_0x1487ab["Arbuj"] = "DJniC"),
    (_0x1487ab["JFtAA"] = "VYsxd"),
    (_0x1487ab["nrIHm"] = "eUkeX"),
    (_0x1487ab["MAiUs"] = "JypZU"));
  const _0x3afbca = _0x1487ab,
    _0x20eeca = _0x3dd7af["length"];
  if (_0x3afbca["pTKMp"](_0x20eeca, STILL_MIN_FRAMES))
    return _0x3dd7af["map"]((_0x5a522d) => ({ ..._0x5a522d }));
  const _0x5c8453 = _0x3dd7af["map"]((_0x132fc7) => ({ ..._0x132fc7 }));
  let _0x3dc0a1 = 0x0;
  while (_0x3afbca["LuAdD"](_0x3dc0a1, _0x20eeca)) {
    if (_0x3afbca["VYbQM"]("mogqI", "mogqI")) {
      const _0x5e160e = _0x34350a[_0x288c2a["length"] - 0x1],
        _0x4eeb45 = { ..._0x4e9d91[_0x435b4d] },
        _0x2023e0 = _0x4eeb45,
        _0x2f2667 = _0x4eaca0["hypot"](
          _0x2023e0["x"] - _0x5e160e["x"],
          _0x2023e0["y"] - _0x5e160e["y"],
        );
      if (_0x3afbca["bNjym"](_0x2f2667, _0x643d23)) {
        const _0x43efa2 = _0x3a79fc / _0x2f2667;
        ((_0x2023e0["x"] = _0x3afbca["RJNBm"](
          _0x5e160e["x"],
          _0x3afbca["lEcAi"](
            _0x3afbca["RiQGF"](_0x2023e0["x"], _0x5e160e["x"]),
            _0x43efa2,
          ),
        )),
          (_0x2023e0["y"] = _0x3afbca["RJNBm"](
            _0x5e160e["y"],
            _0x3afbca["fmtoy"](
              _0x3afbca["RiQGF"](_0x2023e0["y"], _0x5e160e["y"]),
              _0x43efa2,
            ),
          )));
      }
      _0x5e61ef["push"](_0x2023e0);
    } else {
      let _0x313c0e = _0x3dd7af[_0x3dc0a1]["x"],
        _0x34201e = _0x3dd7af[_0x3dc0a1]["x"],
        _0x1f3c78 = _0x3dd7af[_0x3dc0a1]["y"],
        _0x5d6068 = _0x3dd7af[_0x3dc0a1]["y"],
        _0x58916b = _0x3afbca["RJNBm"](_0x3dc0a1, 0x1);
      while (_0x3afbca["IRord"](_0x58916b, _0x20eeca)) {
        if (_0x3afbca["IGEiU"]("awZMe", "awZMe")) {
          const _0x16e0d5 = Math["min"](_0x313c0e, _0x3dd7af[_0x58916b]["x"]),
            _0x447beb = Math["max"](_0x34201e, _0x3dd7af[_0x58916b]["x"]),
            _0xd1b2d6 = Math["min"](_0x1f3c78, _0x3dd7af[_0x58916b]["y"]),
            _0x4af51a = Math["max"](_0x5d6068, _0x3dd7af[_0x58916b]["y"]);
          if (
            _0x3afbca["bNjym"](_0x447beb - _0x16e0d5, STILL_BBOX_PX) ||
            _0x3afbca["acKIZ"](
              _0x3afbca["sxbpr"](_0x4af51a, _0xd1b2d6),
              STILL_BBOX_PX,
            )
          )
            break;
          ((_0x313c0e = _0x16e0d5),
            (_0x34201e = _0x447beb),
            (_0x1f3c78 = _0xd1b2d6),
            (_0x5d6068 = _0x4af51a),
            _0x58916b++);
        } else {
          if (_0x3afbca["pTKMp"](_0x6239b["length"], 0x3))
            return _0x2f62ec["map"]((_0x50f5ed) => ({ ..._0x50f5ed }));
          const _0x28e7c2 = [];
          for (
            let _0x3cbaa7 = 0x1;
            _0x3cbaa7 < _0x3e3e1b["length"];
            _0x3cbaa7++
          ) {
            _0x28e7c2["push"](
              _0x2b6c25["hypot"](
                _0x3afbca["RiQGF"](
                  _0x301c21[_0x3cbaa7]["x"],
                  _0x533e0b[_0x3afbca["DAjHZ"](_0x3cbaa7, 0x1)]["x"],
                ),
                _0x3afbca["RiQGF"](
                  _0x238d9b[_0x3cbaa7]["y"],
                  _0x219c7f[_0x3afbca["DAjHZ"](_0x3cbaa7, 0x1)]["y"],
                ),
              ),
            );
          }
          const _0x55eb10 = [..._0x28e7c2]["sort"](
              (_0x1e8a8f, _0x19b068) => _0x1e8a8f - _0x19b068,
            ),
            _0x4b62f4 =
              _0x55eb10[
                _0x2e5247["floor"](_0x3afbca["VEWNh"](_0x55eb10["length"], 0x2))
              ] || 0x1,
            _0x27007a = _0x2db97c["max"](
              _0x1f6f99,
              _0x3afbca["fmtoy"](_0x4b62f4, _0x315dbc),
            ),
            _0x53e56a = [_0x405a1f[0x0]];
          for (
            let _0x29adb4 = 0x1;
            _0x3afbca["pTKMp"](_0x29adb4, _0xd7644a["length"]);
            _0x29adb4++
          ) {
            const _0x3c800a =
                _0x53e56a[_0x3afbca["cjwif"](_0x53e56a["length"], 0x1)],
              _0x11f980 = { ..._0xa0e706[_0x29adb4] },
              _0x2927ae = _0x11f980,
              _0x2aff2a = _0x55a1c0["hypot"](
                _0x3afbca["RiQGF"](_0x2927ae["x"], _0x3c800a["x"]),
                _0x3afbca["ypdmx"](_0x2927ae["y"], _0x3c800a["y"]),
              );
            if (_0x3afbca["bNjym"](_0x2aff2a, _0x27007a)) {
              const _0x37f902 = _0x3afbca["VEWNh"](_0x27007a, _0x2aff2a);
              ((_0x2927ae["x"] =
                _0x3c800a["x"] +
                _0x3afbca["XrWyp"](
                  _0x3afbca["lHfbJ"](_0x2927ae["x"], _0x3c800a["x"]),
                  _0x37f902,
                )),
                (_0x2927ae["y"] = _0x3afbca["CIQOC"](
                  _0x3c800a["y"],
                  _0x3afbca["XrWyp"](
                    _0x3afbca["iDGQI"](_0x2927ae["y"], _0x3c800a["y"]),
                    _0x37f902,
                  ),
                )));
            }
            _0x53e56a["push"](_0x2927ae);
          }
          return _0x53e56a;
        }
      }
      if (_0x58916b - _0x3dc0a1 >= STILL_MIN_FRAMES) {
        if (_0x3afbca["HGbdG"]("GHIKR", "GHIKR")) {
          const _0x22c198 = [],
            _0x3d46e3 = [];
          for (
            let _0x5c197e = _0x3dc0a1;
            _0x3afbca["IRord"](_0x5c197e, _0x58916b);
            _0x5c197e++
          ) {
            "xTYVi" === "xTYVi"
              ? (_0x22c198["push"](_0x3dd7af[_0x5c197e]["x"]),
                _0x3d46e3["push"](_0x3dd7af[_0x5c197e]["y"]))
              : (_0x22bbef["fill"](
                  0x1,
                  _0x3025cb,
                  _0x3afbca["oJont"](_0x552c58, 0x1),
                ),
                (_0x162d41 = null));
          }
          (_0x22c198["sort"]((_0xfcafa0, _0x384151) => _0xfcafa0 - _0x384151),
            _0x3d46e3["sort"]((_0x13c6e7, _0x2a6aa9) => _0x13c6e7 - _0x2a6aa9));
          const _0x2a5499 = _0x3afbca["VOfxW"](_0x22c198["length"], 0x1),
            _0x2efe23 =
              _0x22c198["length"] & 0x1
                ? _0x22c198[_0x2a5499]
                : _0x3afbca["lLScD"](
                    _0x3afbca["EfeBH"](
                      _0x22c198[_0x2a5499 - 0x1],
                      _0x22c198[_0x2a5499],
                    ),
                    0x2,
                  ),
            _0xeab92c = _0x3afbca["kwgTl"](_0x3d46e3["length"], 0x1)
              ? _0x3d46e3[_0x2a5499]
              : (_0x3d46e3[_0x2a5499 - 0x1] + _0x3d46e3[_0x2a5499]) / 0x2;
          let _0x301aa1 = _0x3dc0a1;
          while (
            _0x3afbca["dfcKf"](_0x301aa1, 0x0) &&
            Math["hypot"](
              _0x3afbca["obwcF"](
                _0x3dd7af[_0x3afbca["rUawR"](_0x301aa1, 0x1)]["x"],
                _0x2efe23,
              ),
              _0x3afbca["rUawR"](
                _0x3dd7af[_0x3afbca["zCTFq"](_0x301aa1, 0x1)]["y"],
                _0xeab92c,
              ),
            ) <= STILL_LOCK_RADIUS_PX
          ) {
            if ("dvhNZ" === "dvhNZ") _0x301aa1--;
            else {
              const _0x5063f9 = {};
              ((_0x5063f9["f"] = _0x1d35c2),
                (_0x5063f9["x"] = 0x0),
                (_0x5063f9["y"] = 0x0),
                (_0x5063f9["ct"] = "cursor"),
                (_0x5063f9["drag"] = ![]),
                (_0x1981dd[_0x3a030b] = _0x5063f9));
            }
          }
          let _0x562cc2 = _0x58916b;
          while (
            _0x562cc2 < _0x20eeca &&
            _0x3afbca["uaOHW"](
              Math["hypot"](
                _0x3afbca["XWzyL"](_0x3dd7af[_0x562cc2]["x"], _0x2efe23),
                _0x3afbca["rUawR"](_0x3dd7af[_0x562cc2]["y"], _0xeab92c),
              ),
              STILL_LOCK_RADIUS_PX,
            )
          ) {
            if (_0x3afbca["VYbQM"]("bgDXw", "DJniC")) _0x562cc2++;
            else {
              const _0x533ae6 = _0x4ae0c6["min"](
                0x1,
                _0x5f2d13["max"](0x0, _0x2ea812),
              );
              return _0x3afbca["FeWxi"](
                _0x3afbca["FeWxi"](_0x533ae6, _0x533ae6),
                _0x3afbca["iDGQI"](0x3, _0x3afbca["zRRzt"](0x2, _0x533ae6)),
              );
            }
          }
          for (let _0x3e2e6d = _0x301aa1; _0x3e2e6d < _0x562cc2; _0x3e2e6d++) {
            _0x3afbca["VYbQM"]("VYsxd", "eUkeX")
              ? ((_0x5c8453[_0x3e2e6d]["x"] = _0x2efe23),
                (_0x5c8453[_0x3e2e6d]["y"] = _0xeab92c))
              : ((_0x12d6e3["x"] = _0x2b2cd9["x"]),
                (_0x3f4bd9["x"] = _0x352557["y"]),
                (_0x2b3f0f["v"] = 0x0),
                (_0x30a96b["v"] = 0x0));
          }
          _0x3dc0a1 = _0x562cc2;
        } else
          _0x2af7f8["push"]({
            t: _0xd86cd4,
            x: _0x5bfc51,
            y: _0x1a7144,
            ct: _0x39863d,
            drag: _0x3afbca["HGbdG"](_0x22955b, "dragged"),
          });
      } else {
        if ("JypZU" === "JypZU") _0x3dc0a1++;
        else return _0x580134("worker_threads");
      }
    }
  }
  return _0x5c8453;
}
function springLagSeconds(_0x1b3782) {
  const _0x4c2720 = _0x14ca87;
  return 0x2 / _0x1b3782["omega"];
}
function stepCriticalSpring(_0x142377, _0x4cda00, _0x2ac2a8, _0x4e0c07) {
  const _0x1d50cf = _0x14ca87,
    _0x5b7834 = {};
  ((_0x5b7834["HPRrY"] = function (_0x572b3b, _0x3379ff) {
    return _0x572b3b - _0x3379ff;
  }),
    (_0x5b7834["pzXEN"] = function (_0x508102, _0x4b5b50) {
      return _0x508102 * _0x4b5b50;
    }),
    (_0x5b7834["uhkVY"] = function (_0x466bbe, _0x45177b) {
      return _0x466bbe + _0x45177b;
    }),
    (_0x5b7834["afTsA"] = function (_0x579d9a, _0x147238) {
      return _0x579d9a * _0x147238;
    }),
    (_0x5b7834["IscKq"] = function (_0x2a0d47, _0x28b084) {
      return _0x2a0d47 * _0x28b084;
    }));
  const _0xa2a27e = _0x5b7834,
    _0x87cd42 = _0xa2a27e["HPRrY"](_0x142377["x"], _0x4cda00),
    _0x22060f = Math["exp"](_0xa2a27e["pzXEN"](-_0x2ac2a8, _0x4e0c07)),
    _0x2272ed = _0xa2a27e["uhkVY"](
      _0x142377["v"],
      _0xa2a27e["pzXEN"](_0x2ac2a8, _0x87cd42),
    ),
    _0x3768fb = _0xa2a27e["uhkVY"](
      _0x87cd42,
      _0xa2a27e["afTsA"](_0x2272ed, _0x4e0c07),
    );
  ((_0x142377["x"] = _0x4cda00 + _0xa2a27e["IscKq"](_0x3768fb, _0x22060f)),
    (_0x142377["v"] =
      _0xa2a27e["HPRrY"](_0x2272ed, _0xa2a27e["IscKq"](_0x2ac2a8, _0x3768fb)) *
      _0x22060f));
}
function smoothstep(_0x204da7) {
  const _0x5f4721 = _0x14ca87,
    _0x21d854 = {};
  ((_0x21d854["TOuzS"] = function (_0x26f5af, _0x5257db) {
    return _0x26f5af * _0x5257db;
  }),
    (_0x21d854["WZDUB"] = function (_0x285791, _0x4ac116) {
      return _0x285791 * _0x4ac116;
    }),
    (_0x21d854["Vdnvp"] = function (_0x1b3cac, _0x3b8ee7) {
      return _0x1b3cac - _0x3b8ee7;
    }));
  const _0x4c31d6 = _0x21d854,
    _0x34f561 = Math["min"](0x1, Math["max"](0x0, _0x204da7));
  return _0x4c31d6["TOuzS"](
    _0x4c31d6["WZDUB"](_0x34f561, _0x34f561),
    _0x4c31d6["Vdnvp"](0x3, _0x4c31d6["WZDUB"](0x2, _0x34f561)),
  );
}
function samplePathAt(_0x31c1ad, _0x509953) {
  const _0x15ccca = _0x14ca87,
    _0x4a975b = {};
  ((_0x4a975b["LvEBQ"] = function (_0x3d9d26, _0x54c65c) {
    return _0x3d9d26 - _0x54c65c;
  }),
    (_0x4a975b["urRWZ"] = function (_0x40b4a2, _0x3829e5) {
      return _0x40b4a2 >= _0x3829e5;
    }),
    (_0x4a975b["vrLpt"] = function (_0x3fb2fe, _0xc1f4da) {
      return _0x3fb2fe - _0xc1f4da;
    }),
    (_0x4a975b["UnHtn"] = function (_0x38be98, _0x177364) {
      return _0x38be98 + _0x177364;
    }),
    (_0x4a975b["SDvfJ"] = function (_0x35a0b2, _0x2e4dfd) {
      return _0x35a0b2 - _0x2e4dfd;
    }),
    (_0x4a975b["BNnov"] = function (_0x3d0dcb, _0x437edc) {
      return _0x3d0dcb + _0x437edc;
    }),
    (_0x4a975b["bRTzk"] = function (_0x5b756b, _0x3dcc1b) {
      return _0x5b756b * _0x3dcc1b;
    }),
    (_0x4a975b["jWHXB"] = function (_0x2331e1, _0x126cf3) {
      return _0x2331e1 - _0x126cf3;
    }));
  const _0x3de6f9 = _0x4a975b,
    _0x2bd791 = _0x3de6f9["LvEBQ"](_0x31c1ad["length"], 0x1);
  if (_0x509953 <= 0x0) return _0x31c1ad[0x0];
  if (_0x3de6f9["urRWZ"](_0x509953, _0x2bd791)) return _0x31c1ad[_0x2bd791];
  const _0x2829df = Math["floor"](_0x509953),
    _0x3e2ea2 = _0x3de6f9["vrLpt"](_0x509953, _0x2829df),
    _0x29418e = _0x31c1ad[_0x2829df],
    _0x5e51d1 = _0x31c1ad[_0x3de6f9["UnHtn"](_0x2829df, 0x1)];
  return {
    x: _0x3de6f9["UnHtn"](
      _0x29418e["x"],
      _0x3de6f9["SDvfJ"](_0x5e51d1["x"], _0x29418e["x"]) * _0x3e2ea2,
    ),
    y: _0x3de6f9["BNnov"](
      _0x29418e["y"],
      _0x3de6f9["bRTzk"](
        _0x3de6f9["jWHXB"](_0x5e51d1["y"], _0x29418e["y"]),
        _0x3e2ea2,
      ),
    ),
  };
}
function buildDragMask(_0x167ba0, _0x47104b, _0x476f9a) {
  const _0x4d1452 = _0x14ca87,
    _0x42865d = {};
  ((_0x42865d["CpAoj"] = function (_0x314583, _0x517634) {
    return _0x314583 - _0x517634;
  }),
    (_0x42865d["eNvZc"] = function (_0x58794b, _0x3a4f4f) {
      return _0x58794b === _0x3a4f4f;
    }),
    (_0x42865d["kcIiG"] = "down"),
    (_0x42865d["IgLOP"] = function (_0x1e6edc, _0x1592de) {
      return _0x1e6edc !== _0x1592de;
    }),
    (_0x42865d["iuwhp"] = function (_0x4eff81, _0x1c18be) {
      return _0x4eff81 !== _0x1c18be;
    }));
  const _0x31887f = _0x42865d,
    _0x3ddad5 = new Uint8Array(_0x47104b);
  let _0x1e1e3c = null;
  for (const _0x290079 of _0x167ba0) {
    const _0x5c8fa3 = Math["min"](
      _0x31887f["CpAoj"](_0x47104b, 0x1),
      Math["max"](0x0, Math["round"](_0x290079["t"] * _0x476f9a)),
    );
    if (_0x31887f["eNvZc"](_0x290079["mt"], "down")) {
      if (_0x31887f["eNvZc"](_0x1e1e3c, null)) _0x1e1e3c = _0x5c8fa3;
    } else
      _0x290079["mt"] === "up" &&
        _0x31887f["IgLOP"](_0x1e1e3c, null) &&
        (_0x3ddad5["fill"](0x1, _0x1e1e3c, _0x5c8fa3 + 0x1),
        (_0x1e1e3c = null));
  }
  if (_0x31887f["iuwhp"](_0x1e1e3c, null)) _0x3ddad5["fill"](0x1, _0x1e1e3c);
  return _0x3ddad5;
}
function pickProfile(_0x35bbcc, _0x47126e, _0x1325d1) {
  const _0x5d628f = _0x14ca87,
    _0x370ea0 = {};
  _0x370ea0["obswq"] = function (_0x1b6768, _0x194823) {
    return _0x1b6768 <= _0x194823;
  };
  const _0x44afe9 = _0x370ea0;
  if (_0x44afe9["obswq"](_0x35bbcc, CLICK_STIFFEN_S * _0x1325d1))
    return SPRING_PROFILES["snappy"];
  if (_0x47126e) return SPRING_PROFILES["drag"];
  return SPRING_PROFILES["default"];
}
function trackWithSpring(_0x353f05, _0x262dce, _0x3f22ec, _0x223ca5) {
  const _0x31776c = _0x14ca87,
    _0x37b583 = {
      ZzYWv: function (_0x4d619f, _0x3fb308) {
        return _0x4d619f < _0x3fb308;
      },
      TTrpp: function (_0x4d1860, _0x44b833) {
        return _0x4d1860 / _0x44b833;
      },
      fyrvi: function (_0xbf45d7, _0x18b812) {
        return _0xbf45d7 * _0x18b812;
      },
      yHtWB: function (_0x71b9f1, _0x49eb40) {
        return _0x71b9f1(_0x49eb40);
      },
      VckLD: function (_0x199cc3, _0x350281) {
        return _0x199cc3 < _0x350281;
      },
      tAJrT: function (_0x5b376f, _0x3e3c7b) {
        return _0x5b376f === _0x3e3c7b;
      },
      YvVpW: function (_0x57f899, _0x4c1587, _0x28db25, _0x43706e) {
        return _0x57f899(_0x4c1587, _0x28db25, _0x43706e);
      },
      ebpFS: function (_0x14a26b, _0x528268) {
        return _0x14a26b === _0x528268;
      },
      IMMxm: function (_0x5cf789, _0x2f6879) {
        return _0x5cf789 * _0x2f6879;
      },
      ibxHi: function (_0x3407f2, _0x34baaa) {
        return _0x3407f2 - _0x34baaa;
      },
      DOjnS: function (_0x5cd4cb, _0x447556) {
        return _0x5cd4cb <= _0x447556;
      },
      GxMOx: function (_0x58ee66, _0x4fd207) {
        return _0x58ee66 + _0x4fd207;
      },
      xqJox: function (_0x3528a6, _0x43fc85) {
        return _0x3528a6 / _0x43fc85;
      },
      bvsIx: "mrKil",
      cNlxt: function (_0x26e7b5, _0x1034e9) {
        return _0x26e7b5 - _0x1034e9;
      },
      nWawt: function (_0x59423d, _0x4e21ac) {
        return _0x59423d + _0x4e21ac;
      },
      CEYsD: function (_0x2df851, _0x5608b0) {
        return _0x2df851 * _0x5608b0;
      },
      rOlmG: function (_0xe78faa, _0xf799ff, _0x13e1e7, _0x1ecece, _0x16f479) {
        return _0xe78faa(_0xf799ff, _0x13e1e7, _0x1ecece, _0x16f479);
      },
      zLUiI: function (_0xfcbf0c, _0x31770e, _0x2f2750, _0x162712, _0x2c5d2f) {
        return _0xfcbf0c(_0x31770e, _0x2f2750, _0x162712, _0x2c5d2f);
      },
      uyLra: function (_0x3fe74f, _0x385069) {
        return _0x3fe74f < _0x385069;
      },
      MsbiV: function (_0x2239e7, _0xd2af5a) {
        return _0x2239e7 - _0xd2af5a;
      },
      IGrMM: function (_0x161be9, _0x3a112f) {
        return _0x161be9 < _0x3a112f;
      },
      Bcmyu: function (_0x2bda91, _0x4fc4c3) {
        return _0x2bda91 - _0x4fc4c3;
      },
      EEtlC: function (_0xcde204, _0x1008b1) {
        return _0xcde204 < _0x1008b1;
      },
    },
    _0x2fdd0d = _0x353f05["length"],
    _0x212640 = _0x353f05["map"]((_0x58011f) => ({ ..._0x58011f }));
  if (_0x37b583["ZzYWv"](_0x2fdd0d, 0x2)) return _0x212640;
  const _0x7fa46a = _0x37b583["TTrpp"](0x1, _0x223ca5),
    _0x313589 = Math["max"](
      0x1,
      Math["round"](_0x37b583["TTrpp"](_0x7fa46a, SIM_STEP_S)),
    ),
    _0x13f0f8 = _0x37b583["TTrpp"](_0x7fa46a, _0x313589),
    _0x4dbeee =
      0x1 - Math["exp"](_0x37b583["TTrpp"](-_0x7fa46a, LEAD_EASE_TAU_S)),
    _0x2c7cb7 = _0x37b583["fyrvi"](CLICK_ANTICIPATE_S, _0x223ca5),
    _0xf7ec48 = {};
  ((_0xf7ec48["x"] = _0x353f05[0x0]["x"]), (_0xf7ec48["v"] = 0x0));
  const _0x148437 = _0xf7ec48,
    _0x3a933c = {};
  ((_0x3a933c["x"] = _0x353f05[0x0]["y"]), (_0x3a933c["v"] = 0x0));
  const _0x596741 = _0x3a933c;
  let _0x160dcc = _0x37b583["yHtWB"](
      springLagSeconds,
      SPRING_PROFILES["default"],
    ),
    _0x15cce6 = 0x0;
  for (
    let _0x44e432 = 0x1;
    _0x37b583["ZzYWv"](_0x44e432, _0x2fdd0d);
    _0x44e432++
  ) {
    while (
      _0x37b583["VckLD"](_0x15cce6, _0x262dce["length"]) &&
      _0x37b583["ZzYWv"](_0x262dce[_0x15cce6], _0x44e432)
    )
      _0x15cce6++;
    const _0xa54ba2 = _0x37b583["VckLD"](_0x15cce6, _0x262dce["length"])
        ? _0x262dce[_0x15cce6]
        : null,
      _0x57aeec = _0x37b583["tAJrT"](_0xa54ba2, null)
        ? Infinity
        : _0xa54ba2 - _0x44e432,
      _0x243e83 = _0x37b583["YvVpW"](
        pickProfile,
        _0x57aeec,
        _0x37b583["ebpFS"](_0x3f22ec[_0x44e432], 0x1),
        _0x223ca5,
      );
    _0x160dcc += _0x37b583["IMMxm"](
      _0x37b583["ibxHi"](
        _0x37b583["yHtWB"](springLagSeconds, _0x243e83),
        _0x160dcc,
      ),
      _0x4dbeee,
    );
    const _0x4866c8 = _0x37b583["fyrvi"](_0x160dcc, _0x223ca5),
      _0x59a0b8 = _0x57aeec <= _0x2c7cb7 ? _0x353f05[_0xa54ba2] : null;
    let _0x1e0bc1 = null;
    for (
      let _0x1d68bd = 0x1;
      _0x37b583["DOjnS"](_0x1d68bd, _0x313589);
      _0x1d68bd++
    ) {
      const _0x310de6 = _0x37b583["GxMOx"](
        _0x44e432 - 0x1,
        _0x37b583["xqJox"](_0x1d68bd, _0x313589),
      );
      _0x1e0bc1 = samplePathAt(_0x353f05, _0x310de6 + _0x4866c8);
      if (_0x59a0b8) {
        if ("mrKil" !== "RqDgD") {
          const _0xfcd823 = _0x37b583["yHtWB"](
            smoothstep,
            _0x37b583["cNlxt"](0x1, (_0xa54ba2 - _0x310de6) / _0x2c7cb7),
          );
          _0x1e0bc1 = {
            x: _0x37b583["GxMOx"](
              _0x1e0bc1["x"],
              _0x37b583["fyrvi"](
                _0x37b583["cNlxt"](_0x59a0b8["x"], _0x1e0bc1["x"]),
                _0xfcd823,
              ),
            ),
            y: _0x37b583["nWawt"](
              _0x1e0bc1["y"],
              _0x37b583["CEYsD"](
                _0x37b583["ibxHi"](_0x59a0b8["y"], _0x1e0bc1["y"]),
                _0xfcd823,
              ),
            ),
          };
        } else _0x192f54++;
      }
      (_0x37b583["rOlmG"](
        stepCriticalSpring,
        _0x148437,
        _0x1e0bc1["x"],
        _0x243e83["omega"],
        _0x13f0f8,
      ),
        _0x37b583["zLUiI"](
          stepCriticalSpring,
          _0x596741,
          _0x1e0bc1["y"],
          _0x243e83["omega"],
          _0x13f0f8,
        ));
    }
    (_0x37b583["uyLra"](
      Math["abs"](_0x37b583["MsbiV"](_0x1e0bc1["x"], _0x148437["x"])),
      REST_DISTANCE_PX,
    ) &&
      _0x37b583["IGrMM"](
        Math["abs"](_0x37b583["Bcmyu"](_0x1e0bc1["y"], _0x596741["x"])),
        REST_DISTANCE_PX,
      ) &&
      _0x37b583["EEtlC"](
        Math["hypot"](_0x148437["v"], _0x596741["v"]),
        REST_SPEED_PX_S,
      ) &&
      ((_0x148437["x"] = _0x1e0bc1["x"]),
      (_0x596741["x"] = _0x1e0bc1["y"]),
      (_0x148437["v"] = 0x0),
      (_0x596741["v"] = 0x0)),
      (_0x212640[_0x44e432]["x"] = _0x148437["x"]),
      (_0x212640[_0x44e432]["y"] = _0x596741["x"]));
  }
  return _0x212640;
}
function stabilizeCursorTypes(_0x26a6ff) {
  const _0xe86bf8 = _0x14ca87,
    _0x1870c6 = {
      yVOlV: function (_0x337569, _0x212628, _0x368dc0) {
        return _0x337569(_0x212628, _0x368dc0);
      },
      VbuqA: function (_0x47fca5, _0x1d4178) {
        return _0x47fca5 - _0x1d4178;
      },
      DxjCs: function (_0x1dc918, _0x1016b9) {
        return _0x1dc918 * _0x1016b9;
      },
      MsRui: function (_0x17fe6f, _0x2d5c73) {
        return _0x17fe6f / _0x2d5c73;
      },
      QJCzS: function (_0x4c831c, _0x4696d7) {
        return _0x4c831c * _0x4696d7;
      },
      rgqNa: function (_0x570ddc, _0x5b88db) {
        return _0x570ddc - _0x5b88db;
      },
      PLpiJ: function (_0x51fad3, _0x558ccc) {
        return _0x51fad3 + _0x558ccc;
      },
      eyHaF: function (_0x1d1084, _0x365359) {
        return _0x1d1084 * _0x365359;
      },
      GGoMk: function (_0x3c1a34, _0x1c775a) {
        return _0x3c1a34 < _0x1c775a;
      },
      cNMKf: function (_0x447d50, _0x4f4214) {
        return _0x447d50 < _0x4f4214;
      },
      VNvGZ: function (_0x267965, _0x414724) {
        return _0x267965 <= _0x414724;
      },
      ZSxGP: function (_0x158c46, _0x514671) {
        return _0x158c46 !== _0x514671;
      },
      XjPyQ: function (_0x49f022, _0x3a34a4) {
        return _0x49f022 !== _0x3a34a4;
      },
      PGxwz: function (_0x271148, _0x3c0b58) {
        return _0x271148 === _0x3c0b58;
      },
      UcsXp: "tDZas",
      whokg: function (_0x499dc2, _0x2484d4) {
        return _0x499dc2 - _0x2484d4;
      },
      ifhRM: function (_0xa05e9e, _0x5feffc) {
        return _0xa05e9e >= _0x5feffc;
      },
      hLICe: function (_0x6c0cd6, _0x5523f3) {
        return _0x6c0cd6 + _0x5523f3;
      },
      AkOHS: function (_0x592f6a, _0x110d29) {
        return _0x592f6a && _0x110d29;
      },
      cXgJj: function (_0x5136f3, _0xa5f7a4) {
        return _0x5136f3 !== _0xa5f7a4;
      },
      lfcnR: "foaWe",
      zGtIb: "cEHqZ",
      JLDHD: function (_0xbc9ce, _0x4e3e45) {
        return _0xbc9ce === _0x4e3e45;
      },
      IYFBF: "LPGng",
    },
    _0x1e952d = _0x26a6ff["length"];
  if (_0x1870c6["GGoMk"](_0x1e952d, CURSOR_TYPE_MIN_FRAMES)) return _0x26a6ff;
  const _0x4a91cb = _0x26a6ff["map"]((_0x8c427b) => ({ ..._0x8c427b }));
  let _0x4895a6 = !![],
    _0x16c947 = 0x0;
  while (
    _0x4895a6 &&
    _0x1870c6["cNMKf"](_0x16c947, CURSOR_TYPE_MAX_STABILIZE_PASSES)
  ) {
    ((_0x16c947 += 0x1), (_0x4895a6 = ![]));
    const _0x38f31b = [];
    let _0x36cd8d = 0x0;
    for (
      let _0x2f6783 = 0x1;
      _0x1870c6["VNvGZ"](_0x2f6783, _0x1e952d);
      _0x2f6783++
    ) {
      if (_0x1870c6["ZSxGP"]("Hziqs", "Hziqs"))
        try {
          const _0x31fd03 = _0x1870c6["yVOlV"](
              _0x189e94,
              _0x379471["rawEvents"],
              _0x4d9ff9["opts"],
            ),
            _0x22d32f = {};
          ((_0x22d32f["ok"] = !![]),
            (_0x22d32f["result"] = _0x31fd03),
            _0x1589d2["postMessage"](_0x22d32f));
        } catch (_0xb572a8) {
          const _0x20ead9 = {};
          ((_0x20ead9["ok"] = ![]),
            (_0x20ead9["error"] = _0xb572a8["message"]),
            _0x2e7838["postMessage"](_0x20ead9));
        }
      else {
        if (
          _0x2f6783 === _0x1e952d ||
          _0x1870c6["XjPyQ"](
            _0x4a91cb[_0x2f6783]["ct"],
            _0x4a91cb[_0x36cd8d]["ct"],
          )
        ) {
          if (_0x1870c6["PGxwz"]("tDZas", "tDZas"))
            (_0x38f31b["push"]({
              type: _0x4a91cb[_0x36cd8d]["ct"],
              start: _0x36cd8d,
              length: _0x1870c6["whokg"](_0x2f6783, _0x36cd8d),
            }),
              (_0x36cd8d = _0x2f6783));
          else {
            const _0x6ebfde = {};
            ((_0x6ebfde["t"] = _0x14491a),
              (_0x6ebfde["x"] = _0x5f5b25),
              (_0x6ebfde["y"] = _0x1bdd46),
              (_0x6ebfde["ct"] = _0x2da268),
              (_0x6ebfde["mt"] = _0x539bd1),
              _0x394fac["push"](_0x6ebfde));
          }
        }
      }
    }
    for (
      let _0x64b63e = 0x0;
      _0x1870c6["GGoMk"](_0x64b63e, _0x38f31b["length"]);
      _0x64b63e++
    ) {
      if (
        _0x1870c6["ifhRM"](
          _0x38f31b[_0x64b63e]["length"],
          CURSOR_TYPE_MIN_FRAMES,
        )
      )
        continue;
      const _0x2b498b =
          _0x64b63e > 0x0
            ? _0x38f31b[_0x1870c6["VbuqA"](_0x64b63e, 0x1)]["type"]
            : null,
        _0x5e4cdd = _0x1870c6["GGoMk"](_0x64b63e + 0x1, _0x38f31b["length"])
          ? _0x38f31b[_0x1870c6["hLICe"](_0x64b63e, 0x1)]["type"]
          : null;
      let _0x45a80b = null;
      if (_0x1870c6["AkOHS"](_0x2b498b, _0x5e4cdd) && _0x2b498b === _0x5e4cdd)
        _0x45a80b = _0x2b498b;
      else {
        if (_0x2b498b) {
          if (_0x1870c6["cXgJj"]("foaWe", "cEHqZ")) _0x45a80b = _0x2b498b;
          else {
            const _0x275d51 = _0x4294f4["min"](
                _0x1870c6["VbuqA"](_0x36e86f, 0x1),
                _0x45bcb8["max"](
                  0x0,
                  _0x3c6c68["round"](
                    _0x1870c6["DxjCs"](_0x49ca30["t"], _0x57e066),
                  ),
                ),
              ),
              _0xe57ce8 = _0x41a093[_0x275d51];
            _0x491053["push"]({
              eventType: _0xf52e3b["mt"],
              frame: _0x275d51,
              x: _0x1870c6["MsRui"](
                _0x4d0e03["round"](_0x1870c6["QJCzS"](_0xe57ce8["x"], 0xa)),
                0xa,
              ),
              y: _0x7cfbeb["round"](_0xe57ce8["y"] * 0xa) / 0xa,
              cursorType: _0xe57ce8["ct"],
              cursorEvent: !![],
            });
          }
        } else _0x5e4cdd && (_0x45a80b = _0x5e4cdd);
      }
      if (_0x45a80b && _0x45a80b !== _0x38f31b[_0x64b63e]["type"]) {
        for (
          let _0x14b7e8 = _0x38f31b[_0x64b63e]["start"];
          _0x14b7e8 <
          _0x38f31b[_0x64b63e]["start"] + _0x38f31b[_0x64b63e]["length"];
          _0x14b7e8++
        ) {
          if (_0x1870c6["JLDHD"]("LPGng", "ITWfb")) {
            const _0x524c90 = _0x1870c6["VbuqA"](_0x53688a["length"], 0x1);
            if (_0x45ff4e <= 0x0) return _0x55561f[0x0];
            if (_0xcf8c11 >= _0x524c90) return _0x3af50a[_0x524c90];
            const _0x3e6b98 = _0x2ecc40["floor"](_0x3671ba),
              _0x498bc9 = _0x1870c6["rgqNa"](_0x1ed7b1, _0x3e6b98),
              _0x218802 = _0x9b22be[_0x3e6b98],
              _0x2ea329 = _0x55d110[_0x3e6b98 + 0x1];
            return {
              x: _0x1870c6["PLpiJ"](
                _0x218802["x"],
                (_0x2ea329["x"] - _0x218802["x"]) * _0x498bc9,
              ),
              y:
                _0x218802["y"] +
                _0x1870c6["eyHaF"](
                  _0x1870c6["VbuqA"](_0x2ea329["y"], _0x218802["y"]),
                  _0x498bc9,
                ),
            };
          } else _0x4a91cb[_0x14b7e8]["ct"] = _0x45a80b;
        }
        _0x4895a6 = !![];
      }
    }
  }
  return _0x4a91cb;
}

function buildSmoothedInputEvents(_0x3a71b3, _0x30d01c) {
  const _0x4b2d94 = _0x14ca87,
    _0x3b1292 = {
      QqaaC: "^$",
      iZKqv: function (_0x4bf8c2, _0x16a906) {
        return _0x4bf8c2(_0x16a906);
      },
      mRDew: "worker_threads",
      lwDAZ: function (_0x6d998a, _0x1cab97) {
        return _0x6d998a - _0x1cab97;
      },
      rfvpJ: function (_0xc80646, _0x131ad3) {
        return _0xc80646 === _0x131ad3;
      },
      iGQAb: "down",
      jbtAB: function (_0x2936c8, _0x20ee9c) {
        return _0x2936c8 === _0x20ee9c;
      },
      lcMJK: function (_0x210645, _0x263cee) {
        return _0x210645 === _0x263cee;
      },
      wbRqb: function (_0x3e7b85, _0x5723cd) {
        return _0x3e7b85 !== _0x5723cd;
      },
      UUuRO: function (_0x1d2129, _0x5a1496) {
        return _0x1d2129 + _0x5a1496;
      },
      GHoyK: function (_0x10714e, _0xf3d228) {
        return _0x10714e <= _0xf3d228;
      },
      xckvy: "klNjE",
      vovLD: function (_0xacdfe2, _0x264674) {
        return _0xacdfe2 === _0x264674;
      },
      ZLpaC: "AmHup",
      GbLMX: function (_0x2a72bf, _0x212114) {
        return _0x2a72bf === _0x212114;
      },
      xJCLo: "QOdSb",
      bcgaE: function (_0x12cc1d, _0xd2e4f) {
        return _0x12cc1d * _0xd2e4f;
      },
      HDlfz: "mouse",
      XeBNC: function (_0x5a92c0, _0x188e7c) {
        return _0x5a92c0(_0x188e7c);
      },
      QdWHS: function (_0x31b233, _0x55fca9, _0x2f2f5d) {
        return _0x31b233(_0x55fca9, _0x2f2f5d);
      },
      ochxP: function (_0x7025ef, _0x1b457c) {
        return _0x7025ef(_0x1b457c);
      },
      ZvLFu: function (_0x3ea5a2, _0x3c3c6d) {
        return _0x3ea5a2 === _0x3c3c6d;
      },
      okDry: "moved",
      VtRqN: function (_0x5570f6, _0x46847e) {
        return _0x5570f6 === _0x46847e;
      },
      leSTl: "dragged",
      TxtLq: function (_0x4d24b3, _0xfceeca) {
        return _0x4d24b3 === _0xfceeca;
      },
      trgrc: function (_0x20f91c, _0x244bcc) {
        return _0x20f91c !== _0x244bcc;
      },
      zsfss: "KLDqd",
      HjUrH: "FFBsq",
      dakhC: function (_0x17b06d, _0x4662a6) {
        return _0x17b06d(_0x4662a6);
      },
      Ollut: function (_0x37a3d, _0xde094a, _0x11f266, _0x1f7e19) {
        return _0x37a3d(_0xde094a, _0x11f266, _0x1f7e19);
      },
      QMaEG: function (_0x56217b, _0x37302f) {
        return _0x56217b(_0x37302f);
      },
      gthmF: function (_0xdb1d39, _0x59b359, _0x59207b, _0x1ab11f) {
        return _0xdb1d39(_0x59b359, _0x59207b, _0x1ab11f);
      },
      ngfVJ: function (_0x407cbc, _0x3b474f, _0x1d12c9, _0x517a28, _0x4ee211) {
        return _0x407cbc(_0x3b474f, _0x1d12c9, _0x517a28, _0x4ee211);
      },
      pNvzw: function (_0x38ca8c, _0x38d1c8) {
        return _0x38ca8c(_0x38d1c8);
      },
      tUxhh: "oJBUf",
      DiGsZ: function (_0xd1e3a5, _0x18654c) {
        return _0xd1e3a5 - _0x18654c;
      },
      orKLg: function (_0xa97341, _0x32b333) {
        return _0xa97341 / _0x32b333;
      },
      UtFet: function (_0x30db80, _0x130a4f) {
        return _0x30db80 < _0x130a4f;
      },
      fmILw: function (_0x494d48, _0x2a724c) {
        return _0x494d48 * _0x2a724c;
      },
      GdOom: function (_0x43a95e, _0x7e4a81) {
        return _0x43a95e * _0x7e4a81;
      },
      teXyQ: function (_0xf7ccfb, _0x2b5d08) {
        return _0xf7ccfb === _0x2b5d08;
      },
    },
    {
      displayWidth: _0x30c456,
      displayHeight: _0x4be46e,
      xOffset: _0xe1491b,
      yOffset: _0x3a57ba,
      frameCount: _0x433d95,
      fps: fps = DEFAULT_FPS,
    } = _0x30d01c;
  if (!Array["isArray"](_0x3a71b3) || _0x3b1292["GHoyK"](_0x433d95, 0x0)) {
    if ("klNjE" === "klNjE") return [];
    else {
      const _0x373d7c = _0x4b36a1["apply"](_0x3dd74b, arguments);
      return ((_0x25df9c = null), _0x373d7c);
    }
  }
  const _0x119f72 = (_0x42c853, _0x4fa38b) => ({
      x: _0x42c853 * _0x30c456 - _0xe1491b,
      y: (0x1 - _0x4fa38b) * _0x4be46e - _0x3a57ba,
    }),
    _0x21a97a = [],
    _0x3a76c0 = [],
    _0x2ab93b = [];
  for (const _0x5739b5 of _0x3a71b3) {
    if (_0x3b1292["vovLD"]("AmHup", "fAPCa")) {
      if (_0x131bc3) {
        const _0x36a630 = _0x28a846["apply"](_0x194c0f, arguments);
        return ((_0x33440a = null), _0x36a630);
      }
    } else {
      if (!_0x5739b5) continue;
      if (_0x3b1292["vovLD"](_0x5739b5["type"], "keyboard")) {
        if (_0x3b1292["GbLMX"]("QOdSb", "QOdSb")) {
          const _0x5601c3 = _0x3b1292["iZKqv"](
              Number,
              _0x5739b5["time"]?.["seconds"] ?? 0x0,
            ),
            _0x1ddf74 = Number["isFinite"](_0x5601c3) ? _0x5601c3 : 0x0;
          _0x2ab93b["push"]({
            eventType: _0x5739b5["keyboardEventType"] || "down",
            frame: Math["min"](
              _0x3b1292["lwDAZ"](_0x433d95, 0x1),
              Math["max"](
                0x0,
                Math["round"](_0x3b1292["bcgaE"](_0x1ddf74, fps)),
              ),
            ),
            x: 0x0,
            y: 0x0,
            cursorType: undefined,
            cursorEvent: ![],
          });
          continue;
        } else
          return _0x626e4e["toString"]()
            ["search"](GkUGaB["QqaaC"])
            ["toString"]()
            ["constructor"](_0x275c1f)
            ["search"]("^$");
      }
      if (_0x5739b5["type"] !== "mouse") continue;
      const _0x127a4d = _0x3b1292["XeBNC"](
          Number,
          _0x5739b5["time"]?.["seconds"] ?? 0x0,
        ),
        { x: _0x2a17b7, y: _0x194754 } = _0x3b1292["QdWHS"](
          _0x119f72,
          _0x3b1292["XeBNC"](Number, _0x5739b5["x"]),
          _0x3b1292["ochxP"](Number, _0x5739b5["y"]),
        ),
        _0x52eee8 = _0x5739b5["cursorType"] || "cursor",
        _0x97d190 = _0x5739b5["mouseEventType"];
      if (
        !Number["isFinite"](_0x127a4d) ||
        !Number["isFinite"](_0x2a17b7) ||
        !Number["isFinite"](_0x194754)
      ) {
        if ("JOrhr" !== "qKmdb") continue;
        else
          try {
            return _0x3b1292["iZKqv"](_0x332a7d, "worker_threads");
          } catch {
            return {};
          }
      }
      if (
        _0x3b1292["ZvLFu"](_0x97d190, "moved") ||
        _0x3b1292["VtRqN"](_0x97d190, "dragged")
      )
        _0x21a97a["push"]({
          t: _0x127a4d,
          x: _0x2a17b7,
          y: _0x194754,
          ct: _0x52eee8,
          drag: _0x3b1292["TxtLq"](_0x97d190, "dragged"),
        });
      else {
        if (_0x3b1292["trgrc"]("KLDqd", "FFBsq")) {
          const _0x176a19 = {};
          ((_0x176a19["t"] = _0x127a4d),
            (_0x176a19["x"] = _0x2a17b7),
            (_0x176a19["y"] = _0x194754),
            (_0x176a19["ct"] = _0x52eee8),
            (_0x176a19["mt"] = _0x97d190),
            _0x3a76c0["push"](_0x176a19));
        } else {
          const _0x344d35 = new _0x573948(_0x7c8c6e);
          let _0x2211dc = null;
          for (const _0x123f12 of _0x3db0b0) {
            const _0x14d461 = _0x18c86a["min"](
              _0x3b1292["lwDAZ"](_0x2bc0e1, 0x1),
              _0x9f1992["max"](
                0x0,
                _0x382011["round"](_0x123f12["t"] * _0x5c20b5),
              ),
            );
            if (_0x3b1292["rfvpJ"](_0x123f12["mt"], "down")) {
              if (_0x3b1292["jbtAB"](_0x2211dc, null)) _0x2211dc = _0x14d461;
            } else
              _0x3b1292["lcMJK"](_0x123f12["mt"], "up") &&
                _0x3b1292["wbRqb"](_0x2211dc, null) &&
                (_0x344d35["fill"](
                  0x1,
                  _0x2211dc,
                  _0x3b1292["UUuRO"](_0x14d461, 0x1),
                ),
                (_0x2211dc = null));
          }
          if (_0x2211dc !== null) _0x344d35["fill"](0x1, _0x2211dc);
          return _0x344d35;
        }
      }
    }
  }
  (_0x21a97a["sort"]((_0x32e3b2, _0x304d26) => _0x32e3b2["t"] - _0x304d26["t"]),
    _0x3a76c0["sort"](
      (_0x2cba54, _0x6d12d7) => _0x2cba54["t"] - _0x6d12d7["t"],
    ));
  const _0x4bdca2 = _0x3b1292["ochxP"](
    removeShake,
    _0x3b1292["dakhC"](clampOutlierJumps, _0x21a97a),
  );
  _0x21a97a["length"] = 0x0;
  const _0x1dd6d4 = _0x3b1292["Ollut"](
    resampleToFps,
    _0x4bdca2,
    _0x433d95,
    fps,
  );
  _0x4bdca2["length"] = 0x0;
  const _0x16917c = _0x3b1292["QMaEG"](stabilizeHoverIslands, _0x1dd6d4);
  _0x1dd6d4["length"] = 0x0;
  const _0x30c572 = (_0x485543) =>
      Math["min"](
        _0x433d95 - 0x1,
        Math["max"](0x0, Math["round"](_0x485543 * fps)),
      ),
    _0x407ac3 = _0x3a76c0["filter"](
      (_0x2791bd) => _0x2791bd["mt"] === "down" || _0x2791bd["mt"] === "up",
    ),
    _0x95d4c3 = _0x407ac3["filter"]((_0x5ba5ee) => _0x5ba5ee["mt"] === "down")[
      "map"
    ]((_0x53b0ba) => _0x30c572(_0x53b0ba["t"])),
    _0x7ba884 = _0x3b1292["gthmF"](buildDragMask, _0x407ac3, _0x433d95, fps),
    _0x166b20 = _0x3b1292["ngfVJ"](
      trackWithSpring,
      _0x16917c,
      _0x95d4c3,
      _0x7ba884,
      fps,
    );
  _0x16917c["length"] = 0x0;
  const _0x1fe6a5 = _0x3b1292["pNvzw"](stabilizeCursorTypes, _0x166b20);
  _0x166b20["length"] = 0x0;
  const _0x573da5 = [];
  for (const _0x33a71a of _0x3a76c0) {
    if ("oJBUf" === "YTMUb") _0x3600b7[_0x218a6d]["ct"] = _0x5f06a9;
    else {
      const _0x1057c1 = Math["min"](
          _0x3b1292["DiGsZ"](_0x433d95, 0x1),
          Math["max"](
            0x0,
            Math["round"](_0x3b1292["bcgaE"](_0x33a71a["t"], fps)),
          ),
        ),
        _0xb39aeb = _0x1fe6a5[_0x1057c1];
      _0x573da5["push"]({
        eventType: _0x33a71a["mt"],
        frame: _0x1057c1,
        x: _0x3b1292["orKLg"](
          Math["round"](_0x3b1292["bcgaE"](_0xb39aeb["x"], 0xa)),
          0xa,
        ),
        y: _0x3b1292["orKLg"](
          Math["round"](_0x3b1292["bcgaE"](_0xb39aeb["y"], 0xa)),
          0xa,
        ),
        cursorType: _0xb39aeb["ct"],
        cursorEvent: !![],
      });
    }
  }
  const _0x3414a6 = [];
  let _0x4e33c2 = null,
    _0x211c65 = null,
    _0x5bbd52 = null;
  for (
    let _0x20e4e4 = 0x0;
    _0x3b1292["UtFet"](_0x20e4e4, _0x433d95);
    _0x20e4e4++
  ) {
    const _0x5214d8 = _0x1fe6a5[_0x20e4e4],
      _0x2853bd = _0x3b1292["orKLg"](
        Math["round"](_0x3b1292["fmILw"](_0x5214d8["x"], 0xa)),
        0xa,
      ),
      _0x402a0a = _0x3b1292["orKLg"](
        Math["round"](_0x3b1292["GdOom"](_0x5214d8["y"], 0xa)),
        0xa,
      ),
      _0x142d27 = _0x5214d8["ct"];
    if (
      _0x3b1292["teXyQ"](_0x20e4e4, 0x0) ||
      _0x2853bd !== _0x4e33c2 ||
      _0x3b1292["trgrc"](_0x402a0a, _0x211c65) ||
      _0x3b1292["wbRqb"](_0x142d27, _0x5bbd52)
    ) {
      const _0x5e1c65 = {};
      ((_0x5e1c65["eventType"] = "moved"),
        (_0x5e1c65["frame"] = _0x20e4e4),
        (_0x5e1c65["x"] = _0x2853bd),
        (_0x5e1c65["y"] = _0x402a0a),
        (_0x5e1c65["cursorType"] = _0x142d27),
        (_0x5e1c65["cursorEvent"] = !![]),
        _0x3414a6["push"](_0x5e1c65),
        (_0x4e33c2 = _0x2853bd),
        (_0x211c65 = _0x402a0a),
        (_0x5bbd52 = _0x142d27));
    }
  }
  return (
    (_0x1fe6a5["length"] = 0x0),
    _0x3414a6["push"](..._0x2ab93b),
    _0x3414a6["push"](..._0x573da5),
    _0x3414a6
  );
}
const _0x39a3c7 = {};
((_0x39a3c7["buildSmoothedInputEvents"] = buildSmoothedInputEvents),
  (_0x39a3c7["CURSOR_TRACK_VERSION_BAKED"] = CURSOR_TRACK_VERSION_BAKED),
  (module["exports"] = _0x39a3c7));
const { workerData, parentPort } = (() => {
  const _0x21e5e7 = _0x14ca87,
    _0x582d35 = {
      WXLwH: function (_0x911484, _0x3d1c4a) {
        return _0x911484 === _0x3d1c4a;
      },
      wUpYD: "YcIfn",
      GoruD: function (_0xa93cb0, _0x336ae7) {
        return _0xa93cb0(_0x336ae7);
      },
      IsuBZ: function (_0x11febd, _0x9b0153) {
        return _0x11febd !== _0x9b0153;
      },
      Vcweb: "mRKiZ",
    };
  try {
    if (_0x582d35["WXLwH"]("YcIfn", "YcIfn"))
      return _0x582d35["GoruD"](require, "worker_threads");
    else _0xf0a3db++;
  } catch {
    return _0x582d35["IsuBZ"]("mRKiZ", "mRKiZ") ? {} : {};
  }
})();
parentPort &&
  parentPort["once"]("message", (_0x439ee1) => {
    const _0x2818bf = _0x14ca87,
      _0x285757 = {};
    ((_0x285757["AcYFa"] = function (_0x1adf09, _0x3d5eef) {
      return _0x1adf09 < _0x3d5eef;
    }),
      (_0x285757["zNPpK"] = function (_0x4e3406, _0x2eea32) {
        return _0x4e3406 + _0x2eea32;
      }),
      (_0x285757["xHaSv"] = "VMPAE"),
      (_0x285757["XQkCH"] = "cQWGH"));
    const _0x128a3d = _0x285757;
    try {
      const _0xeb69c5 = buildSmoothedInputEvents(
          _0x439ee1["rawEvents"],
          _0x439ee1["opts"],
        ),
        _0x3c3d8c = {};
      ((_0x3c3d8c["ok"] = !![]),
        (_0x3c3d8c["result"] = _0xeb69c5),
        parentPort["postMessage"](_0x3c3d8c));
    } catch (_0x1cf6d5) {
      if ("VMPAE" !== "cQWGH") {
        const _0x45ecf3 = {};
        ((_0x45ecf3["ok"] = ![]),
          (_0x45ecf3["error"] = _0x1cf6d5["message"]),
          parentPort["postMessage"](_0x45ecf3));
      } else {
        for (
          let _0x50d04f = _0x93045c[_0x2dc44f]["start"];
          _0x128a3d["AcYFa"](
            _0x50d04f,
            _0x128a3d["zNPpK"](
              _0x3c06c7[_0x226800]["start"],
              _0x5e125a[_0x4c8ca9]["length"],
            ),
          );
          _0x50d04f++
        ) {
          _0x3ab3f5[_0x50d04f]["ct"] = _0x2ca354;
        }
        _0x3ebded = !![];
      }
    }
  });
