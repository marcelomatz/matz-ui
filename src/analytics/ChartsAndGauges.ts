import { matzIcon } from '../icons/Icons';

export interface ArcGaugeConfig {
  label: string;
  sublabel?: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
  secondaryColor?: string;
  statusText?: string;
  interactive?: boolean;
}

export interface ArcGaugeController {
  setValue(val: number): void;
}

export function renderArcGauge(
  container: HTMLElement,
  cfg: ArcGaugeConfig
): ArcGaugeController {
  const min = cfg.min ?? 0;
  const max = cfg.max ?? 100;
  let current = Math.max(min, Math.min(max, cfg.value));
  const color = cfg.color || 'var(--accent)';
  const secondary = cfg.secondaryColor || '#06b6d4';
  const uid = `gauge-${Math.random().toString(36).slice(2, 8)}`;

  const cx = 100;
  const cy = 102;
  const r = 74;
  const startAngle = 135;
  const sweepAngle = 270;

  const polarToCartesian = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (startDeg: number, endDeg: number, radius: number) => {
    const start = polarToCartesian(startDeg, radius);
    const end = polarToCartesian(endDeg, radius);
    const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  const ticks: string[] = [];
  const totalTicks = 28;
  for (let i = 0; i <= totalTicks; i++) {
    const deg = startAngle + (i / totalTicks) * sweepAngle;
    const isMajor = i % 7 === 0;
    const p1 = polarToCartesian(deg, isMajor ? r + 10 : r + 8);
    const p2 = polarToCartesian(deg, isMajor ? r + 17 : r + 13);
    ticks.push(
      `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${
        isMajor ? 'var(--chart-tick-major)' : 'var(--chart-tick-minor)'
      }" stroke-width="${isMajor ? '1.8' : '1'}" stroke-linecap="round"/>`
    );
  }

  const trackPath = describeArc(startAngle, startAngle + sweepAngle, r);

  // Render DOM structure once so the range slider is never destroyed during drag
  container.innerHTML = `
    <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;align-items:center;padding:18px 16px;gap:8px;">
      <div style="width:100%;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:12px;font-weight:600;color:var(--text-secondary);letter-spacing:0.01em;">${cfg.label}</span>
        <span class="matz-badge" id="${uid}-status" style="font-size:10px;padding:2px 7px;">OPTIMAL</span>
      </div>
      <div style="position:relative;width:190px;height:155px;display:flex;align-items:center;justify-content:center;">
        <svg viewBox="0 0 200 175" width="190" height="155" style="overflow:visible;">
          <defs>
            <linearGradient id="${uid}-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="${secondary}"/>
              <stop offset="100%" stop-color="${color}"/>
            </linearGradient>
            <filter id="${uid}-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          ${ticks.join('')}
          <path d="${trackPath}" fill="none" stroke="var(--chart-track)" stroke-width="10" stroke-linecap="round"/>
          <path id="${uid}-active-arc" d="${trackPath}" fill="none" stroke="url(#${uid}-grad)" stroke-width="10" stroke-linecap="round" filter="url(#${uid}-glow)"/>
          <circle id="${uid}-tip" cx="100" cy="100" r="5" fill="#ffffff" stroke="${color}" stroke-width="2"/>
        </svg>
        <div style="position:absolute;top:56px;display:flex;flex-direction:column;align-items:center;text-align:center;pointer-events:none;">
          <div class="matz-tabular" style="font-size:28px;font-weight:800;letter-spacing:-0.03em;color:var(--text-primary);line-height:1;">
            <span id="${uid}-val">0</span><span style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-left:2px;">${cfg.unit || ''}</span>
          </div>
          <span style="font-size:11px;color:var(--text-muted);margin-top:5px;">${cfg.sublabel || `${min} – ${max}${cfg.unit || ''}`}</span>
        </div>
      </div>
      ${
        cfg.interactive
          ? `<input type="range" aria-label="Ajustar valor de ${cfg.label}" min="${min}" max="${max}" step="${(max - min) / 100}" value="${current}" id="${uid}-slider" style="width:100%;accent-color:var(--accent);cursor:pointer;height:6px;position:relative;z-index:5;" />`
          : ''
      }
    </div>
  `;

  const arcEl = container.querySelector<SVGPathElement>(`#${uid}-active-arc`);
  const tipEl = container.querySelector<SVGCircleElement>(`#${uid}-tip`);
  const valEl = container.querySelector<HTMLElement>(`#${uid}-val`);
  const statusEl = container.querySelector<HTMLElement>(`#${uid}-status`);
  const sliderEl = container.querySelector<HTMLInputElement>(`#${uid}-slider`);

  const updateView = (val: number, syncSlider = true) => {
    current = Math.max(min, Math.min(max, val));
    const ratio = (current - min) / (max - min || 1);
    const activeEnd = startAngle + Math.max(0.01, ratio) * sweepAngle;
    const activePath = describeArc(startAngle, activeEnd, r);
    const tip = polarToCartesian(activeEnd, r);

    arcEl?.setAttribute('d', activePath);
    tipEl?.setAttribute('cx', tip.x.toFixed(1));
    tipEl?.setAttribute('cy', tip.y.toFixed(1));
    if (valEl) {
      valEl.textContent = Number.isInteger(current) ? String(current) : current.toFixed(1);
    }
    if (statusEl) {
      statusEl.textContent =
        cfg.statusText || (ratio > 0.85 ? 'PEAK' : ratio > 0.4 ? 'OPTIMAL' : 'IDLE');
    }
    if (syncSlider && sliderEl && document.activeElement !== sliderEl) {
      sliderEl.value = String(current);
    }
  };

  sliderEl?.addEventListener('input', () => {
    updateView(parseFloat(sliderEl.value), false);
  });

  updateView(current, true);
  return {
    setValue: (v: number) => updateView(v, true),
  };
}

export interface SpeedometerConfig {
  label: string;
  value: number;
  max: number;
  unit: string;
  interactive?: boolean;
}

export function renderSpeedometerGauge(
  container: HTMLElement,
  cfg: SpeedometerConfig
): ArcGaugeController {
  let current = Math.max(0, Math.min(cfg.max, cfg.value));
  const uid = `speed-${Math.random().toString(36).slice(2, 8)}`;

  // Render DOM structure once so dragging the slider is 100% smooth
  container.innerHTML = `
    <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;align-items:center;padding:18px 16px;gap:8px;">
      <div style="width:100%;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:12px;font-weight:600;color:var(--text-secondary);">${cfg.label}</span>
        <span class="matz-badge matz-badge-cyan" style="font-size:10px;">TELEMETRY</span>
      </div>
      <div style="position:relative;width:190px;height:155px;display:flex;align-items:center;justify-content:center;">
        <svg viewBox="0 0 200 175" width="190" height="155">
          <path d="M 36 138 A 74 74 0 0 1 65 37" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round" opacity="0.88"/>
          <path d="M 72 34 A 74 74 0 0 1 128 34" fill="none" stroke="#0ea5e9" stroke-width="8" stroke-linecap="round" opacity="0.88"/>
          <path d="M 135 37 A 74 74 0 0 1 164 138" fill="none" stroke="#d946ef" stroke-width="8" stroke-linecap="round" opacity="0.92"/>
          <g id="${uid}-needle" transform="translate(100, 102) rotate(0)" style="transition:transform 0.08s ease-out;">
            <line x1="0" y1="8" x2="0" y2="-64" stroke="var(--text-primary)" stroke-width="2.5" stroke-linecap="round"/>
          </g>
          <circle cx="100" cy="102" r="9" fill="var(--surface-card-solid)" stroke="var(--border-strong)" stroke-width="2"/>
          <circle cx="100" cy="102" r="3.5" fill="var(--accent)"/>
        </svg>
        <div style="position:absolute;bottom:6px;display:flex;flex-direction:column;align-items:center;pointer-events:none;">
          <span class="matz-tabular" style="font-size:23px;font-weight:800;color:var(--text-primary);">
            <span id="${uid}-val">0</span> <span style="font-size:11px;color:var(--text-secondary);font-weight:600;">${cfg.unit}</span>
          </span>
        </div>
      </div>
      ${
        cfg.interactive
          ? `<input type="range" aria-label="Ajustar valor de ${cfg.label}" min="0" max="${cfg.max}" step="1" value="${current}" id="${uid}-slider" style="width:100%;accent-color:var(--accent);cursor:pointer;height:6px;position:relative;z-index:5;" />`
          : ''
      }
    </div>
  `;

  const needleEl = container.querySelector<SVGGElement>(`#${uid}-needle`);
  const valEl = container.querySelector<HTMLElement>(`#${uid}-val`);
  const sliderEl = container.querySelector<HTMLInputElement>(`#${uid}-slider`);

  const updateView = (val: number, syncSlider = true) => {
    current = Math.max(0, Math.min(cfg.max, val));
    const ratio = current / (cfg.max || 1);
    const needleDeg = -120 + ratio * 240;

    needleEl?.setAttribute('transform', `translate(100, 102) rotate(${needleDeg.toFixed(1)})`);
    if (valEl) {
      valEl.textContent = current.toFixed(0);
    }
    if (syncSlider && sliderEl && document.activeElement !== sliderEl) {
      sliderEl.value = String(current);
    }
  };

  sliderEl?.addEventListener('input', () => {
    updateView(parseFloat(sliderEl.value), false);
  });

  updateView(current, true);
  return {
    setValue: (v: number) => updateView(v, true),
  };
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function renderRingDonutChart(
  container: HTMLElement,
  title: string,
  segments: DonutSegment[],
  unitLabel = 'Total'
): void {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  const r = 62;
  const circumference = 2 * Math.PI * r;
  let activeIndex: number | null = null;

  const draw = () => {
    let offset = 0;
    const rings = segments.map((seg, idx) => {
      const pct = seg.value / total;
      const len = pct * circumference;
      const dashArray = `${Math.max(0, len - 3).toFixed(2)} ${circumference.toFixed(2)}`;
      const dashOffset = (-offset).toFixed(2);
      offset += len;
      const isHovered = activeIndex === idx;
      return `<circle
        data-seg-idx="${idx}"
        cx="85" cy="85" r="${r}"
        fill="none"
        stroke="${seg.color}"
        stroke-width="${isHovered ? 18 : 13}"
        stroke-dasharray="${dashArray}"
        stroke-dashoffset="${dashOffset}"
        stroke-linecap="round"
        style="cursor:pointer;transition:all 0.2s ease;transform:rotate(-90deg);transform-origin:85px 85px;"
      />`;
    });

    const focused = activeIndex !== null ? segments[activeIndex] : null;
    const centerVal = focused ? focused.value : total;
    const centerLabel = focused ? focused.label : unitLabel;

    container.innerHTML = `
      <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13.5px;font-weight:700;color:var(--text-primary);">${title}</span>
          <span class="matz-badge">${segments.length} segmentos</span>
        </div>
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center;">
          <div style="position:relative;width:170px;height:170px;display:flex;align-items:center;justify-content:center;">
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="${r}" fill="none" stroke="var(--chart-track)" stroke-width="13"/>
              ${rings.join('')}
            </svg>
            <div style="position:absolute;text-align:center;pointer-events:none;">
              <div class="matz-tabular" style="font-size:22px;font-weight:800;color:var(--text-primary);">${centerVal.toLocaleString('pt-BR')}</div>
              <div style="font-size:11px;color:var(--text-muted);font-weight:600;">${centerLabel}</div>
            </div>
          </div>
          <div style="flex:1;min-width:150px;display:flex;flex-direction:column;gap:8px;">
            ${segments
              .map((s, idx) => {
                const pct = ((s.value / total) * 100).toFixed(1);
                return `
                  <div data-legend-idx="${idx}" style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:6px;background:${
                  activeIndex === idx ? 'var(--bg-hover)' : 'transparent'
                };cursor:pointer;transition:background 0.15s ease;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="width:9px;height:9px;border-radius:50%;background:${s.color};box-shadow:0 0 8px ${s.color};"></span>
                      <span style="font-size:12.5px;color:var(--text-primary);font-weight:500;">${s.label}</span>
                    </div>
                    <div class="matz-tabular" style="font-size:12px;color:var(--text-secondary);">
                      <strong>${pct}%</strong> <span style="color:var(--text-muted);">(${s.value})</span>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll<SVGCircleElement>('[data-seg-idx]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        activeIndex = Number(el.dataset.segIdx);
        draw();
      });
      el.addEventListener('mouseleave', () => {
        activeIndex = null;
        draw();
      });
    });

    container.querySelectorAll<HTMLElement>('[data-legend-idx]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        activeIndex = Number(el.dataset.legendIdx);
        draw();
      });
      el.addEventListener('mouseleave', () => {
        activeIndex = null;
        draw();
      });
    });
  };

  draw();
}

