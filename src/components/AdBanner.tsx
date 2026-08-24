import React from 'react';
import { useLocation } from 'react-router-dom';

// Pages where ads ARE allowed to show
const ALLOWED_AD_PATHS = ['/', '/home', '/about', '/docs'];

export const AdBanner: React.FC<{ zone: 'top' | 'bottom' }> = ({ zone }) => {
  const location = useLocation();
  
  // Check if current page is allowed to show ads
  const shouldShowAd = ALLOWED_AD_PATHS.includes(location.pathname);

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
        /* Top Banner (300x250 Medium Rectangle) */
        <iframe
          srcDoc={`
            <html>
              <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:#0d1117;">
                <script>
                  var atOptions = {
                    'key' : '74660bd3e7d7604e3c18709b14ed6f51',
                    'format' : 'iframe',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                  };
                </script>
                <script src="https://www.highrevenueformat.com/74660bd3e7d7604e3c18709b14ed6f51/invoke.js"></script>
              </body>
            </html>
          `}
          style={{ width: '300px', height: '250px', border: 'none' }}
          title="Ad Banner Top"
        />
      ) : (
        /* Bottom Banner (300x160 or Invoke Container) */
        <iframe
          srcDoc={`
            <html>
              <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:#0d1117;">
                <script async="async" data-cfasync="false" src="https://pl30970520.profitableratecpmnetwork.com/21559d7c813f7ddaf82b5781951a37ac/invoke.js"></script>
                <div id="container-21559d7c813f7ddaf82b5781951a37ac"></div>
              </body>
            </html>
          `}
          style={{ width: '320px', height: '160px', border: 'none' }}
          title="Ad Banner Bottom"
        />
      )}
    </div>
  );
};
