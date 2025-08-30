import React, { memo, useEffect, useState } from "react";

const HtmlRenderer = memo(({ htmlContent }) => {
  const [iframeRef, setIframeRef] = useState(null);

  useEffect(() => {
    if (iframeRef && htmlContent) {
      const doc = iframeRef.contentDocument || iframeRef.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  }, [iframeRef, htmlContent]);

  return (
    <div className="w-full flex justify-center">
      <div
        className="overflow-hidden"
        style={{ transform: "scale(0.85)", transformOrigin: "top", width: "95%" }}
      >
        <iframe
          ref={setIframeRef}
          title="Backtest Result"
          sandbox="allow-scripts allow-same-origin"
          className="w-full border-0"
          style={{ height: "1000px", width: "100%" }}
        />
      </div>
    </div>
  );
});

export default HtmlRenderer;
