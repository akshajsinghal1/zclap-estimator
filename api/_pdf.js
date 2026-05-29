'use strict';
const PDFDocument = require('pdfkit');
const path = require('path');

// ── Colours ──────────────────────────────────────────────────────────────────
const C = {
  orange:    '#E8490F',
  dark:      '#1A1A1A',
  mid:       '#555555',
  lightBg:   '#F7F6F2',
  rowAlt:    '#FAFAF8',
  border:    '#E0DED8',
  greenBg:   '#EAF3DE', greenTxt: '#3B6D11',
  amberBg:   '#FAEEDA', amberTxt: '#854F0B',
  redBg:     '#FCEBEB', redTxt:   '#A32D2D',
  white:     '#FFFFFF',
};

// ── Page constants ────────────────────────────────────────────────────────────
const PW  = 612;   // letter width  (pts)
const PH  = 792;   // letter height (pts)
const ML  = 50;    // left margin
const MR  = 50;    // right margin
const CW  = PW - ML - MR;  // content width = 512

// ── Helpers ───────────────────────────────────────────────────────────────────
function divider(doc, y) {
  doc.moveTo(ML, y).lineTo(PW - MR, y)
     .strokeColor(C.border).lineWidth(0.75).stroke();
  return y + 1;
}

function sectionLabel(doc, text, y) {
  doc.fontSize(8).fillColor(C.mid).font('Helvetica-Bold')
     .text(text, ML, y, { characterSpacing: 0.6 });
  return y + 14;
}

function riskCard(doc, risk, riskTitle, riskDesc, y) {
  const colours = {
    low:    { bg: C.greenBg,  txt: C.greenTxt },
    medium: { bg: C.amberBg,  txt: C.amberTxt },
    high:   { bg: C.redBg,    txt: C.redTxt   },
  };
  const col = colours[risk] || colours.medium;
  const descH = doc.heightOfString(riskDesc, { width: CW - 28, fontSize: 10 });
  const cardH = 18 + 18 + descH + 18;

  doc.rect(ML, y, CW, cardH).fill(col.bg);

  doc.fontSize(8).fillColor(col.txt).font('Helvetica-Bold')
     .text(`${risk.toUpperCase()} COMPLEXITY`, ML + 14, y + 10, { characterSpacing: 0.5 });
  doc.fontSize(12).fillColor(col.txt).font('Helvetica-Bold')
     .text(riskTitle, ML + 14, y + 24);
  doc.fontSize(10).fillColor(C.mid).font('Helvetica')
     .text(riskDesc, ML + 14, y + 40, { width: CW - 28 });

  return y + cardH + 12;
}

