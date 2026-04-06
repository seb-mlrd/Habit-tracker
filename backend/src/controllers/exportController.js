const db = require('../db/schema');
const PDFDocument = require('pdfkit');

function getUserData(userId) {
  const habits = db
    .prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY name')
    .all(userId);
  const completions = db
    .prepare(`
      SELECT c.*, h.name as habit_name, h.category
      FROM completions c
      JOIN habits h ON h.id = c.habit_id
      WHERE h.user_id = ?
      ORDER BY c.completed_on DESC
    `)
    .all(userId);
  return { habits, completions };
}

exports.exportCSV = (req, res) => {
  const { habits, completions } = getUserData(req.user.id);

  const rows = [
    ['habit_id', 'habit_name', 'category', 'frequency', 'completed_on'],
    ...completions.map((c) => {
      const habit = habits.find((h) => h.id === c.habit_id);
      return [c.habit_id, c.habit_name, c.category, habit?.frequency ?? '', c.completed_on];
    }),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="habits_export.csv"');
  res.send(csv);
};

exports.exportPDF = (req, res) => {
  const { habits, completions } = getUserData(req.user.id);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="habits_export.pdf"');
  doc.pipe(res);

  // Title
  doc.fontSize(20).font('Helvetica-Bold').text('Habit Tracker — Export', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#666')
    .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(1.5);

  // Habits summary
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Habits');
  doc.moveDown(0.5);
  for (const h of habits) {
    const count = completions.filter((c) => c.habit_id === h.id).length;
    doc.fontSize(10).font('Helvetica')
      .text(`• ${h.name}  [${h.category}]  —  ${count} completions`, { indent: 10 });
  }

  doc.moveDown(1.5);

  // Completions table (last 60)
  doc.fontSize(14).font('Helvetica-Bold').text('Recent completions (last 60)');
  doc.moveDown(0.5);

  const recent = completions.slice(0, 60);
  const colWidths = [200, 100, 120];
  const headers = ['Habit', 'Category', 'Completed on'];
  const startX = doc.page.margins.left;
  let y = doc.y;

  // Header row
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#4f46e5');
  headers.forEach((h, i) => {
    doc.text(h, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: colWidths[i] });
  });
  y += 16;
  doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).strokeColor('#e5e7eb').stroke();
  y += 4;

  // Data rows
  doc.font('Helvetica').fillColor('#000');
  for (const c of recent) {
    if (y > doc.page.height - doc.page.margins.bottom - 20) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    const row = [c.habit_name, c.category, c.completed_on];
    doc.fontSize(9);
    row.forEach((val, i) => {
      doc.text(val, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: colWidths[i] });
    });
    y += 14;
  }

  doc.end();
};
