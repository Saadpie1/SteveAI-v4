import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Pages where ads ARE allowed to show
const ALLOWED_AD_PATHS = ['/', '/home', '/about', '/docs'];

export const AdBanner: React.FC<{ zone: 'top' | 'bottom' }> = ({ zone }) => {
  const location = useLocation();
  
  // Check if current page is allowed to show ads
  const shouldShowAd = ALLOWED_AD_PATHS.includes(location.pathname);

  useEffect(() => {
    if (!shouldShowAd) return;

    // Trigger ad network frame rendering on allowed routes
    try {
      // @ts-ignore
      if (window.atOptions) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('Ad load error:', e);
    }
  }, [location.pathname, shouldShowAd]);

  if (!shouldShowAd) return null;

  return (
    <div 
      className={`ad-container ad-${zone}`}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 0',
        backgroundColor: '#0d1117',
        borderBottom: zone === 'top' ? '1px solid #222' : 'none',
        borderTop: zone === 'bottom' ? '1px solid #222' : 'none',
      }}
    >
      {zone === 'top' ? (
        /* Top Banner (320x50 / 728x90) */
        <iframe
          srcDoc={`
            <html>
              <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:#0d1117;">
                <script>
                  var atOptions = {
                    'key' : '430ed421bfe51579161a3f297e041b1b',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                  };
                </script>
                <script src="https://www.highperformanceformat.com/430ed421bfe51579161a3f297e041b1b/invoke.js"></script>
              </body>
            </html>
          `}
          style={{ width: '320px', height: '50px', border: 'none' }}
          title="Ad Banner Top"
        />
      ) : (
        /* Bottom Banner */
        <iframe
          srcDoc={`
            <html>
              <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:#0d1117;">
                <script>
                  var atOptions = {
                    'key' : '4387492b60c39bf8e9b394dd040c5e83',
                    'format' : 'iframe',
                    'height' : 60,
                    'width' : 300,
                    'params' : {}
                  };
                </script>
                <script src="https://www.highperformanceformat.com/4387492b60c39bf8e9b394dd040c5e83/invoke.js"></script>
              </body>
            </html>
          `}
          style={{ width: '300px', height: '60px', border: 'none' }}
          title="Ad Banner Bottom"
        />
      )}
    </div>
  );
};
            