function metricBox(doc, label, value, x, y, w) {
  const h = 56;
  doc.rect(x, y, w, h).fill(C.lightBg);
  doc.fontSize(8).fillColor(C.mid).font('Helvetica-Bold')
     .text(label, x + 12, y + 10, { characterSpacing: 0.5 });
  doc.fontSize(20).fillColor(C.dark).font('Helvetica-Bold')
     .text(value, x + 12, y + 24);
  return h;
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * @param {object} record  Row from estimator_requests table
 * @returns {Promise<Buffer>}
 */
function generateEstimatePDF(record) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 0, autoFirstPage: true });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const inputs  = record.inputs  || {};
    const outputs = record.outputs || {};

    const firstName    = record.first_name || '';
    const lastName     = record.last_name  || '';
    const company      = record.company    || '';
    const estimatorType = record.estimator_type || 'implementation';
    const typeLabel    = estimatorType === 'modernization'
      ? 'MDM Modernization Estimate'
      : 'MDM Implementation Estimate';

    const lowFmt   = outputs.lowFmt  || String(outputs.low  || 'TBD');
    const highFmt  = outputs.highFmt || String(outputs.high || 'TBD');
    const totalWks = String(outputs.totalWks || '—');
    const risk     = outputs.risk      || 'medium';
    const riskTitle = outputs.riskTitle || 'Medium complexity';
    const riskDesc  = outputs.riskDesc  || '';

    // ── HEADER BAR ────────────────────────────────────────────────────────────
    const HEADER_H = 64;
    doc.rect(0, 0, PW, HEADER_H).fill(C.orange);

    doc.fontSize(20).fillColor(C.white).font('Helvetica-Bold')
       .text('ZCLAP', ML, 16);
    doc.fontSize(8).fillColor('rgba(255,255,255,0.75)').font('Helvetica')
       .text('MDM ADVISORY', ML, 38, { characterSpacing: 0.4 });

    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.fontSize(9).fillColor('rgba(255,255,255,0.85)').font('Helvetica')
       .text(dateStr, ML, 28, { width: CW, align: 'right' });

    // ── TITLE ─────────────────────────────────────────────────────────────────
    let y = HEADER_H + 24;

    doc.fontSize(10).fillColor(C.orange).font('Helvetica-Bold')
       .text(typeLabel.toUpperCase(), ML, y, { characterSpacing: 0.5 });
    y += 16;

    const nameStr = [firstName, lastName].filter(Boolean).join(' ');
    const prepLine = [nameStr, company].filter(Boolean).join(' · ');
    if (prepLine) {
      doc.fontSize(12).fillColor(C.dark).font('Helvetica')
         .text(`Prepared for: ${prepLine}`, ML, y);
      y += 16;
    }

    y += 10;
    y = divider(doc, y) + 20;

    // ── COST RANGE ────────────────────────────────────────────────────────────
    doc.fontSize(9).fillColor(C.mid).font('Helvetica-Bold')
       .text('INDICATIVE FIXED-PRICE RANGE', ML, y, { width: CW, align: 'center', characterSpacing: 0.5 });
    y += 16;

    doc.fontSize(34).fillColor(C.dark).font('Helvetica-Bold')
       .text(`${lowFmt} – ${highFmt}`, ML, y, { width: CW, align: 'center' });
    y += 46;

    doc.fontSize(11).fillColor(C.mid).font('Helvetica')
       .text(`${totalWks}-week estimated delivery`, ML, y, { width: CW, align: 'center' });
    y += 26;

    // ── METRIC BOXES ──────────────────────────────────────────────────────────
    const boxW = (CW - 12) / 2;
    const complexLabel = risk.charAt(0).toUpperCase() + risk.slice(1);
    metricBox(doc, 'TIMELINE',   `${totalWks} wks`,   ML,            y, boxW);
    metricBox(doc, 'COMPLEXITY', complexLabel,         ML + boxW + 12, y, boxW);
    y += 56 + 16;

    // ── RISK CARD ─────────────────────────────────────────────────────────────
    y = riskCard(doc, risk, riskTitle, riskDesc, y);
    y += 4;

    y = divider(doc, y) + 16;

    // ── SCOPE TABLE ───────────────────────────────────────────────────────────
    y = sectionLabel(doc, 'PROJECT SCOPE', y);

    const volLabels = {
      'Less than 1 million':      'Less than 1M records',
      '1 million to 10 million':  '1M – 10M records',
      '10 million to 80 million': '10M – 80M records',
      'Over 80 million':          'Over 80M records',
    };
    const migOpts = {
      'Load by business ID': 'Load by Business ID (Option 1)',
      'Merge by old ID':     'Merge by Old ID (Option 2)',
      'New match/merge':     'New Match/Merge (Option 3)',
    };

    const scopeRows = [];
    if (estimatorType === 'modernization') {
      scopeRows.push(['Parallel testing',        `${inputs.parallelWeeks || 2} weeks`]);
      scopeRows.push(['Legacy record handling',   migOpts[inputs.legacyHandling] || inputs.legacyHandling || '—']);
    }
    scopeRows.push(['OOTB entities',                     (inputs.ootb || []).join(', ') || 'None']);
    scopeRows.push(['Custom entities',                   String(inputs.customEnt ?? 0)]);
    scopeRows.push(['Relationships',                     String(inputs.rels ?? 0)]);
    scopeRows.push(['Hierarchies',                       String(inputs.hierarchies ?? 0)]);
    scopeRows.push(['Batch source systems',              String(inputs.sources ?? 0)]);
    scopeRows.push(['Real-time inbound sources',         String(inputs.rtSources ?? 0)]);
    scopeRows.push(['Batch consumers',                   String(inputs.consumers ?? 0)]);
    scopeRows.push(['Real-time consumers',               String(inputs.rtConsumers ?? 0)]);
    scopeRows.push(['Entities with create workflows',    String(inputs.createWkfl ?? 0)]);
    scopeRows.push(['Source record volume',              volLabels[inputs.volume] || inputs.volume || '—']);
    scopeRows.push(['Data cleansing / enrichment services', String(inputs.daas ?? 0)]);

    const colW = CW / 2;
    const rowH = 19;
    scopeRows.forEach((row, i) => {
      if (y + rowH > PH - 100) { doc.addPage(); y = ML; }
      doc.rect(ML, y, CW, rowH).fill(i % 2 === 0 ? C.rowAlt : C.white);
      doc.fontSize(10).fillColor(C.mid).font('Helvetica')
         .text(row[0], ML + 8, y + 4, { width: colW - 16 });
      doc.fontSize(10).fillColor(C.dark).font('Helvetica')
         .text(row[1], ML + colW, y + 4, { width: colW - 8 });
      y += rowH;
    });

    y += 16;

    // ── ASSUMPTIONS ───────────────────────────────────────────────────────────
    if (y > PH - 200) { doc.addPage(); y = ML; }

    y = divider(doc, y) + 16;
    y = sectionLabel(doc, 'ESTIMATE ASSUMPTIONS', y);

    const assumptions = [
      'Workflow will use out-of-the-box options — one step, two steps, or four steps.',
      'Reference data will be managed in Reference 360 via the Data Stewards interface.',
      'Real-time sources must be able to call MDM REST APIs.',
      'Real-time targets must have REST APIs which can be called to push data. For inserting new records, the real-time target must respond synchronously with the new record ID in response.',
      'Batch sources must have a way to identify changes since last extract (CDC process, last update date, etc.).',
      'MDM data will be egressed as relational-style database tables for batch targets to consume.',
    ];

    assumptions.forEach(text => {
      const h = doc.heightOfString(`• ${text}`, { width: CW - 20 }) + 6;
      if (y + h > PH - 80) { doc.addPage(); y = ML; }
      doc.fontSize(10).fillColor(C.mid).font('Helvetica')
         .text(`• ${text}`, ML + 10, y, { width: CW - 20, lineGap: 1 });
      y += h;
    });

    y += 6;
    doc.fontSize(9).fillColor(C.mid).font('Helvetica-Oblique')
       .text('Any changes to the above assumptions may require a revised estimate.', ML, y, { width: CW });

    // ── FOOTER ────────────────────────────────────────────────────────────────
    const FY = PH - 38;
    doc.moveTo(ML, FY).lineTo(PW - MR, FY)
       .strokeColor(C.border).lineWidth(0.75).stroke();
    doc.fontSize(8).fillColor(C.mid).font('Helvetica')
       .text(
         'This is an indicative estimate only. Final pricing is subject to detailed scoping and ZCLAP review.',
         ML, FY + 8, { width: CW }
       );
    doc.fontSize(8).fillColor(C.mid)
       .text(
         `© ${new Date().getFullYear()} ZCLAP · zclap.com · Data tells the story.`,
         ML, FY + 20, { width: CW, align: 'right' }
       );

    doc.end();
  });
}

module.exports = { generateEstimatePDF };
