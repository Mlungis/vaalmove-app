import React from 'react';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Path, Circle, Line, Ellipse } from 'react-native-svg';

export default function CarIllustration({ width = 310, height = 182 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 340 200">
      <Defs>
        <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#EAFBFF" />
          <Stop offset="45%" stopColor="#8EF0FF" />
          <Stop offset="100%" stopColor="#1FA9E8" />
        </LinearGradient>
        <LinearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#CDEFFB" />
        </LinearGradient>
        <RadialGradient id="wheelGrad" cx="35%" cy="35%" r="70%">
          <Stop offset="0%" stopColor="#5B6B7C" />
          <Stop offset="100%" stopColor="#151E29" />
        </RadialGradient>
      </Defs>

      <Ellipse cx={175} cy={176} rx={130} ry={12} fill="#0A2646" opacity={0.28} />

      <Line x1={6} y1={86} x2={46} y2={86} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.55} />
      <Line x1={0} y1={104} x2={34} y2={104} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.55} />
      <Line x1={10} y1={122} x2={40} y2={122} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.55} />

      <Path
        d="M30 150 C24 150 20 146 20 140 L20 130 C20 118 29 108 41 106 L58 103
           C72 78 100 55 138 48 C160 44 182 44 202 50 C222 56 238 68 248 84
           L262 86 C284 88 302 100 308 118 L310 130 C311 140 304 148 294 149
           L282 150 L268 150 C268 130 253 115 233 115 C213 115 198 130 198 150
           L128 150 C128 130 113 115 93 115 C73 115 58 130 58 150 Z"
        fill="url(#bodyGrad)"
        stroke="#0E2340"
        strokeWidth={4}
        strokeLinejoin="round"
      />

      <Path
        d="M58 138 C64 133 72 130 80 130 L246 130 C254 130 262 133 268 138 L268 148
           C262 145 255 143 246 143 L80 143 C71 143 64 145 58 148 Z"
        fill="#0E7FC2"
        opacity={0.35}
      />

      <Path
        d="M78 100 C96 74 122 58 150 52 C170 48 190 49 206 55"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.55}
      />

      <Path
        d="M92 100 C104 78 124 62 148 56 C160 53 172 53 182 57 L188 90 C188 96 184 100 178 100 Z"
        fill="url(#glassGrad)"
        stroke="#0E2340"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path d="M100 92 C110 76 124 64 140 58" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.75} fill="none" />

      <Path
        d="M196 58 C214 62 228 72 238 86 L246 96 L200 96 L196 58 Z"
        fill="url(#glassGrad)"
        stroke="#0E2340"
        strokeWidth={3}
        strokeLinejoin="round"
      />

      <Line x1={192} y1={56} x2={192} y2={150} stroke="#0E2340" strokeWidth={2} opacity={0.35} />

      <Path
        d="M292 96 C300 96 305 101 305 108 C305 114 300 118 293 117 L280 114 L282 98 Z"
        fill="#FFF3B0"
        stroke="#0E2340"
        strokeWidth={2.5}
      />
      <Path
        d="M40 108 C33 109 28 114 28 121 C28 127 33 131 40 130 L58 128 L56 106 Z"
        fill="#FF8B8B"
        stroke="#0E2340"
        strokeWidth={2.5}
      />

      <Line x1={60} y1={120} x2={300} y2={114} stroke="#FFFFFF" strokeWidth={3} opacity={0.4} strokeLinecap="round" />

      <Circle cx={93} cy={150} r={26} fill="url(#wheelGrad)" stroke="#0E2340" strokeWidth={4} />
      <Circle cx={93} cy={150} r={10} fill="#E8F6FF" stroke="#0E2340" strokeWidth={2.5} />
      <Circle cx={233} cy={150} r={26} fill="url(#wheelGrad)" stroke="#0E2340" strokeWidth={4} />
      <Circle cx={233} cy={150} r={10} fill="#E8F6FF" stroke="#0E2340" strokeWidth={2.5} />
    </Svg>
  );
}