export interface AreaChartSeries {
  name: string;
  color: string;
  data: number[];
}

export interface InteractiveAreaChartConfig {
  title: string;
  subtitle?: string;
  labels: string[];
  series: AreaChartSeries[];
  unit?: string;
}

export function renderInteractiveAreaChart(
  container: HTMLElement,
  cfg: InteractiveAreaChartConfig
): void {
  const uid = `area-${Math.random().toString(36).slice(2, 8)}`;
  const width = 680;
  const height = 230;
  const padLeft = 42;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const allValues = cfg.series.flatMap((s) => s.data);
  const maxVal = Math.max(...allValues, 1) * 1.1;
  const count = Math.max(cfg.labels.length, 2);

  const getX = (i: number) => padLeft + (i / (count - 1)) * plotW;
  const getY = (v: number) => padTop + plotH - (v / maxVal) * plotH;

  const buildSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpx2 = p0.x + (p1.x - p0.x) * 0.55;
      d += ` C ${cpx1.toFixed(1)} ${p0.y.toFixed(1)}, ${cpx2.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const grids = [0, 0.25, 0.5, 0.75, 1].map((r) => {
    const y = padTop + plotH * (1 - r);
    const val = Math.round(maxVal * r);
    return `
      <line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${width - padRight}" y2="${y.toFixed(1)}" stroke="var(--chart-grid)" stroke-dasharray="3 3"/>
      <text x="${padLeft - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)">${val}</text>
    `;
  });

  const defs: string[] = [];
  const paths: string[] = [];

  cfg.series.forEach((s, sIdx) => {
    const pts = s.data.map((v, i) => ({ x: getX(i), y: getY(v) }));
    const lineD = buildSmoothPath(pts);
    const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;
    defs.push(`
      <linearGradient id="${uid}-grad-${sIdx}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${s.color}" stop-opacity="0.34"/>
        <stop offset="95%" stop-color="${s.color}" stop-opacity="0.0"/>
      </linearGradient>
    `);
    paths.push(`
      <path d="${areaD}" fill="url(#${uid}-grad-${sIdx})"/>
      <path d="${lineD}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linecap="round"/>
    `);
  });

  const xLabels = cfg.labels
    .map((lbl, i) => {
      if (count > 8 && i % 2 !== 0 && i !== count - 1) return '';
      return `<text x="${getX(i).toFixed(1)}" y="${height - 6}" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)">${lbl}</text>`;
    })
    .join('');

  container.innerHTML = `
    <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;gap:14px;position:relative;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary);">${cfg.title}</div>
          ${cfg.subtitle ? `<div style="font-size:11.5px;color:var(--text-muted);">${cfg.subtitle}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          ${cfg.series
            .map(
              (s) => `
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);">
              <span style="width:8px;height:8px;border-radius:50%;background:${s.color};box-shadow:0 0 8px ${s.color};"></span>
              <span>${s.name}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <div style="position:relative;width:100%;" id="${uid}-wrap">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="overflow:visible;display:block;" id="${uid}-svg">
          <defs>${defs.join('')}</defs>
          ${grids.join('')}
          ${paths.join('')}
          ${xLabels}
          <line id="${uid}-crosshair" x1="0" y1="${padTop}" x2="0" y2="${padTop + plotH}" stroke="var(--border-strong)" stroke-width="1.5" stroke-dasharray="3 3" style="opacity:0;pointer-events:none;"/>
          <g id="${uid}-dots" style="opacity:0;pointer-events:none;"></g>
        </svg>
        <div id="${uid}-tooltip" style="position:absolute;top:12px;left:0;pointer-events:none;opacity:0;transition:opacity 0.12s ease;background:var(--surface-popover);border:1px solid var(--border-strong);border-radius:8px;padding:8px 12px;box-shadow:var(--shadow-specular);font-size:11.5px;z-index:10;min-width:140px;"></div>
      </div>
    </div>
  `;

  const svg = container.querySelector<SVGSVGElement>(`#${uid}-svg`)!;
  const crosshair = container.querySelector<SVGLineElement>(`#${uid}-crosshair`)!;
  const dotsGroup = container.querySelector<SVGGElement>(`#${uid}-dots`)!;
  const tooltip = container.querySelector<HTMLDivElement>(`#${uid}-tooltip`)!;

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const rawIdx = ((relX - padLeft) / plotW) * (count - 1);
    const idx = Math.max(0, Math.min(count - 1, Math.round(rawIdx)));
    const xPos = getX(idx);

    crosshair.setAttribute('x1', xPos.toFixed(1));
    crosshair.setAttribute('x2', xPos.toFixed(1));
    crosshair.style.opacity = '1';

    dotsGroup.innerHTML = cfg.series
      .map((s) => {
        const yPos = getY(s.data[idx] ?? 0);
        return `<circle cx="${xPos.toFixed(1)}" cy="${yPos.toFixed(1)}" r="4.5" fill="${s.color}" stroke="#ffffff" stroke-width="2"/>`;
      })
      .join('');
    dotsGroup.style.opacity = '1';

    tooltip.innerHTML = `
      <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;font-family:var(--font-mono);">${cfg.labels[idx]}</div>
      ${cfg.series
        .map(
          (s) => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--text-secondary);">
          <span style="display:flex;align-items:center;gap:5px;"><span style="width:6px;height:6px;border-radius:50%;background:${s.color};"></span>${s.name}</span>
          <strong class="matz-tabular" style="color:var(--text-primary);">${(s.data[idx] ?? 0).toLocaleString('pt-BR')}${cfg.unit || ''}</strong>
        </div>`
        )
        .join('')}
    `;
    const pctLeft = (xPos / width) * 100;
    tooltip.style.left = `clamp(8px, calc(${pctLeft}% - 70px), calc(100% - 165px))`;
    tooltip.style.opacity = '1';
  });

  svg.addEventListener('mouseleave', () => {
    crosshair.style.opacity = '0';
    dotsGroup.style.opacity = '0';
    tooltip.style.opacity = '0';
  });
}

export interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
}

export function renderStackedBarChart(
  container: HTMLElement,
  title: string,
  items: BarChartItem[],
  unit = ''
): void {
  const maxVal = Math.max(...items.map((i) => i.value + (i.secondaryValue || 0)), 1);

  container.innerHTML = `
    <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:14px;font-weight:700;color:var(--text-primary);">${title}</span>
        <div style="display:flex;gap:12px;font-size:11.5px;color:var(--text-secondary);">
          <span style="display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--accent);"></span>Primário</span>
          <span style="display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--accent-secondary);"></span>Secundário</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(${items.length}, 1fr);gap:12px;height:185px;align-items:end;padding-top:16px;border-bottom:1px solid var(--border);padding-bottom:8px;">
        ${items
          .map((item) => {
            const p1 = Math.round((item.value / maxVal) * 100);
            const p2 = Math.round(((item.secondaryValue || 0) / maxVal) * 100);
            return `
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px;" title="${item.label}: ${item.value}${unit}">
                <span class="matz-tabular" style="font-size:10.5px;color:var(--text-muted);font-family:var(--font-mono);">${item.value}${unit}</span>
                <div style="width:100%;max-width:38px;display:flex;flex-direction:column;gap:2px;justify-content:flex-end;height:100%;">
                  ${
                    p2 > 0
                      ? `<div style="height:${p2}%;background:var(--accent-secondary);border-radius:4px 4px 2px 2px;opacity:0.85;transition:height 0.25s ease;"></div>`
                      : ''
                  }
                  <div style="height:${p1}%;background:var(--accent);border-radius:4px 4px 2px 2px;box-shadow:0 0 12px var(--accent-glow);transition:height 0.25s ease;"></div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>

      <div style="display:grid;grid-template-columns:repeat(${items.length}, 1fr);gap:12px;text-align:center;">
        ${items
          .map(
            (i) =>
              `<span style="font-size:11px;color:var(--text-secondary);font-family:var(--font-mono);">${i.label}</span>`
          )
          .join('')}
      </div>
    </div>
  `;
}

export interface SparklineCardConfig {
  title: string;
  value: string;
  delta: string;
  positive?: boolean;
  data: number[];
  color?: string;
}

export function renderSparklineCard(cfg: SparklineCardConfig): string {
  const color = cfg.color || 'var(--accent)';
  const min = Math.min(...cfg.data);
  const max = Math.max(...cfg.data, min + 1);
  const w = 120;
  const h = 38;
  const pts = cfg.data.map((v, i) => {
    const x = (i / Math.max(1, cfg.data.length - 1)) * w;
    const y = h - 4 - ((v - min) / (max - min)) * (h - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = pts.join(' ');
  const area = `0,${h} ${polyline} ${w},${h}`;

  return `
    <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;justify-content:space-between;gap:14px;padding:18px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:12px;font-weight:600;color:var(--text-secondary);">${cfg.title}</span>
        <span class="matz-badge ${cfg.positive !== false ? 'matz-badge-emerald' : 'matz-badge-rose'}" style="font-size:10.5px;">
          ${cfg.delta}
        </span>
      </div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px;">
        <div class="matz-tabular" style="font-size:28px;font-weight:800;letter-spacing:-0.03em;color:var(--text-primary);line-height:1;">
          ${cfg.value}
        </div>
        <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible;">
          <polygon points="${area}" fill="${color}" opacity="0.15"/>
          <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  `;
}

export function renderActivityHeatmap(
  container: HTMLElement,
  title: string,
  subtitle = '52 Semanas · Telemetria de Commits, Deploys & Execuções'
): void {
  const rows = 7;
  const cols = 26;
  const cells: string[] = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const seed = Math.sin(c * 13.7 + r * 7.3) * 0.5 + 0.5;
      const level = seed > 0.84 ? 4 : seed > 0.65 ? 3 : seed > 0.45 ? 2 : seed > 0.25 ? 1 : 0;
      const bg =
        level === 4
          ? 'var(--accent)'
          : level === 3
          ? 'rgba(139, 92, 246, 0.65)'
          : level === 2
          ? 'rgba(6, 182, 212, 0.45)'
          : level === 1
          ? 'var(--border-strong)'
          : 'var(--chart-track)';
      const shadow = level === 4 ? 'box-shadow:0 0 8px var(--accent-glow);' : '';
      cells.push(
        `<div title="Dia ${c * 7 + r + 1}: ${level * 14} eventos" style="width:12px;height:12px;border-radius:3px;background:${bg};${shadow}transition:transform 0.12s ease;cursor:pointer;" onmouseenter="this.style.transform='scale(1.3)'" onmouseleave="this.style.transform='scale(1)'"></div>`
      );
    }
  }

  container.innerHTML = `
    <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;gap:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-size:13.5px;font-weight:700;color:var(--text-primary);">${title}</div>
          <div style="font-size:11.5px;color:var(--text-muted);">${subtitle}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted);">
          <span>Menos</span>
          <span style="width:10px;height:10px;border-radius:2px;background:var(--chart-track);"></span>
          <span style="width:10px;height:10px;border-radius:2px;background:var(--border-strong);"></span>
          <span style="width:10px;height:10px;border-radius:2px;background:rgba(6,182,212,0.45);"></span>
          <span style="width:10px;height:10px;border-radius:2px;background:var(--accent);"></span>
          <span>Mais</span>
        </div>
      </div>
      <div style="display:grid;grid-template-rows:repeat(${rows}, 12px);grid-auto-flow:column;gap:4px;overflow-x:auto;padding-bottom:4px;">
        ${cells.join('')}
      </div>
    </div>
  `;
}

export function mountLiveTelemetryStream(
  container: HTMLElement,
  title = 'Live 60fps Engine Telemetry Stream (RPS & Latency P99)'
): () => void {
  const uid = `stream-${Math.random().toString(36).slice(2, 8)}`;
  container.innerHTML = `
    <div class="matz-card matz-beam-top" style="display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 10px #10b981;"></span>
          <span style="font-size:13.5px;font-weight:700;color:var(--text-primary);">${title}</span>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <span class="matz-tabular" style="font-size:12px;color:#0ea5e9;font-family:var(--font-mono);font-weight:600;" id="${uid}-rps">1,420 req/s</span>
          <span class="matz-tabular" style="font-size:12px;color:#d946ef;font-family:var(--font-mono);font-weight:600;" id="${uid}-lat">14.2 ms</span>
          <button class="matz-btn matz-btn-sm" id="${uid}-toggle">${matzIcon('pause', 12)} Pause</button>
        </div>
      </div>
      <canvas id="${uid}-canvas" width="640" height="145" style="width:100%;height:145px;border-radius:8px;background:var(--surface-code);border:1px solid var(--border);"></canvas>
    </div>
  `;

  const canvas = container.querySelector<HTMLCanvasElement>(`#${uid}-canvas`)!;
  const rpsEl = container.querySelector<HTMLElement>(`#${uid}-rps`)!;
  const latEl = container.querySelector<HTMLElement>(`#${uid}-lat`)!;
  const toggleBtn = container.querySelector<HTMLButtonElement>(`#${uid}-toggle`)!;
  const ctx = canvas.getContext('2d')!;

  const maxPts = 120;
  const seriesA: number[] = Array.from({ length: maxPts }, (_, i) => 0.5 + 0.25 * Math.sin(i * 0.15));
  const seriesB: number[] = Array.from({ length: maxPts }, (_, i) => 0.35 + 0.18 * Math.cos(i * 0.12));

  let running = true;
  let inViewport = true;
  let tick = 0;
  let rafId = 0;

  let observer: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inViewport = entry.isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);
  }

  toggleBtn.addEventListener('click', () => {
    running = !running;
    toggleBtn.setAttribute('aria-pressed', String(!running));
    toggleBtn.innerHTML = running
      ? `${matzIcon('pause', 12)} Pause`
      : `${matzIcon('play', 12)} Resume`;
  });

  const renderLoop = () => {
    if (running && inViewport) {
      tick += 0.08;
      if (Math.round(tick * 12) % 3 === 0) {
        const nextA = Math.max(0.12, Math.min(0.92, 0.55 + 0.25 * Math.sin(tick) + (Math.random() - 0.5) * 0.14));
        const nextB = Math.max(0.1, Math.min(0.85, 0.35 + 0.2 * Math.cos(tick * 0.8) + (Math.random() - 0.5) * 0.1));
        seriesA.push(nextA);
        seriesA.shift();
        seriesB.push(nextB);
        seriesB.shift();

        rpsEl.textContent = `${Math.round(900 + nextA * 1100).toLocaleString('pt-BR')} req/s`;
        latEl.textContent = `${(8 + nextB * 18).toFixed(1)} ms`;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let y = 25; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const drawWave = (arr: number[], stroke: string, fillRgba: string) => {
        ctx.beginPath();
        arr.forEach((v, idx) => {
          const x = (idx / (maxPts - 1)) * w;
          const y = h - 10 - v * (h - 24);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = fillRgba;
        ctx.fill();
      };

      drawWave(seriesA, '#38bdf8', 'rgba(56, 189, 248, 0.14)');
      drawWave(seriesB, '#d946ef', 'rgba(217, 70, 239, 0.11)');
    }
    rafId = requestAnimationFrame(renderLoop);
  };

  rafId = requestAnimationFrame(renderLoop);
  return () => {
    cancelAnimationFrame(rafId);
    observer?.disconnect();
  };
}
