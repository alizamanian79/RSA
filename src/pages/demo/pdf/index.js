import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

const PdfSigner = () => {
  const [file, setFile] = useState(null);
  const [signedPdf, setSignedPdf] = useState(null);

  // مدیریت انتخاب فایل
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // افزودن امضا به PDF
  const handleSignPdf = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // افزودن یک امضا به PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // محل قرارگیری امضا (مختصات)
      firstPage.drawText("امضا شده توسط Milad Hajilou", {
        x: 50,
        y: 50,
        size: 12,
        color: pdfDoc.constructor.rgb(1, 0, 0),
      });

      const signedPdfBytes = await pdfDoc.save();

      // ذخیره فایل PDF امضا‌شده
      const blob = new Blob([signedPdfBytes], { type: "application/pdf" });
      saveAs(blob, "signed-document.pdf");

      setSignedPdf(URL.createObjectURL(blob));
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2>افزودن امضا به PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleSignPdf} disabled={!file}>
        امضا و دانلود PDF
      </button>

      {signedPdf && (
        <iframe
          src={signedPdf}
          title="Signed PDF"
          width="100%"
          height="500px"
        ></iframe>
      )}
    </div>
  );
};

export default PdfSigner;
