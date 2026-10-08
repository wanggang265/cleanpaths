"use strict";
(() => {
  // node_modules/svg-path-properties/dist/svg-path-properties.esm.js
  function t(t3, n2, e2) {
    return n2 in t3 ? Object.defineProperty(t3, n2, { value: e2, enumerable: true, configurable: true, writable: true }) : t3[n2] = e2, t3;
  }
  function n(t3) {
    return (function(t4) {
      if (Array.isArray(t4)) return e(t4);
    })(t3) || (function(t4) {
      if ("undefined" != typeof Symbol && Symbol.iterator in Object(t4)) return Array.from(t4);
    })(t3) || (function(t4, n2) {
      if (!t4) return;
      if ("string" == typeof t4) return e(t4, n2);
      var i2 = Object.prototype.toString.call(t4).slice(8, -1);
      "Object" === i2 && t4.constructor && (i2 = t4.constructor.name);
      if ("Map" === i2 || "Set" === i2) return Array.from(t4);
      if ("Arguments" === i2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i2)) return e(t4, n2);
    })(t3) || (function() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    })();
  }
  function e(t3, n2) {
    (null == n2 || n2 > t3.length) && (n2 = t3.length);
    for (var e2 = 0, i2 = new Array(n2); e2 < n2; e2++) i2[e2] = t3[e2];
    return i2;
  }
  var i = { a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0 };
  var h = /([astvzqmhlc])([^astvzqmhlc]*)/gi;
  var r = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/gi;
  var s = function(t3) {
    var n2 = t3.match(r);
    return n2 ? n2.map(Number) : [];
  };
  var a = function(n2, e2, i2, h2) {
    var r2 = this;
    t(this, "x0", void 0), t(this, "x1", void 0), t(this, "y0", void 0), t(this, "y1", void 0), t(this, "getTotalLength", (function() {
      return Math.sqrt(Math.pow(r2.x0 - r2.x1, 2) + Math.pow(r2.y0 - r2.y1, 2));
    })), t(this, "getPointAtLength", (function(t3) {
      var n3 = t3 / Math.sqrt(Math.pow(r2.x0 - r2.x1, 2) + Math.pow(r2.y0 - r2.y1, 2));
      n3 = Number.isNaN(n3) ? 1 : n3;
      var e3 = (r2.x1 - r2.x0) * n3, i3 = (r2.y1 - r2.y0) * n3;
      return { x: r2.x0 + e3, y: r2.y0 + i3 };
    })), t(this, "getTangentAtLength", (function(t3) {
      var n3 = Math.sqrt((r2.x1 - r2.x0) * (r2.x1 - r2.x0) + (r2.y1 - r2.y0) * (r2.y1 - r2.y0));
      return { x: -(r2.x1 - r2.x0) / n3, y: -(r2.y1 - r2.y0) / n3 };
    })), t(this, "getPropertiesAtLength", (function(t3) {
      var n3 = r2.getPointAtLength(t3), e3 = r2.getTangentAtLength(t3);
      return { x: n3.x, y: n3.y, tangentX: e3.x, tangentY: e3.y };
    })), this.x0 = n2, this.x1 = e2, this.y0 = i2, this.y1 = h2;
  };
  var o = function(n2, e2, i2, h2, r2, s2, a2, o2, l2) {
    var c2 = this;
    t(this, "x0", void 0), t(this, "y0", void 0), t(this, "rx", void 0), t(this, "ry", void 0), t(this, "xAxisRotate", void 0), t(this, "LargeArcFlag", void 0), t(this, "SweepFlag", void 0), t(this, "x1", void 0), t(this, "y1", void 0), t(this, "length", void 0), t(this, "getTotalLength", (function() {
      return c2.length;
    })), t(this, "getPointAtLength", (function(t3) {
      t3 < 0 ? t3 = 0 : t3 > c2.length && (t3 = c2.length);
      var n3 = g({ x: c2.x0, y: c2.y0 }, c2.rx, c2.ry, c2.xAxisRotate, c2.LargeArcFlag, c2.SweepFlag, { x: c2.x1, y: c2.y1 }, t3 / c2.length);
      return { x: n3.x, y: n3.y };
    })), t(this, "getTangentAtLength", (function(t3) {
      t3 < 0 ? t3 = 0 : t3 > c2.length && (t3 = c2.length);
      var n3, e3 = 0.05, i3 = c2.getPointAtLength(t3);
      t3 < 0 ? t3 = 0 : t3 > c2.length && (t3 = c2.length);
      var h3 = (n3 = t3 < c2.length - e3 ? c2.getPointAtLength(t3 + e3) : c2.getPointAtLength(t3 - e3)).x - i3.x, r3 = n3.y - i3.y, s3 = Math.sqrt(h3 * h3 + r3 * r3);
      return t3 < c2.length - e3 ? { x: -h3 / s3, y: -r3 / s3 } : { x: h3 / s3, y: r3 / s3 };
    })), t(this, "getPropertiesAtLength", (function(t3) {
      var n3 = c2.getTangentAtLength(t3), e3 = c2.getPointAtLength(t3);
      return { x: e3.x, y: e3.y, tangentX: n3.x, tangentY: n3.y };
    })), this.x0 = n2, this.y0 = e2, this.rx = i2, this.ry = h2, this.xAxisRotate = r2, this.LargeArcFlag = s2, this.SweepFlag = a2, this.x1 = o2, this.y1 = l2;
    var f2 = u(300, (function(t3) {
      return g({ x: n2, y: e2 }, i2, h2, r2, s2, a2, { x: o2, y: l2 }, t3);
    }));
    this.length = f2.arcLength;
  };
  var g = function(t3, n2, e2, i2, h2, r2, s2, a2) {
    n2 = Math.abs(n2), e2 = Math.abs(e2), i2 = l(i2, 360);
    var o2 = c(i2);
    if (t3.x === s2.x && t3.y === s2.y) return { x: t3.x, y: t3.y, ellipticalArcAngle: 0 };
    if (0 === n2 || 0 === e2) return { x: 0, y: 0, ellipticalArcAngle: 0 };
    var g2 = (t3.x - s2.x) / 2, u2 = (t3.y - s2.y) / 2, f2 = { x: Math.cos(o2) * g2 + Math.sin(o2) * u2, y: -Math.sin(o2) * g2 + Math.cos(o2) * u2 }, y2 = Math.pow(f2.x, 2) / Math.pow(n2, 2) + Math.pow(f2.y, 2) / Math.pow(e2, 2);
    y2 > 1 && (n2 = Math.sqrt(y2) * n2, e2 = Math.sqrt(y2) * e2);
    var p2 = (Math.pow(n2, 2) * Math.pow(e2, 2) - Math.pow(n2, 2) * Math.pow(f2.y, 2) - Math.pow(e2, 2) * Math.pow(f2.x, 2)) / (Math.pow(n2, 2) * Math.pow(f2.y, 2) + Math.pow(e2, 2) * Math.pow(f2.x, 2));
    p2 = p2 < 0 ? 0 : p2;
    var v2 = (h2 !== r2 ? 1 : -1) * Math.sqrt(p2), M2 = v2 * (n2 * f2.y / e2), L2 = v2 * (-e2 * f2.x / n2), w2 = { x: Math.cos(o2) * M2 - Math.sin(o2) * L2 + (t3.x + s2.x) / 2, y: Math.sin(o2) * M2 + Math.cos(o2) * L2 + (t3.y + s2.y) / 2 }, A2 = { x: (f2.x - M2) / n2, y: (f2.y - L2) / e2 }, d2 = x({ x: 1, y: 0 }, A2), P2 = x(A2, { x: (-f2.x - M2) / n2, y: (-f2.y - L2) / e2 });
    !r2 && P2 > 0 ? P2 -= 2 * Math.PI : r2 && P2 < 0 && (P2 += 2 * Math.PI);
    var b2 = d2 + (P2 %= 2 * Math.PI) * a2, T2 = n2 * Math.cos(b2), m2 = e2 * Math.sin(b2);
    return { x: Math.cos(o2) * T2 - Math.sin(o2) * m2 + w2.x, y: Math.sin(o2) * T2 + Math.cos(o2) * m2 + w2.y, ellipticalArcStartAngle: d2, ellipticalArcEndAngle: d2 + P2, ellipticalArcAngle: b2, ellipticalArcCenter: w2, resultantRx: n2, resultantRy: e2 };
  };
  var u = function(t3, n2) {
    t3 = t3 || 500;
    for (var e2, i2 = 0, h2 = [], r2 = [], s2 = n2(0), a2 = 0; a2 < t3; a2++) {
      var o2 = y(a2 * (1 / t3), 0, 1);
      e2 = n2(o2), i2 += f(s2, e2), r2.push([s2, e2]), h2.push({ t: o2, arcLength: i2 }), s2 = e2;
    }
    return e2 = n2(1), r2.push([s2, e2]), i2 += f(s2, e2), h2.push({ t: 1, arcLength: i2 }), { arcLength: i2, arcLengthMap: h2, approximationLines: r2 };
  };
  var l = function(t3, n2) {
    return (t3 % n2 + n2) % n2;
  };
  var c = function(t3) {
    return t3 * (Math.PI / 180);
  };
  var f = function(t3, n2) {
    return Math.sqrt(Math.pow(n2.x - t3.x, 2) + Math.pow(n2.y - t3.y, 2));
  };
  var y = function(t3, n2, e2) {
    return Math.min(Math.max(t3, n2), e2);
  };
  var x = function(t3, n2) {
    var e2 = t3.x * n2.x + t3.y * n2.y, i2 = Math.sqrt((Math.pow(t3.x, 2) + Math.pow(t3.y, 2)) * (Math.pow(n2.x, 2) + Math.pow(n2.y, 2)));
    return (t3.x * n2.y - t3.y * n2.x < 0 ? -1 : 1) * Math.acos(e2 / i2);
  };
  var p = [[], [], [-0.5773502691896257, 0.5773502691896257], [0, -0.7745966692414834, 0.7745966692414834], [-0.33998104358485626, 0.33998104358485626, -0.8611363115940526, 0.8611363115940526], [0, -0.5384693101056831, 0.5384693101056831, -0.906179845938664, 0.906179845938664], [0.6612093864662645, -0.6612093864662645, -0.2386191860831969, 0.2386191860831969, -0.932469514203152, 0.932469514203152], [0, 0.4058451513773972, -0.4058451513773972, -0.7415311855993945, 0.7415311855993945, -0.9491079123427585, 0.9491079123427585], [-0.1834346424956498, 0.1834346424956498, -0.525532409916329, 0.525532409916329, -0.7966664774136267, 0.7966664774136267, -0.9602898564975363, 0.9602898564975363], [0, -0.8360311073266358, 0.8360311073266358, -0.9681602395076261, 0.9681602395076261, -0.3242534234038089, 0.3242534234038089, -0.6133714327005904, 0.6133714327005904], [-0.14887433898163122, 0.14887433898163122, -0.4333953941292472, 0.4333953941292472, -0.6794095682990244, 0.6794095682990244, -0.8650633666889845, 0.8650633666889845, -0.9739065285171717, 0.9739065285171717], [0, -0.26954315595234496, 0.26954315595234496, -0.5190961292068118, 0.5190961292068118, -0.7301520055740494, 0.7301520055740494, -0.8870625997680953, 0.8870625997680953, -0.978228658146057, 0.978228658146057], [-0.1252334085114689, 0.1252334085114689, -0.3678314989981802, 0.3678314989981802, -0.5873179542866175, 0.5873179542866175, -0.7699026741943047, 0.7699026741943047, -0.9041172563704749, 0.9041172563704749, -0.9815606342467192, 0.9815606342467192], [0, -0.2304583159551348, 0.2304583159551348, -0.44849275103644687, 0.44849275103644687, -0.6423493394403402, 0.6423493394403402, -0.8015780907333099, 0.8015780907333099, -0.9175983992229779, 0.9175983992229779, -0.9841830547185881, 0.9841830547185881], [-0.10805494870734367, 0.10805494870734367, -0.31911236892788974, 0.31911236892788974, -0.5152486363581541, 0.5152486363581541, -0.6872929048116855, 0.6872929048116855, -0.827201315069765, 0.827201315069765, -0.9284348836635735, 0.9284348836635735, -0.9862838086968123, 0.9862838086968123], [0, -0.20119409399743451, 0.20119409399743451, -0.3941513470775634, 0.3941513470775634, -0.5709721726085388, 0.5709721726085388, -0.7244177313601701, 0.7244177313601701, -0.8482065834104272, 0.8482065834104272, -0.937273392400706, 0.937273392400706, -0.9879925180204854, 0.9879925180204854], [-0.09501250983763744, 0.09501250983763744, -0.2816035507792589, 0.2816035507792589, -0.45801677765722737, 0.45801677765722737, -0.6178762444026438, 0.6178762444026438, -0.755404408355003, 0.755404408355003, -0.8656312023878318, 0.8656312023878318, -0.9445750230732326, 0.9445750230732326, -0.9894009349916499, 0.9894009349916499], [0, -0.17848418149584785, 0.17848418149584785, -0.3512317634538763, 0.3512317634538763, -0.5126905370864769, 0.5126905370864769, -0.6576711592166907, 0.6576711592166907, -0.7815140038968014, 0.7815140038968014, -0.8802391537269859, 0.8802391537269859, -0.9506755217687678, 0.9506755217687678, -0.9905754753144174, 0.9905754753144174], [-0.0847750130417353, 0.0847750130417353, -0.2518862256915055, 0.2518862256915055, -0.41175116146284263, 0.41175116146284263, -0.5597708310739475, 0.5597708310739475, -0.6916870430603532, 0.6916870430603532, -0.8037049589725231, 0.8037049589725231, -0.8926024664975557, 0.8926024664975557, -0.9558239495713977, 0.9558239495713977, -0.9915651684209309, 0.9915651684209309], [0, -0.16035864564022537, 0.16035864564022537, -0.31656409996362983, 0.31656409996362983, -0.46457074137596094, 0.46457074137596094, -0.600545304661681, 0.600545304661681, -0.7209661773352294, 0.7209661773352294, -0.8227146565371428, 0.8227146565371428, -0.9031559036148179, 0.9031559036148179, -0.96020815213483, 0.96020815213483, -0.9924068438435844, 0.9924068438435844], [-0.07652652113349734, 0.07652652113349734, -0.22778585114164507, 0.22778585114164507, -0.37370608871541955, 0.37370608871541955, -0.5108670019508271, 0.5108670019508271, -0.636053680726515, 0.636053680726515, -0.7463319064601508, 0.7463319064601508, -0.8391169718222188, 0.8391169718222188, -0.912234428251326, 0.912234428251326, -0.9639719272779138, 0.9639719272779138, -0.9931285991850949, 0.9931285991850949], [0, -0.1455618541608951, 0.1455618541608951, -0.2880213168024011, 0.2880213168024011, -0.4243421202074388, 0.4243421202074388, -0.5516188358872198, 0.5516188358872198, -0.6671388041974123, 0.6671388041974123, -0.7684399634756779, 0.7684399634756779, -0.8533633645833173, 0.8533633645833173, -0.9200993341504008, 0.9200993341504008, -0.9672268385663063, 0.9672268385663063, -0.9937521706203895, 0.9937521706203895], [-0.06973927331972223, 0.06973927331972223, -0.20786042668822127, 0.20786042668822127, -0.34193582089208424, 0.34193582089208424, -0.469355837986757, 0.469355837986757, -0.5876404035069116, 0.5876404035069116, -0.6944872631866827, 0.6944872631866827, -0.7878168059792081, 0.7878168059792081, -0.8658125777203002, 0.8658125777203002, -0.926956772187174, 0.926956772187174, -0.9700604978354287, 0.9700604978354287, -0.9942945854823992, 0.9942945854823992], [0, -0.1332568242984661, 0.1332568242984661, -0.26413568097034495, 0.26413568097034495, -0.3903010380302908, 0.3903010380302908, -0.5095014778460075, 0.5095014778460075, -0.6196098757636461, 0.6196098757636461, -0.7186613631319502, 0.7186613631319502, -0.8048884016188399, 0.8048884016188399, -0.8767523582704416, 0.8767523582704416, -0.9329710868260161, 0.9329710868260161, -0.9725424712181152, 0.9725424712181152, -0.9947693349975522, 0.9947693349975522], [-0.06405689286260563, 0.06405689286260563, -0.1911188674736163, 0.1911188674736163, -0.3150426796961634, 0.3150426796961634, -0.4337935076260451, 0.4337935076260451, -0.5454214713888396, 0.5454214713888396, -0.6480936519369755, 0.6480936519369755, -0.7401241915785544, 0.7401241915785544, -0.820001985973903, 0.820001985973903, -0.8864155270044011, 0.8864155270044011, -0.9382745520027328, 0.9382745520027328, -0.9747285559713095, 0.9747285559713095, -0.9951872199970213, 0.9951872199970213]];
  var v = [[], [], [1, 1], [0.8888888888888888, 0.5555555555555556, 0.5555555555555556], [0.6521451548625461, 0.6521451548625461, 0.34785484513745385, 0.34785484513745385], [0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908], [0.3607615730481386, 0.3607615730481386, 0.46791393457269104, 0.46791393457269104, 0.17132449237917036, 0.17132449237917036], [0.4179591836734694, 0.3818300505051189, 0.3818300505051189, 0.27970539148927664, 0.27970539148927664, 0.1294849661688697, 0.1294849661688697], [0.362683783378362, 0.362683783378362, 0.31370664587788727, 0.31370664587788727, 0.22238103445337448, 0.22238103445337448, 0.10122853629037626, 0.10122853629037626], [0.3302393550012598, 0.1806481606948574, 0.1806481606948574, 0.08127438836157441, 0.08127438836157441, 0.31234707704000286, 0.31234707704000286, 0.26061069640293544, 0.26061069640293544], [0.29552422471475287, 0.29552422471475287, 0.26926671930999635, 0.26926671930999635, 0.21908636251598204, 0.21908636251598204, 0.1494513491505806, 0.1494513491505806, 0.06667134430868814, 0.06667134430868814], [0.2729250867779006, 0.26280454451024665, 0.26280454451024665, 0.23319376459199048, 0.23319376459199048, 0.18629021092773426, 0.18629021092773426, 0.1255803694649046, 0.1255803694649046, 0.05566856711617366, 0.05566856711617366], [0.24914704581340277, 0.24914704581340277, 0.2334925365383548, 0.2334925365383548, 0.20316742672306592, 0.20316742672306592, 0.16007832854334622, 0.16007832854334622, 0.10693932599531843, 0.10693932599531843, 0.04717533638651183, 0.04717533638651183], [0.2325515532308739, 0.22628318026289723, 0.22628318026289723, 0.2078160475368885, 0.2078160475368885, 0.17814598076194574, 0.17814598076194574, 0.13887351021978725, 0.13887351021978725, 0.09212149983772845, 0.09212149983772845, 0.04048400476531588, 0.04048400476531588], [0.2152638534631578, 0.2152638534631578, 0.2051984637212956, 0.2051984637212956, 0.18553839747793782, 0.18553839747793782, 0.15720316715819355, 0.15720316715819355, 0.12151857068790319, 0.12151857068790319, 0.08015808715976021, 0.08015808715976021, 0.03511946033175186, 0.03511946033175186], [0.2025782419255613, 0.19843148532711158, 0.19843148532711158, 0.1861610000155622, 0.1861610000155622, 0.16626920581699392, 0.16626920581699392, 0.13957067792615432, 0.13957067792615432, 0.10715922046717194, 0.10715922046717194, 0.07036604748810812, 0.07036604748810812, 0.03075324199611727, 0.03075324199611727], [0.1894506104550685, 0.1894506104550685, 0.18260341504492358, 0.18260341504492358, 0.16915651939500254, 0.16915651939500254, 0.14959598881657674, 0.14959598881657674, 0.12462897125553388, 0.12462897125553388, 0.09515851168249279, 0.09515851168249279, 0.062253523938647894, 0.062253523938647894, 0.027152459411754096, 0.027152459411754096], [0.17944647035620653, 0.17656270536699264, 0.17656270536699264, 0.16800410215645004, 0.16800410215645004, 0.15404576107681028, 0.15404576107681028, 0.13513636846852548, 0.13513636846852548, 0.11188384719340397, 0.11188384719340397, 0.08503614831717918, 0.08503614831717918, 0.0554595293739872, 0.0554595293739872, 0.02414830286854793, 0.02414830286854793], [0.1691423829631436, 0.1691423829631436, 0.16427648374583273, 0.16427648374583273, 0.15468467512626524, 0.15468467512626524, 0.14064291467065065, 0.14064291467065065, 0.12255520671147846, 0.12255520671147846, 0.10094204410628717, 0.10094204410628717, 0.07642573025488905, 0.07642573025488905, 0.0497145488949698, 0.0497145488949698, 0.02161601352648331, 0.02161601352648331], [0.1610544498487837, 0.15896884339395434, 0.15896884339395434, 0.15276604206585967, 0.15276604206585967, 0.1426067021736066, 0.1426067021736066, 0.12875396253933621, 0.12875396253933621, 0.11156664554733399, 0.11156664554733399, 0.09149002162245, 0.09149002162245, 0.06904454273764123, 0.06904454273764123, 0.0448142267656996, 0.0448142267656996, 0.019461788229726478, 0.019461788229726478], [0.15275338713072584, 0.15275338713072584, 0.14917298647260374, 0.14917298647260374, 0.14209610931838204, 0.14209610931838204, 0.13168863844917664, 0.13168863844917664, 0.11819453196151841, 0.11819453196151841, 0.10193011981724044, 0.10193011981724044, 0.08327674157670475, 0.08327674157670475, 0.06267204833410907, 0.06267204833410907, 0.04060142980038694, 0.04060142980038694, 0.017614007139152118, 0.017614007139152118], [0.14608113364969041, 0.14452440398997005, 0.14452440398997005, 0.13988739479107315, 0.13988739479107315, 0.13226893863333747, 0.13226893863333747, 0.12183141605372853, 0.12183141605372853, 0.10879729916714838, 0.10879729916714838, 0.09344442345603386, 0.09344442345603386, 0.0761001136283793, 0.0761001136283793, 0.057134425426857205, 0.057134425426857205, 0.036953789770852494, 0.036953789770852494, 0.016017228257774335, 0.016017228257774335], [0.13925187285563198, 0.13925187285563198, 0.13654149834601517, 0.13654149834601517, 0.13117350478706238, 0.13117350478706238, 0.12325237681051242, 0.12325237681051242, 0.11293229608053922, 0.11293229608053922, 0.10041414444288096, 0.10041414444288096, 0.08594160621706773, 0.08594160621706773, 0.06979646842452049, 0.06979646842452049, 0.052293335152683286, 0.052293335152683286, 0.03377490158481415, 0.03377490158481415, 0.0146279952982722, 0.0146279952982722], [0.13365457218610619, 0.1324620394046966, 0.1324620394046966, 0.12890572218808216, 0.12890572218808216, 0.12304908430672953, 0.12304908430672953, 0.11499664022241136, 0.11499664022241136, 0.10489209146454141, 0.10489209146454141, 0.09291576606003515, 0.09291576606003515, 0.07928141177671895, 0.07928141177671895, 0.06423242140852585, 0.06423242140852585, 0.04803767173108467, 0.04803767173108467, 0.030988005856979445, 0.030988005856979445, 0.013411859487141771, 0.013411859487141771], [0.12793819534675216, 0.12793819534675216, 0.1258374563468283, 0.1258374563468283, 0.12167047292780339, 0.12167047292780339, 0.1155056680537256, 0.1155056680537256, 0.10744427011596563, 0.10744427011596563, 0.09761865210411388, 0.09761865210411388, 0.08619016153195327, 0.08619016153195327, 0.0733464814110803, 0.0733464814110803, 0.05929858491543678, 0.05929858491543678, 0.04427743881741981, 0.04427743881741981, 0.028531388628933663, 0.028531388628933663, 0.0123412297999872, 0.0123412297999872]];
  var M = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];
  var L = function(t3, n2, e2) {
    return { x: (1 - e2) * (1 - e2) * (1 - e2) * t3[0] + 3 * (1 - e2) * (1 - e2) * e2 * t3[1] + 3 * (1 - e2) * e2 * e2 * t3[2] + e2 * e2 * e2 * t3[3], y: (1 - e2) * (1 - e2) * (1 - e2) * n2[0] + 3 * (1 - e2) * (1 - e2) * e2 * n2[1] + 3 * (1 - e2) * e2 * e2 * n2[2] + e2 * e2 * e2 * n2[3] };
  };
  var w = function(t3, n2, e2) {
    return d([3 * (t3[1] - t3[0]), 3 * (t3[2] - t3[1]), 3 * (t3[3] - t3[2])], [3 * (n2[1] - n2[0]), 3 * (n2[2] - n2[1]), 3 * (n2[3] - n2[2])], e2);
  };
  var A = function(t3, n2, e2) {
    var i2, h2, r2;
    i2 = e2 / 2, h2 = 0;
    for (var s2 = 0; s2 < 20; s2++) r2 = i2 * p[20][s2] + i2, h2 += v[20][s2] * T(t3, n2, r2);
    return i2 * h2;
  };
  var d = function(t3, n2, e2) {
    return { x: (1 - e2) * (1 - e2) * t3[0] + 2 * (1 - e2) * e2 * t3[1] + e2 * e2 * t3[2], y: (1 - e2) * (1 - e2) * n2[0] + 2 * (1 - e2) * e2 * n2[1] + e2 * e2 * n2[2] };
  };
  var P = function(t3, n2, e2) {
    void 0 === e2 && (e2 = 1);
    var i2 = t3[0] - 2 * t3[1] + t3[2], h2 = n2[0] - 2 * n2[1] + n2[2], r2 = 2 * t3[1] - 2 * t3[0], s2 = 2 * n2[1] - 2 * n2[0], a2 = 4 * (i2 * i2 + h2 * h2), o2 = 4 * (i2 * r2 + h2 * s2), g2 = r2 * r2 + s2 * s2;
    if (0 === a2) return e2 * Math.sqrt(Math.pow(t3[2] - t3[0], 2) + Math.pow(n2[2] - n2[0], 2));
    var u2 = o2 / (2 * a2), l2 = e2 + u2, c2 = g2 / a2 - u2 * u2, f2 = l2 * l2 + c2 > 0 ? Math.sqrt(l2 * l2 + c2) : 0, y2 = u2 * u2 + c2 > 0 ? Math.sqrt(u2 * u2 + c2) : 0, x2 = u2 + Math.sqrt(u2 * u2 + c2) !== 0 ? c2 * Math.log(Math.abs((l2 + f2) / (u2 + y2))) : 0;
    return Math.sqrt(a2) / 2 * (l2 * f2 - u2 * y2 + x2);
  };
  var b = function(t3, n2, e2) {
    return { x: 2 * (1 - e2) * (t3[1] - t3[0]) + 2 * e2 * (t3[2] - t3[1]), y: 2 * (1 - e2) * (n2[1] - n2[0]) + 2 * e2 * (n2[2] - n2[1]) };
  };
  function T(t3, n2, e2) {
    var i2 = m(1, e2, t3), h2 = m(1, e2, n2), r2 = i2 * i2 + h2 * h2;
    return Math.sqrt(r2);
  }
  var m = function t2(n2, e2, i2) {
    var h2, r2, s2 = i2.length - 1;
    if (0 === s2) return 0;
    if (0 === n2) {
      r2 = 0;
      for (var a2 = 0; a2 <= s2; a2++) r2 += M[s2][a2] * Math.pow(1 - e2, s2 - a2) * Math.pow(e2, a2) * i2[a2];
      return r2;
    }
    h2 = new Array(s2);
    for (var o2 = 0; o2 < s2; o2++) h2[o2] = s2 * (i2[o2 + 1] - i2[o2]);
    return t2(n2 - 1, e2, h2);
  };
  var q = function(t3, n2, e2) {
    for (var i2 = 1, h2 = t3 / n2, r2 = (t3 - e2(h2)) / n2, s2 = 0; i2 > 1e-3; ) {
      var a2 = e2(h2 + r2), o2 = Math.abs(t3 - a2) / n2;
      if (o2 < i2) i2 = o2, h2 += r2;
      else {
        var g2 = e2(h2 - r2), u2 = Math.abs(t3 - g2) / n2;
        u2 < i2 ? (i2 = u2, h2 -= r2) : r2 /= 2;
      }
      if (++s2 > 500) break;
    }
    return h2;
  };
  var _ = function(n2, e2, i2, h2, r2, s2, a2, o2) {
    var g2 = this;
    t(this, "a", void 0), t(this, "b", void 0), t(this, "c", void 0), t(this, "d", void 0), t(this, "length", void 0), t(this, "getArcLength", void 0), t(this, "getPoint", void 0), t(this, "getDerivative", void 0), t(this, "getTotalLength", (function() {
      return g2.length;
    })), t(this, "getPointAtLength", (function(t3) {
      var n3 = [g2.a.x, g2.b.x, g2.c.x, g2.d.x], e3 = [g2.a.y, g2.b.y, g2.c.y, g2.d.y], i3 = q(t3, g2.length, (function(t4) {
        return g2.getArcLength(n3, e3, t4);
      }));
      return g2.getPoint(n3, e3, i3);
    })), t(this, "getTangentAtLength", (function(t3) {
      var n3 = [g2.a.x, g2.b.x, g2.c.x, g2.d.x], e3 = [g2.a.y, g2.b.y, g2.c.y, g2.d.y], i3 = q(t3, g2.length, (function(t4) {
        return g2.getArcLength(n3, e3, t4);
      })), h3 = g2.getDerivative(n3, e3, i3), r3 = Math.sqrt(h3.x * h3.x + h3.y * h3.y);
      return r3 > 0 ? { x: h3.x / r3, y: h3.y / r3 } : { x: 0, y: 0 };
    })), t(this, "getPropertiesAtLength", (function(t3) {
      var n3, e3 = [g2.a.x, g2.b.x, g2.c.x, g2.d.x], i3 = [g2.a.y, g2.b.y, g2.c.y, g2.d.y], h3 = q(t3, g2.length, (function(t4) {
        return g2.getArcLength(e3, i3, t4);
      })), r3 = g2.getDerivative(e3, i3, h3), s3 = Math.sqrt(r3.x * r3.x + r3.y * r3.y);
      n3 = s3 > 0 ? { x: r3.x / s3, y: r3.y / s3 } : { x: 0, y: 0 };
      var a3 = g2.getPoint(e3, i3, h3);
      return { x: a3.x, y: a3.y, tangentX: n3.x, tangentY: n3.y };
    })), t(this, "getC", (function() {
      return g2.c;
    })), t(this, "getD", (function() {
      return g2.d;
    })), this.a = { x: n2, y: e2 }, this.b = { x: i2, y: h2 }, this.c = { x: r2, y: s2 }, void 0 !== a2 && void 0 !== o2 ? (this.getArcLength = A, this.getPoint = L, this.getDerivative = w, this.d = { x: a2, y: o2 }) : (this.getArcLength = P, this.getPoint = d, this.getDerivative = b, this.d = { x: 0, y: 0 }), this.length = this.getArcLength([this.a.x, this.b.x, this.c.x, this.d.x], [this.a.y, this.b.y, this.c.y, this.d.y], 1);
  };
  var S = function(e2) {
    var r2 = this;
    t(this, "length", 0), t(this, "partial_lengths", []), t(this, "functions", []), t(this, "initial_point", null), t(this, "getPartAtLength", (function(t3) {
      t3 < 0 ? t3 = 0 : t3 > r2.length && (t3 = r2.length);
      for (var n2 = r2.partial_lengths.length - 1; r2.partial_lengths[n2] >= t3 && n2 > 0; ) n2--;
      return n2++, { fraction: t3 - r2.partial_lengths[n2 - 1], i: n2 };
    })), t(this, "getTotalLength", (function() {
      return r2.length;
    })), t(this, "getPointAtLength", (function(t3) {
      var n2 = r2.getPartAtLength(t3), e3 = r2.functions[n2.i];
      if (e3) return e3.getPointAtLength(n2.fraction);
      if (r2.initial_point) return r2.initial_point;
      throw new Error("Wrong function at this part.");
    })), t(this, "getTangentAtLength", (function(t3) {
      var n2 = r2.getPartAtLength(t3), e3 = r2.functions[n2.i];
      if (e3) return e3.getTangentAtLength(n2.fraction);
      if (r2.initial_point) return { x: 0, y: 0 };
      throw new Error("Wrong function at this part.");
    })), t(this, "getPropertiesAtLength", (function(t3) {
      var n2 = r2.getPartAtLength(t3), e3 = r2.functions[n2.i];
      if (e3) return e3.getPropertiesAtLength(n2.fraction);
      if (r2.initial_point) return { x: r2.initial_point.x, y: r2.initial_point.y, tangentX: 0, tangentY: 0 };
      throw new Error("Wrong function at this part.");
    })), t(this, "getParts", (function() {
      for (var t3 = [], n2 = 0; n2 < r2.functions.length; n2++) if (null !== r2.functions[n2]) {
        r2.functions[n2] = r2.functions[n2];
        var e3 = { start: r2.functions[n2].getPointAtLength(0), end: r2.functions[n2].getPointAtLength(r2.partial_lengths[n2] - r2.partial_lengths[n2 - 1]), length: r2.partial_lengths[n2] - r2.partial_lengths[n2 - 1], getPointAtLength: r2.functions[n2].getPointAtLength, getTangentAtLength: r2.functions[n2].getTangentAtLength, getPropertiesAtLength: r2.functions[n2].getPropertiesAtLength };
        t3.push(e3);
      }
      return t3;
    }));
    for (var g2, u2 = Array.isArray(e2) ? e2 : (function(t3) {
      var e3 = (t3 && t3.length > 0 ? t3 : "M0,0").match(h);
      if (!e3) throw new Error("No path elements found in string ".concat(t3));
      return e3.reduce((function(t4, e4) {
        var h2 = e4.charAt(0), r3 = h2.toLowerCase(), a2 = s(e4.substr(1));
        for ("m" === r3 && a2.length > 2 && (t4.push([h2].concat(n(a2.splice(0, 2)))), r3 = "l", h2 = "m" === h2 ? "l" : "L"); a2.length >= 0; ) {
          if (a2.length === i[r3]) {
            t4.push([h2].concat(n(a2.splice(0, i[r3]))));
            break;
          }
          if (a2.length < i[r3]) throw new Error('Malformed path data: "'.concat(h2, '" must have ').concat(i[r3], " elements and has ").concat(a2.length, ": ").concat(e4));
          t4.push([h2].concat(n(a2.splice(0, i[r3]))));
        }
        return t4;
      }), []);
    })(e2), l2 = [0, 0], c2 = [0, 0], f2 = [0, 0], y2 = 0; y2 < u2.length; y2++) {
      if ("M" === u2[y2][0]) f2 = [(l2 = [u2[y2][1], u2[y2][2]])[0], l2[1]], this.functions.push(null), 0 === y2 && (this.initial_point = { x: u2[y2][1], y: u2[y2][2] });
      else if ("m" === u2[y2][0]) f2 = [(l2 = [u2[y2][1] + l2[0], u2[y2][2] + l2[1]])[0], l2[1]], this.functions.push(null);
      else if ("L" === u2[y2][0]) this.length += Math.sqrt(Math.pow(l2[0] - u2[y2][1], 2) + Math.pow(l2[1] - u2[y2][2], 2)), this.functions.push(new a(l2[0], u2[y2][1], l2[1], u2[y2][2])), l2 = [u2[y2][1], u2[y2][2]];
      else if ("l" === u2[y2][0]) this.length += Math.sqrt(Math.pow(u2[y2][1], 2) + Math.pow(u2[y2][2], 2)), this.functions.push(new a(l2[0], u2[y2][1] + l2[0], l2[1], u2[y2][2] + l2[1])), l2 = [u2[y2][1] + l2[0], u2[y2][2] + l2[1]];
      else if ("H" === u2[y2][0]) this.length += Math.abs(l2[0] - u2[y2][1]), this.functions.push(new a(l2[0], u2[y2][1], l2[1], l2[1])), l2[0] = u2[y2][1];
      else if ("h" === u2[y2][0]) this.length += Math.abs(u2[y2][1]), this.functions.push(new a(l2[0], l2[0] + u2[y2][1], l2[1], l2[1])), l2[0] = u2[y2][1] + l2[0];
      else if ("V" === u2[y2][0]) this.length += Math.abs(l2[1] - u2[y2][1]), this.functions.push(new a(l2[0], l2[0], l2[1], u2[y2][1])), l2[1] = u2[y2][1];
      else if ("v" === u2[y2][0]) this.length += Math.abs(u2[y2][1]), this.functions.push(new a(l2[0], l2[0], l2[1], l2[1] + u2[y2][1])), l2[1] = u2[y2][1] + l2[1];
      else if ("z" === u2[y2][0] || "Z" === u2[y2][0]) this.length += Math.sqrt(Math.pow(f2[0] - l2[0], 2) + Math.pow(f2[1] - l2[1], 2)), this.functions.push(new a(l2[0], f2[0], l2[1], f2[1])), l2 = [f2[0], f2[1]];
      else if ("C" === u2[y2][0]) g2 = new _(l2[0], l2[1], u2[y2][1], u2[y2][2], u2[y2][3], u2[y2][4], u2[y2][5], u2[y2][6]), this.length += g2.getTotalLength(), l2 = [u2[y2][5], u2[y2][6]], this.functions.push(g2);
      else if ("c" === u2[y2][0]) (g2 = new _(l2[0], l2[1], l2[0] + u2[y2][1], l2[1] + u2[y2][2], l2[0] + u2[y2][3], l2[1] + u2[y2][4], l2[0] + u2[y2][5], l2[1] + u2[y2][6])).getTotalLength() > 0 ? (this.length += g2.getTotalLength(), this.functions.push(g2), l2 = [u2[y2][5] + l2[0], u2[y2][6] + l2[1]]) : this.functions.push(new a(l2[0], l2[0], l2[1], l2[1]));
      else if ("S" === u2[y2][0]) {
        if (y2 > 0 && ["C", "c", "S", "s"].indexOf(u2[y2 - 1][0]) > -1) {
          if (g2) {
            var x2 = g2.getC();
            g2 = new _(l2[0], l2[1], 2 * l2[0] - x2.x, 2 * l2[1] - x2.y, u2[y2][1], u2[y2][2], u2[y2][3], u2[y2][4]);
          }
        } else g2 = new _(l2[0], l2[1], l2[0], l2[1], u2[y2][1], u2[y2][2], u2[y2][3], u2[y2][4]);
        g2 && (this.length += g2.getTotalLength(), l2 = [u2[y2][3], u2[y2][4]], this.functions.push(g2));
      } else if ("s" === u2[y2][0]) {
        if (y2 > 0 && ["C", "c", "S", "s"].indexOf(u2[y2 - 1][0]) > -1) {
          if (g2) {
            var p2 = g2.getC(), v2 = g2.getD();
            g2 = new _(l2[0], l2[1], l2[0] + v2.x - p2.x, l2[1] + v2.y - p2.y, l2[0] + u2[y2][1], l2[1] + u2[y2][2], l2[0] + u2[y2][3], l2[1] + u2[y2][4]);
          }
        } else g2 = new _(l2[0], l2[1], l2[0], l2[1], l2[0] + u2[y2][1], l2[1] + u2[y2][2], l2[0] + u2[y2][3], l2[1] + u2[y2][4]);
        g2 && (this.length += g2.getTotalLength(), l2 = [u2[y2][3] + l2[0], u2[y2][4] + l2[1]], this.functions.push(g2));
      } else if ("Q" === u2[y2][0]) {
        if (l2[0] == u2[y2][1] && l2[1] == u2[y2][2]) {
          var M2 = new a(u2[y2][1], u2[y2][3], u2[y2][2], u2[y2][4]);
          this.length += M2.getTotalLength(), this.functions.push(M2);
        } else g2 = new _(l2[0], l2[1], u2[y2][1], u2[y2][2], u2[y2][3], u2[y2][4], void 0, void 0), this.length += g2.getTotalLength(), this.functions.push(g2);
        l2 = [u2[y2][3], u2[y2][4]], c2 = [u2[y2][1], u2[y2][2]];
      } else if ("q" === u2[y2][0]) {
        if (0 != u2[y2][1] || 0 != u2[y2][2]) g2 = new _(l2[0], l2[1], l2[0] + u2[y2][1], l2[1] + u2[y2][2], l2[0] + u2[y2][3], l2[1] + u2[y2][4], void 0, void 0), this.length += g2.getTotalLength(), this.functions.push(g2);
        else {
          var L2 = new a(l2[0] + u2[y2][1], l2[0] + u2[y2][3], l2[1] + u2[y2][2], l2[1] + u2[y2][4]);
          this.length += L2.getTotalLength(), this.functions.push(L2);
        }
        c2 = [l2[0] + u2[y2][1], l2[1] + u2[y2][2]], l2 = [u2[y2][3] + l2[0], u2[y2][4] + l2[1]];
      } else if ("T" === u2[y2][0]) {
        if (y2 > 0 && ["Q", "q", "T", "t"].indexOf(u2[y2 - 1][0]) > -1) g2 = new _(l2[0], l2[1], 2 * l2[0] - c2[0], 2 * l2[1] - c2[1], u2[y2][1], u2[y2][2], void 0, void 0), this.functions.push(g2), this.length += g2.getTotalLength();
        else {
          var w2 = new a(l2[0], u2[y2][1], l2[1], u2[y2][2]);
          this.functions.push(w2), this.length += w2.getTotalLength();
        }
        c2 = [2 * l2[0] - c2[0], 2 * l2[1] - c2[1]], l2 = [u2[y2][1], u2[y2][2]];
      } else if ("t" === u2[y2][0]) {
        if (y2 > 0 && ["Q", "q", "T", "t"].indexOf(u2[y2 - 1][0]) > -1) g2 = new _(l2[0], l2[1], 2 * l2[0] - c2[0], 2 * l2[1] - c2[1], l2[0] + u2[y2][1], l2[1] + u2[y2][2], void 0, void 0), this.length += g2.getTotalLength(), this.functions.push(g2);
        else {
          var A2 = new a(l2[0], l2[0] + u2[y2][1], l2[1], l2[1] + u2[y2][2]);
          this.length += A2.getTotalLength(), this.functions.push(A2);
        }
        c2 = [2 * l2[0] - c2[0], 2 * l2[1] - c2[1]], l2 = [u2[y2][1] + l2[0], u2[y2][2] + l2[1]];
      } else if ("A" === u2[y2][0]) {
        var d2 = new o(l2[0], l2[1], u2[y2][1], u2[y2][2], u2[y2][3], 1 === u2[y2][4], 1 === u2[y2][5], u2[y2][6], u2[y2][7]);
        this.length += d2.getTotalLength(), l2 = [u2[y2][6], u2[y2][7]], this.functions.push(d2);
      } else if ("a" === u2[y2][0]) {
        var P2 = new o(l2[0], l2[1], u2[y2][1], u2[y2][2], u2[y2][3], 1 === u2[y2][4], 1 === u2[y2][5], l2[0] + u2[y2][6], l2[1] + u2[y2][7]);
        this.length += P2.getTotalLength(), l2 = [l2[0] + u2[y2][6], l2[1] + u2[y2][7]], this.functions.push(P2);
      }
      this.partial_lengths.push(this.length);
    }
  };
  var C = function(n2) {
    var e2 = this;
    if (t(this, "inst", void 0), t(this, "getTotalLength", (function() {
      return e2.inst.getTotalLength();
    })), t(this, "getPointAtLength", (function(t3) {
      return e2.inst.getPointAtLength(t3);
    })), t(this, "getTangentAtLength", (function(t3) {
      return e2.inst.getTangentAtLength(t3);
    })), t(this, "getPropertiesAtLength", (function(t3) {
      return e2.inst.getPropertiesAtLength(t3);
    })), t(this, "getParts", (function() {
      return e2.inst.getParts();
    })), this.inst = new S(n2), !(this instanceof C)) return new C(n2);
  };

  // src/lib/svg-flatten-core.ts
  function decodeEntities(s2) {
    return s2.replace(/&#x([0-9a-f]+);/gi, (_2, h2) => String.fromCodePoint(parseInt(h2, 16))).replace(/&#(\d+);/g, (_2, d2) => String.fromCodePoint(parseInt(d2, 10))).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  }
  function parseSvgXml(src) {
    let i2 = 0;
    const n2 = src.length;
    const root = { tag: "#root", attrs: {}, children: [] };
    const stack = [root];
    while (i2 < n2) {
      const lt = src.indexOf("<", i2);
      if (lt === -1) break;
      if (src.startsWith("<!--", lt)) {
        const end = src.indexOf("-->", lt + 4);
        i2 = end === -1 ? n2 : end + 3;
        continue;
      }
      if (src.startsWith("<![CDATA[", lt)) {
        const end = src.indexOf("]]>", lt + 9);
        i2 = end === -1 ? n2 : end + 3;
        continue;
      }
      if (src.startsWith("<?", lt)) {
        const end = src.indexOf("?>", lt + 2);
        i2 = end === -1 ? n2 : end + 2;
        continue;
      }
      if (src.startsWith("<!", lt)) {
        const end = src.indexOf(">", lt + 2);
        i2 = end === -1 ? n2 : end + 1;
        continue;
      }
      if (src.startsWith("</", lt)) {
        const end = src.indexOf(">", lt + 2);
        const name2 = src.slice(lt + 2, end === -1 ? n2 : end).trim().toLowerCase().split(":").pop();
        for (let k = stack.length - 1; k >= 1; k--) {
          if (stack[k].tag === name2) {
            stack.length = k;
            break;
          }
        }
        i2 = end === -1 ? n2 : end + 1;
        continue;
      }
      let j = lt + 1;
      let name = "";
      while (j < n2 && !/[\s/>]/.test(src[j])) name += src[j++];
      const attrs = {};
      let selfClose = false;
      while (j < n2) {
        while (j < n2 && /\s/.test(src[j])) j++;
        if (src[j] === ">") {
          j++;
          break;
        }
        if (src[j] === "/" && src[j + 1] === ">") {
          selfClose = true;
          j += 2;
          break;
        }
        if (j >= n2) break;
        let aname = "";
        while (j < n2 && !/[\s=/>]/.test(src[j])) aname += src[j++];
        if (!aname) {
          j++;
          continue;
        }
        while (j < n2 && /\s/.test(src[j])) j++;
        let aval = "";
        if (src[j] === "=") {
          j++;
          while (j < n2 && /\s/.test(src[j])) j++;
          const q2 = src[j];
          if (q2 === '"' || q2 === "'") {
            const end = src.indexOf(q2, j + 1);
            aval = src.slice(j + 1, end === -1 ? n2 : end);
            j = end === -1 ? n2 : end + 1;
          } else {
            const start = j;
            while (j < n2 && !/[\s>]/.test(src[j])) j++;
            aval = src.slice(start, j);
          }
        }
        if (aname) attrs[aname.toLowerCase()] = decodeEntities(aval);
      }
      const el = {
        tag: name.toLowerCase().split(":").pop(),
        attrs,
        children: []
      };
      stack[stack.length - 1].children.push(el);
      if (!selfClose) stack.push(el);
      i2 = j;
    }
    return root.children.find((c2) => c2.tag === "svg") ?? root.children[0] ?? null;
  }
  function rgbToHex(color) {
    const m2 = color.match(/rgba?\(([^)]+)\)/i);
    if (!m2) {
      if (/^#[0-9a-f]{6}$/i.test(color)) return color.slice(1).toLowerCase();
      if (/^#[0-9a-f]{3}$/i.test(color))
        return color.slice(1).split("").map((c2) => c2 + c2).join("").toLowerCase();
      return null;
    }
    const parts = m2[1].split(",").map((s2) => parseFloat(s2));
    if (parts.length >= 4 && parts[3] === 0) return null;
    const [r2, g2, b2] = parts;
    const h2 = (x2) => Math.max(0, Math.min(255, Math.round(x2))).toString(16).padStart(2, "0");
    return `${h2(r2)}${h2(g2)}${h2(b2)}`;
  }
  function isBackground(hex) {
    const r2 = parseInt(hex.slice(0, 2), 16);
    const g2 = parseInt(hex.slice(2, 4), 16);
    const b2 = parseInt(hex.slice(4, 6), 16);
    return r2 > 242 && g2 > 242 && b2 > 242;
  }
  var IDENTITY = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  function mulMat(m1, m2) {
    return {
      a: m1.a * m2.a + m1.c * m2.b,
      b: m1.b * m2.a + m1.d * m2.b,
      c: m1.a * m2.c + m1.c * m2.d,
      d: m1.b * m2.c + m1.d * m2.d,
      e: m1.a * m2.e + m1.c * m2.f + m1.e,
      f: m1.b * m2.e + m1.d * m2.f + m1.f
    };
  }
  function applyMat(p2, m2) {
    return { x: m2.a * p2.x + m2.c * p2.y + m2.e, y: m2.b * p2.x + m2.d * p2.y + m2.f };
  }
  var DEG = Math.PI / 180;
  function parseTransform(s2) {
    let acc = IDENTITY;
    const re = /(matrix|translate|scale|rotate|skewx|skewy)\s*\(([^)]*)\)/gi;
    let m2;
    while (m2 = re.exec(s2)) {
      const v2 = m2[2].trim().split(/[\s,]+/).map(parseFloat).filter((x2) => isFinite(x2));
      let t3 = IDENTITY;
      switch (m2[1].toLowerCase()) {
        case "matrix":
          if (v2.length === 6) t3 = { a: v2[0], b: v2[1], c: v2[2], d: v2[3], e: v2[4], f: v2[5] };
          break;
        case "translate":
          t3 = { a: 1, b: 0, c: 0, d: 1, e: v2[0] ?? 0, f: v2[1] ?? 0 };
          break;
        case "scale": {
          const sx = v2[0] ?? 1;
          const sy = v2.length > 1 ? v2[1] : sx;
          t3 = { a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 };
          break;
        }
        case "rotate": {
          const cos = Math.cos((v2[0] ?? 0) * DEG);
          const sin = Math.sin((v2[0] ?? 0) * DEG);
          const r2 = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
          if (v2.length >= 3) {
            const [cx, cy] = [v2[1], v2[2]];
            t3 = mulMat(mulMat({ a: 1, b: 0, c: 0, d: 1, e: cx, f: cy }, r2), {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: -cx,
              f: -cy
            });
          } else t3 = r2;
          break;
        }
        case "skewx":
          t3 = { a: 1, b: 0, c: Math.tan((v2[0] ?? 0) * DEG), d: 1, e: 0, f: 0 };
          break;
        case "skewy":
          t3 = { a: 1, b: 0, c: 0, d: Math.tan((v2[0] ?? 0) * DEG), e: 0, f: 0 };
          break;
      }
      acc = mulMat(acc, t3);
    }
    return acc;
  }
  var SAMPLE_HARD_CAP = 4e3;
  var CHORD_TOL = 0.25;
  var MIN_SPAN = 0.12;
  var SEED_CAP = 256;
  function distPtToSeg(p2, a2, b2) {
    const dx = b2.x - a2.x;
    const dy = b2.y - a2.y;
    const l2 = dx * dx + dy * dy;
    let t3 = l2 === 0 ? 0 : ((p2.x - a2.x) * dx + (p2.y - a2.y) * dy) / l2;
    t3 = Math.max(0, Math.min(1, t3));
    return Math.hypot(p2.x - (a2.x + t3 * dx), p2.y - (a2.y + t3 * dy));
  }
  var PROBES = [0.25, 0.5, 0.75];
  function samplePath(props, ctm, step) {
    const total = props.getTotalLength();
    if (!isFinite(total) || total <= 0) return [];
    const n2 = Math.max(8, Math.min(SEED_CAP, Math.ceil(total / step)));
    let lens = [];
    let raw = [];
    for (let i2 = 0; i2 <= n2; i2++) {
      lens.push(i2 / n2 * total);
      raw.push(props.getPointAtLength(lens[i2]));
    }
    for (let pass = 0; pass < 16; pass++) {
      const nextLens = [lens[0]];
      const nextRaw = [raw[0]];
      let splits = 0;
      for (let i2 = 0; i2 < lens.length - 1; i2++) {
        const span = lens[i2 + 1] - lens[i2];
        if (span > MIN_SPAN && nextLens.length + (lens.length - i2) < SAMPLE_HARD_CAP) {
          let worstLen = -1;
          let worstPt = null;
          let worstDev = CHORD_TOL;
          for (const f2 of PROBES) {
            const l2 = lens[i2] + span * f2;
            const p2 = props.getPointAtLength(l2);
            const dev = distPtToSeg(p2, raw[i2], raw[i2 + 1]);
            if (dev > worstDev) {
              worstDev = dev;
              worstLen = l2;
              worstPt = p2;
            }
          }
          if (worstPt) {
            nextLens.push(worstLen);
            nextRaw.push(worstPt);
            splits += 1;
          }
        }
        nextLens.push(lens[i2 + 1]);
        nextRaw.push(raw[i2 + 1]);
      }
      lens = nextLens;
      raw = nextRaw;
      if (splits === 0) break;
    }
    const pts = raw.map((p2) => applyMat(p2, ctm));
    if (pts.length > 1) {
      const a2 = pts[0];
      const b2 = pts[pts.length - 1];
      if (Math.hypot(a2.x - b2.x, a2.y - b2.y) < 1e-4) pts.pop();
    }
    return pts.length >= 2 ? [pts] : [];
  }
  function primitiveToPoints(el, ctm) {
    const num = (name, def = 0) => {
      const v2 = el.attrs[name];
      const x2 = v2 === void 0 ? NaN : parseFloat(v2);
      return isFinite(x2) ? x2 : def;
    };
    let pts = [];
    if (el.tag === "rect") {
      const x2 = num("x"), y2 = num("y"), w2 = num("width"), h2 = num("height");
      pts = [
        { x: x2, y: y2 },
        { x: x2 + w2, y: y2 },
        { x: x2 + w2, y: y2 + h2 },
        { x: x2, y: y2 + h2 }
      ];
    } else if (el.tag === "line") {
      pts = [
        { x: num("x1"), y: num("y1") },
        { x: num("x2"), y: num("y2") }
      ];
    } else if (el.tag === "circle" || el.tag === "ellipse") {
      const cx = num("cx"), cy = num("cy");
      const rx = el.tag === "circle" ? num("r") : num("rx");
      const ry = el.tag === "circle" ? num("r") : num("ry");
      const seg = Math.max(24, Math.min(128, Math.ceil(Math.max(rx, ry) * Math.PI * 2 / 1.5)));
      for (let i2 = 0; i2 < seg; i2++) {
        const t3 = i2 / seg * Math.PI * 2;
        pts.push({ x: cx + rx * Math.cos(t3), y: cy + ry * Math.sin(t3) });
      }
    } else if (el.tag === "polyline" || el.tag === "polygon") {
      const rawPts = (el.attrs["points"] || "").trim();
      const nums = rawPts.split(/[\s,]+/).map(parseFloat).filter(isFinite);
      for (let i2 = 0; i2 + 1 < nums.length; i2 += 2) pts.push({ x: nums[i2], y: nums[i2 + 1] });
    } else {
      return [];
    }
    if (pts.length < 2) return [];
    return [pts.map((p2) => applyMat(p2, ctm))];
  }
  var SHAPE_TAGS = /* @__PURE__ */ new Set(["path", "rect", "circle", "ellipse", "line", "polyline", "polygon"]);
  function paintOf(el) {
    let styleFill = "";
    let styleStroke = "";
    const style = el.attrs["style"];
    if (style) {
      for (const decl of style.split(";")) {
        const ci = decl.indexOf(":");
        if (ci === -1) continue;
        const k = decl.slice(0, ci).trim().toLowerCase();
        const v2 = decl.slice(ci + 1).trim();
        if (k === "fill") styleFill = v2;
        else if (k === "stroke") styleStroke = v2;
      }
    }
    return {
      fill: rgbToHex(el.attrs["fill"] || styleFill || ""),
      stroke: rgbToHex(el.attrs["stroke"] || styleStroke || "")
    };
  }
  function flattenSvgCore(svgText, opts = {}) {
    const step = opts.step ?? 0.8;
    const srcSvg = parseSvgXml(svgText);
    if (!srcSvg || srcSvg.tag !== "svg") throw new Error("not an SVG document");
    const found = [];
    const walk = (el, parent) => {
      const local = el.attrs["transform"] ? parseTransform(el.attrs["transform"]) : null;
      const ctm = local ? mulMat(parent, local) : parent;
      if (SHAPE_TAGS.has(el.tag)) found.push({ el, ctm });
      for (const c2 of el.children) walk(c2, ctm);
    };
    walk(srcSvg, IDENTITY);
    const byColor = /* @__PURE__ */ new Map();
    const total = found.length;
    for (let i2 = 0; i2 < total; i2++) {
      const { el, ctm } = found[i2];
      const { fill, stroke } = paintOf(el);
      const hex = fill ?? stroke;
      if (!hex) continue;
      if (opts.dropBackground !== false && fill && isBackground(fill)) continue;
      let loops = [];
      if (el.tag === "path") {
        const d2 = el.attrs["d"];
        if (d2) {
          try {
            loops = samplePath(new C(d2), ctm, step);
          } catch {
            loops = [];
          }
        }
      } else {
        loops = primitiveToPoints(el, ctm);
      }
      if (loops.length === 0) continue;
      const arr = byColor.get(hex) ?? [];
      arr.push(...loops);
      byColor.set(hex, arr);
      if (opts.onProgress && (i2 & 15) === 0) opts.onProgress(i2 + 1, total);
    }
    if (opts.onProgress) opts.onProgress(total, total);
    return Array.from(byColor.entries()).map(([hex, paths]) => ({ hex, paths }));
  }

  // src/workers/flatten-worker.ts
  var ctx = self;
  ctx.onmessage = (e2) => {
    const { id, action, text, opts } = e2.data;
    if (action !== "flatten") {
      ctx.postMessage({ id, ok: false, error: `unknown action: ${action}` });
      return;
    }
    try {
      let lastPost = 0;
      const layers = flattenSvgCore(text, {
        step: opts?.step,
        dropBackground: opts?.dropBackground,
        onProgress: (done, total) => {
          const now = Date.now();
          if (now - lastPost > 120 || done === total) {
            lastPost = now;
            ctx.postMessage({ id, progress: total === 0 ? 1 : done / total });
          }
        }
      });
      let totalPts = 0;
      for (const l2 of layers) for (const p2 of l2.paths) totalPts += p2.length;
      const coords = new Float32Array(totalPts * 2);
      const meta = [];
      let off = 0;
      for (const l2 of layers) {
        const spans = [];
        for (const p2 of l2.paths) {
          spans.push([off, p2.length]);
          for (let k = 0; k < p2.length; k++) {
            coords[off * 2 + k * 2] = p2[k].x;
            coords[off * 2 + k * 2 + 1] = p2[k].y;
          }
          off += p2.length;
        }
        meta.push({ hex: l2.hex, spans });
      }
      ctx.postMessage({ id, ok: true, meta, coords }, [coords.buffer]);
    } catch (err) {
      ctx.postMessage({ id, ok: false, error: String(err?.message || err) });
    }
  };
})();
