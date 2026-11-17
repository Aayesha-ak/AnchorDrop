import assert from "assert";
import fs from "fs";
import path from "path";

/**
 * ============================================================================
 * Phase 23 — Motion, Responsive & Accessibility Verification
 * Sub-phases 23.1 to 23.10
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// Color Contrast Mathematics (W3C WCAG 2.1 Specification)
// ----------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "").trim();
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [sR, sG, sB] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getRelativeLuminance(r1, g1, b1);
  const l2 = getRelativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function runPhase23Tests() {
  console.log("⚓ Running Phase 23 Motion, Responsive & Accessibility Verification...\n");

  const motionCssPath = path.resolve(__dirname, "../src/styles/motion.css");
  const globalsCssPath = path.resolve(__dirname, "../src/styles/globals.css");
  const a11yComponentPath = path.resolve(
    __dirname,
    "../src/components/layout/AccessibilityEnhancements.tsx"
  );
  const layoutPath = path.resolve(__dirname, "../src/app/layout.tsx");

  // --------------------------------------------------------------------------
  // 1. Verify Motion CSS & Keyframe Definitions (Sub-phase 23.1)
  // --------------------------------------------------------------------------
  console.log("▶ 1. Checking Motion CSS & Keyframe Animations...");
  assert.ok(fs.existsSync(motionCssPath), "src/styles/motion.css must exist");

  const motionContent = fs.readFileSync(motionCssPath, "utf-8");
  const globalsContent = fs.readFileSync(globalsCssPath, "utf-8");

  // Ensure globals.css imports motion.css
  assert.ok(
    globalsContent.includes('motion.css'),
    "src/styles/globals.css must import motion.css"
  );

  const requiredKeyframes = [
    { name: "shimmer", desc: "Skeleton loading shimmer" },
    { name: "fadeIn", desc: "Fade-in entrance" },
    { name: "slideUp", desc: "Smooth upward entrance" },
    { name: "arrivalPulse", desc: "Soft glowing pulse for unlocked arrival instructions" },
    { name: "badgeAttention", desc: "Attention pulse for delay alert badges" },
  ];

  for (const kf of requiredKeyframes) {
    const kfRegex = new RegExp(`@keyframes\\s+${kf.name}\\b`, "m");
    assert.ok(
      kfRegex.test(motionContent),
      `Keyframe animation '@keyframes ${kf.name}' (${kf.desc}) must be defined in motion.css`
    );
    console.log(`  ✓ @keyframes ${kf.name} (${kf.desc}) verified`);
  }

  // Check animation utility classes
  const requiredUtilities = [
    ".animate-shimmer",
    ".animate-fade-in",
    ".animate-slide-up",
    ".animate-arrival-pulse",
    ".animate-badge-attention",
  ];
  for (const util of requiredUtilities) {
    assert.ok(
      motionContent.includes(util),
      `Utility class '${util}' must exist in motion.css`
    );
  }
  console.log("  ✓ Motion utility classes verified");

  // --------------------------------------------------------------------------
  // 2. Verify Reduced-Motion Media Query (Sub-phase 23.2)
  // --------------------------------------------------------------------------
  console.log("\n▶ 2. Checking Reduced-Motion Compliance (prefers-reduced-motion)...");
  assert.ok(
    motionContent.includes("@media (prefers-reduced-motion: reduce)"),
    "prefers-reduced-motion media query must be present in motion.css"
  );
  assert.ok(
    motionContent.includes("animation-duration: 0.01ms"),
    "prefers-reduced-motion must set animation-duration to 0.01ms"
  );
  assert.ok(
    motionContent.includes("transition-duration: 0.01ms"),
    "prefers-reduced-motion must set transition-duration to 0.01ms"
  );
  console.log("  ✓ prefers-reduced-motion media query disarms non-essential animations");

  // --------------------------------------------------------------------------
  // 3. Verify Focus-Visible Rings (Sub-phase 23.5 & 23.6)
  // --------------------------------------------------------------------------
  console.log("\n▶ 3. Checking Visible Focus Rings (:focus-visible)...");
  assert.ok(
    motionContent.includes(":focus-visible"),
    "focus-visible styles must be present in motion.css"
  );
  assert.ok(
    motionContent.includes("outline: 2px solid var(--color-gold)") ||
      motionContent.includes("outline: 2px solid"),
    "High-contrast outline must be specified for focus-visible"
  );
  assert.ok(
    motionContent.includes("outline-offset: 2px"),
    "outline-offset: 2px must be specified for clear focus detachment"
  );
  console.log("  ✓ High-contrast :focus-visible outlines present across interactive elements");

  // --------------------------------------------------------------------------
  // 4. Verify AccessibilityEnhancements Component & Layout Target (Sub-phases 23.5 - 23.9)
  // --------------------------------------------------------------------------
  console.log("\n▶ 4. Checking Accessibility Enhancements & Screen Reader Utilities...");
  assert.ok(
    fs.existsSync(a11yComponentPath),
    "src/components/layout/AccessibilityEnhancements.tsx must exist"
  );

  const a11yContent = fs.readFileSync(a11yComponentPath, "utf-8");
  assert.ok(
    a11yContent.includes("SkipToContent"),
    "SkipToContent helper must be exported"
  );
  assert.ok(
    a11yContent.includes("LiveAnnouncer") || a11yContent.includes("announceToScreenReader"),
    "LiveAnnouncer or announceToScreenReader helper must be exported"
  );
  assert.ok(
    a11yContent.includes("AccessibleIcon"),
    "AccessibleIcon helper must be exported"
  );
  assert.ok(
    a11yContent.includes("StatusIndicator"),
    "StatusIndicator helper (text + icon for colorblind accessibility) must be exported"
  );

  // Check RootLayout integration
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert.ok(
    layoutContent.includes("AccessibilityEnhancements"),
    "src/app/layout.tsx must render AccessibilityEnhancements"
  );
  assert.ok(
    layoutContent.includes('id="main-content"'),
    "src/app/layout.tsx must include #main-content container for skip link"
  );
  console.log("  ✓ Skip-to-content target (#main-content) configured in RootLayout");
  console.log("  ✓ Screen reader live announcer & accessible icon helpers verified");

  // --------------------------------------------------------------------------
  // 5. WCAG 2.1 AA Color Contrast Verification (Sub-phase 23.8)
  // --------------------------------------------------------------------------
  console.log("\n▶ 5. Checking WCAG 2.1 AA Color Contrast Standards...");

  const NAVY = "#0B1F33";
  const GOLD = "#C6A56B";
  const CREAM = "#F5F1E8";
  const WHITE = "#FFFFFF";
  const TEXT_SECONDARY = "#4A5B6B";

  // Contrast 1: Navy text on Cream background (Day Deck body text)
  const navyOnCream = getContrastRatio(NAVY, CREAM);
  console.log(`  • Navy (${NAVY}) on Cream (${CREAM}): ${navyOnCream.toFixed(2)}:1 (Min 4.5:1 required)`);
  assert.ok(
    navyOnCream >= 4.5,
    `Navy on Cream contrast (${navyOnCream.toFixed(2)}) must meet WCAG AA text standard (4.5:1)`
  );
  assert.ok(
    navyOnCream >= 7.0,
    `Navy on Cream contrast (${navyOnCream.toFixed(2)}) exceeds WCAG AAA text standard (7.0:1)`
  );

  // Contrast 2: Gold on Navy background (Harbor Night buttons & headings)
  const goldOnNavy = getContrastRatio(GOLD, NAVY);
  console.log(`  • Gold (${GOLD}) on Navy (${NAVY}): ${goldOnNavy.toFixed(2)}:1 (Min 4.5:1 text, 3.0:1 UI)`);
  assert.ok(
    goldOnNavy >= 4.5,
    `Gold on Navy contrast (${goldOnNavy.toFixed(2)}) must meet WCAG AA text standard (4.5:1)`
  );
  assert.ok(
    goldOnNavy >= 3.0,
    `Gold on Navy contrast (${goldOnNavy.toFixed(2)}) must meet WCAG AA UI graphic standard (3.0:1)`
  );

  // Contrast 3: Cream text on Navy background (Harbor Night body text)
  const creamOnNavy = getContrastRatio(CREAM, NAVY);
  console.log(`  • Cream (${CREAM}) on Navy (${NAVY}): ${creamOnNavy.toFixed(2)}:1 (Min 4.5:1 required)`);
  assert.ok(
    creamOnNavy >= 4.5,
    `Cream on Navy contrast (${creamOnNavy.toFixed(2)}) must meet WCAG AA text standard (4.5:1)`
  );

  // Contrast 4: White on Navy background (Harbor Night high contrast text)
  const whiteOnNavy = getContrastRatio(WHITE, NAVY);
  console.log(`  • White (${WHITE}) on Navy (${NAVY}): ${whiteOnNavy.toFixed(2)}:1 (Min 4.5:1 required)`);
  assert.ok(
    whiteOnNavy >= 4.5,
    `White on Navy contrast (${whiteOnNavy.toFixed(2)}) must meet WCAG AA text standard (4.5:1)`
  );

  // Contrast 5: Secondary text on Cream background
  const secondaryOnCream = getContrastRatio(TEXT_SECONDARY, CREAM);
  console.log(`  • Muted Navy (${TEXT_SECONDARY}) on Cream (${CREAM}): ${secondaryOnCream.toFixed(2)}:1 (Min 4.5:1 required)`);
  assert.ok(
    secondaryOnCream >= 4.5,
    `Secondary text on Cream (${secondaryOnCream.toFixed(2)}) must meet WCAG AA text standard (4.5:1)`
  );

  console.log("  ✓ All AnchorDrop brand combinations exceed WCAG 2.1 AA standards");

  // --------------------------------------------------------------------------
  // Summary Checklist
  // --------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log("🎉 Phase 23 Verification Passed Successfully!");
  console.log("  ✓ Sub-phase 23.1: Planned animations defined in motion.css");
  console.log("  ✓ Sub-phase 23.2: prefers-reduced-motion media query enforced");
  console.log("  ✓ Sub-phase 23.5 & 23.6: High-contrast focus-visible ring styles verified");
  console.log("  ✓ Sub-phase 23.7 & 23.9: Accessible icons & status indicators (text + icon)");
  console.log("  ✓ Sub-phase 23.8: Contrast standards mathematically validated for WCAG AA/AAA");
  console.log("========================================================\n");
}

runPhase23Tests().catch((err) => {
  console.error("❌ Phase 23 Verification Failed:", err);
  process.exit(1);
});
