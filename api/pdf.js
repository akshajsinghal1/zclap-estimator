'use strict';
const { getSupabaseAdminClient } = require('./_supabase');
const { generateEstimatePDF }    = require('./_pdf');

module.exports = async function handler(req, res) {
  // Gate with a simple secret so this isn't publicly accessible.
  // Set PDF_SECRET in Vercel env vars. If not set, the endpoint is disabled.
  const secret   = process.env.PDF_SECRET || '';
  const provided = req.query.secret || req.headers['x-pdf-secret'] || '';
  if (!secret || provided !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const requestId = String(req.query.id || '').trim();
  if (!requestId) {
    res.status(400).json({ error: 'Missing ?id=<request-id>' });
    return;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('estimator_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const pdfBuffer = await generateEstimatePDF(data);
    const slug = (data.first_name || 'estimate').toLowerCase().replace(/\s+/g, '-');
    const filename = `zclap-mdm-estimate-${slug}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).end(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF', detail: err.message });
  }
};
