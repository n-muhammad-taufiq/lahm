import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

declare const process: { env: Record<string, string | undefined> };

export interface FirebaseRecaptchaVerifierRef {
  verify(): Promise<string>;
  reset(): void;
  _reset(): void;
  clear(): void;
  render(): Promise<number>;
  readonly type: string;
}

export interface FirebaseRecaptchaModalProps {
  firebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
  };
  siteKey?: string;
  title?: string;
  cancelLabel?: string;
  onVerify?: (token: string) => void;
}

/**
 * 100% Invisible Firebase Phone Auth reCAPTCHA Verifier
 * - Verifies silently in the background with ZERO popup or loading flash.
 * - Only reveals an interactive card if Google explicitly challenges the user with a visual puzzle.
 */
export const FirebaseRecaptchaModal = forwardRef<
  FirebaseRecaptchaVerifierRef,
  FirebaseRecaptchaModalProps
>(({ firebaseConfig, siteKey, title = 'Security Verification', cancelLabel = 'Cancel', onVerify }, ref) => {
  const [challengeVisible, setChallengeVisible] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const resolverRef = useRef<((token: string) => void) | null>(null);
  const rejecterRef = useRef<((error: Error) => void) | null>(null);

  const authDomain =
    firebaseConfig?.authDomain ||
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'lahm-app.firebaseapp.com';

  const siteKeyToUse =
    siteKey ||
    process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY ||
    '6LcMZR0UAAAAALgPMcgHwga7gY5p8QMg1Hj-bmUv';

  const resetWidget = () => {
    setChallengeVisible(false);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.grecaptcha && window.recaptchaWidgetId !== undefined) {
          window.grecaptcha.reset(window.recaptchaWidgetId);
        }
        true;
      `);
    }
  };

  useImperativeHandle(ref, () => ({
    type: 'recaptcha',
    verify: () => {
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          if (resolverRef.current) {
            resolverRef.current = null;
            rejecterRef.current = null;
            reject(new Error('reCAPTCHA verification timed out.'));
          }
        }, 2500);

        resolverRef.current = (token: string) => {
          clearTimeout(timer);
          resolve(token);
        };
        rejecterRef.current = (err: Error) => {
          clearTimeout(timer);
          reject(err);
        };

        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.grecaptcha && window.recaptchaWidgetId !== undefined) {
              try {
                grecaptcha.execute(window.recaptchaWidgetId);
              } catch(e) {
                post({ type: 'error', error: e.message });
              }
            } else {
              window._pendingExecute = true;
            }
            true;
          `);
        }
      });
    },
    reset: resetWidget,
    _reset: resetWidget,
    clear: resetWidget,
    render: () => Promise.resolve(0),
  }));

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'challenge') {
        // Google requires interactive visual puzzle challenge
        setChallengeVisible(true);
      } else if (data.type === 'success' && data.token) {
        setChallengeVisible(false);
        if (resolverRef.current) {
          resolverRef.current(data.token);
          resolverRef.current = null;
        }
        if (onVerify) {
          onVerify(data.token);
        }
      } else if (data.type === 'error') {
        setChallengeVisible(false);
        if (rejecterRef.current) {
          rejecterRef.current(new Error(data.error || 'reCAPTCHA verification failed.'));
          rejecterRef.current = null;
        }
      }
    } catch {
      // Ignore non-json messages
    }
  };

  const handleCancel = () => {
    setChallengeVisible(false);
    resetWidget();
    if (rejecterRef.current) {
      rejecterRef.current(new Error('Verification cancelled by user.'));
      rejecterRef.current = null;
    }
  };

  // Google reCAPTCHA HTML loaded inside secure authDomain context
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          #recaptcha-container {
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
        <script>
          function post(msg) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }
          }

          function onRecaptchaLoaded() {
            try {
              if (window.recaptchaWidgetId !== undefined) return;
              window.recaptchaWidgetId = grecaptcha.render('recaptcha-container', {
                'sitekey': '${siteKeyToUse}',
                'size': 'invisible',
                'callback': function(token) {
                  post({ type: 'success', token: token });
                },
                'expired-callback': function() {
                  post({ type: 'error', error: 'expired' });
                },
                'error-callback': function() {
                  post({ type: 'error', error: 'failed' });
                }
              });

              post({ type: 'ready' });

              if (window._pendingExecute) {
                window._pendingExecute = false;
                grecaptcha.execute(window.recaptchaWidgetId);
              }
            } catch (err) {
              post({ type: 'error', error: err.message });
            }
          }

          // Monitor if Google renders an interactive visual challenge
          function checkChallenge() {
            try {
              var iframes = document.querySelectorAll('iframe[src*="bframe"], iframe[title*="challenge"]');
              for (var i = 0; i < iframes.length; i++) {
                var el = iframes[i];
                var rect = el.getBoundingClientRect();
                if (rect.width > 50 && rect.height > 50) {
                  post({ type: 'challenge' });
                  break;
                }
              }
            } catch(e) {}
          }

          var observer = new MutationObserver(checkChallenge);
          observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        </script>
        <script src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit" async defer onerror="post({ type: 'error', error: 'recaptcha_script_load_failed' })"></script>
      </head>
      <body>
        <div id="recaptcha-container"></div>
      </body>
    </html>
  `;

  return (
    <View
      pointerEvents={challengeVisible ? 'auto' : 'none'}
      style={challengeVisible ? styles.overlayContainer : styles.hiddenContainer}>
      <SafeAreaView style={challengeVisible ? styles.modalOverlay : styles.hiddenOverlay}>
        <View style={challengeVisible ? styles.modalCard : styles.hiddenCard}>
          {challengeVisible ? (
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={handleCancel} hitSlop={8}>
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={challengeVisible ? styles.webViewContainer : styles.hiddenWebViewContainer}>
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{
                html: htmlContent,
                baseUrl: `https://${authDomain}`,
              }}
              onMessage={handleMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scalesPageToFit={true}
              style={challengeVisible ? styles.webView : styles.hiddenWebView}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
});

FirebaseRecaptchaModal.displayName = 'FirebaseRecaptchaModal';

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    width: 300,
    height: 300,
    opacity: 0,
    overflow: 'hidden',
  },
  hiddenOverlay: {
    width: 300,
    height: 300,
  },
  hiddenCard: {
    width: 300,
    height: 300,
  },
  hiddenWebViewContainer: {
    width: 300,
    height: 300,
  },
  hiddenWebView: {
    width: 300,
    height: 300,
    backgroundColor: 'transparent',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    height: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2D8CD',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1C1611',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E77A62',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
