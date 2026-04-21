import PDFDocument from "pdfkit";

// Agregar nuevo tipo = agregar una función aquí. Sin cambios de esquema.
const templates = {
    concepto_medico: renderConceptoMedico,
    paraclinico: renderParaclinico,
    examen_complementario: renderExamenComplementario,
};

export const generatePDF = (doc, stream) => {
    const render = templates[doc.type];
    if (!render) throw new Error(`Tipo no soportado: ${doc.type}`);

    const pdf = new PDFDocument({ margin: 50, size: "A4" });
    pdf.pipe(stream);

    renderHeader(pdf, doc);
    render(pdf, doc.metadata || {});
    renderFooter(pdf);

    pdf.end();
};

export const getSupportedTypes = () => Object.keys(templates);

function renderHeader(pdf, doc) {
    pdf
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("IPS Salud Ocupacional de los Andes", { align: "center" })
        .moveDown(0.3)
        .fontSize(12)
        .font("Helvetica")
        .text("NIT: 900.000.000-0 | Tel: (601) 000-0000", { align: "center" })
        .moveDown(0.5);

    pdf
        .moveTo(50, pdf.y)
        .lineTo(545, pdf.y)
        .stroke()
        .moveDown(0.5);

    const typeLabels = {
        concepto_medico: "Concepto Médico",
        paraclinico: "Resultado Paraclínico",
        examen_complementario: "Examen Complementario",
    };

    pdf
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(typeLabels[doc.type] || doc.type, { align: "center" })
        .moveDown(0.3)
        .fontSize(10)
        .font("Helvetica")
        .text(`Fecha de emisión: ${new Date(doc.created_at).toLocaleDateString("es-CO")}`, { align: "right" })
        .moveDown(1);
}

function renderConceptoMedico(pdf, m) {
    field(pdf, "Paciente", m.paciente);
    field(pdf, "Cédula", m.cedula);
    field(pdf, "Fecha de valoración", m.fecha);
    field(pdf, "Médico evaluador", m.medico);
    pdf.moveDown(0.5);

    section(pdf, "Diagnóstico");
    pdf.fontSize(11).font("Helvetica").text(m.diagnostico || "—").moveDown(0.5);

    section(pdf, "Concepto de aptitud");
    pdf.fontSize(11).font("Helvetica").text(m.concepto || "—").moveDown(0.5);

    if (m.recomendaciones) {
        section(pdf, "Recomendaciones");
        pdf.fontSize(11).font("Helvetica").text(m.recomendaciones).moveDown(0.5);
    }

    if (m.restricciones) {
        section(pdf, "Restricciones");
        pdf.fontSize(11).font("Helvetica").text(m.restricciones).moveDown(0.5);
    }
}

function renderParaclinico(pdf, m) {
    field(pdf, "Paciente", m.paciente);
    field(pdf, "Cédula", m.cedula);
    field(pdf, "Fecha de toma", m.fecha);
    field(pdf, "Laboratorio", m.laboratorio);
    pdf.moveDown(0.5);

    section(pdf, "Resultados");

    const examenes = m.examenes || [];
    if (examenes.length === 0) {
        pdf.fontSize(11).font("Helvetica").text("Sin resultados registrados.").moveDown(0.5);
    } else {
        const colWidths = [180, 100, 130, 80];
        const headers = ["Examen", "Resultado", "Valor referencia", "Unidad"];
        const startX = 50;
        let y = pdf.y;

        pdf.fontSize(10).font("Helvetica-Bold");
        headers.forEach((h, i) => {
            const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
            pdf.text(h, x, y, { width: colWidths[i] });
        });
        pdf.moveDown(0.3);

        pdf.moveTo(50, pdf.y).lineTo(545, pdf.y).stroke().moveDown(0.3);

        pdf.font("Helvetica").fontSize(10);
        examenes.forEach((e) => {
            y = pdf.y;
            const row = [e.nombre, e.resultado, e.valorReferencia, e.unidad];
            row.forEach((val, i) => {
                const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                pdf.text(val || "—", x, y, { width: colWidths[i] });
            });
            pdf.moveDown(0.4);
        });
    }

    if (m.observaciones) {
        pdf.moveDown(0.5);
        section(pdf, "Observaciones");
        pdf.fontSize(11).font("Helvetica").text(m.observaciones);
    }
}

function renderExamenComplementario(pdf, m) {
    field(pdf, "Paciente", m.paciente);
    field(pdf, "Cédula", m.cedula);
    field(pdf, "Fecha", m.fecha);
    field(pdf, "Tipo de examen", m.tipoExamen);
    field(pdf, "Médico", m.medico);
    pdf.moveDown(0.5);

    section(pdf, "Hallazgos");
    pdf.fontSize(11).font("Helvetica").text(m.hallazgos || "—").moveDown(0.5);

    section(pdf, "Conclusión");
    pdf.fontSize(11).font("Helvetica").text(m.conclusion || "—").moveDown(0.5);

    if (m.recomendaciones) {
        section(pdf, "Recomendaciones");
        pdf.fontSize(11).font("Helvetica").text(m.recomendaciones);
    }
}

function renderFooter(pdf) {
    pdf
        .moveTo(50, pdf.y + 20)
        .lineTo(545, pdf.y + 20)
        .stroke()
        .moveDown(2)
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#888888")
        .text(
            "Documento generado electrónicamente por IPS Salud Ocupacional de los Andes. ",
            { align: "center" }
        );
}

function section(pdf, title) {
    pdf.fontSize(11).font("Helvetica-Bold").text(title).moveDown(0.2);
}

function field(pdf, label, value) {
    pdf
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${label}: `, { continued: true })
        .font("Helvetica")
        .text(value || "—");
}
