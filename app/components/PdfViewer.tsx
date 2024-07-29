import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PdfViewerProps {
  pdfUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  const [pdfText, setPdfText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPdfText = async () => {
      try {
        const response = await axios.get(`/api/fetch-pdf-text?url=${encodeURIComponent(pdfUrl)}`);
        setPdfText(response.data.text);
        console.log('PDF text:', response.data.text);
      } catch (error) {
        console.error('Error fetching PDF text:', error);
        setPdfText('Error loading PDF text');
      } finally {
        setLoading(false);
      }
    };

    fetchPdfText();
  }, [pdfUrl]);

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-2">PDF Text</h3>
      {loading ? (
        <p>Loading PDF text...</p>
      ) : (
        <div className="bg-gray-700 p-4 rounded-lg max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">{pdfText}</pre>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
