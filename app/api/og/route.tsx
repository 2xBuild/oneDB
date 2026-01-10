import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'default';
    const title = searchParams.get('title') || 'oneDB';
    const description = searchParams.get('description') || 'Your one database for all resources, projects, and people';
    const category = searchParams.get('category') || '';
    const tags = searchParams.get('tags') || '';

    // Build the image using ImageResponse
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(to bottom right, #f0f0f0, #ffffff)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header with oneDB branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#000000',
                letterSpacing: '-0.02em',
              }}
            >
              oneDB
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 80px',
              maxWidth: '1000px',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: title.length > 50 ? '48px' : '64px',
                fontWeight: 'bold',
                color: '#000000',
                textAlign: 'center',
                marginBottom: '24px',
                lineHeight: '1.2',
                wordBreak: 'break-word',
              }}
            >
              {title}
            </div>

            {/* Description */}
            {description && (
              <div
                style={{
                  fontSize: '28px',
                  color: '#666666',
                  textAlign: 'center',
                  marginBottom: '32px',
                  lineHeight: '1.4',
                  maxHeight: '120px',
                  overflow: 'hidden',
                }}
              >
                {description.length > 120 ? `${description.substring(0, 120)}...` : description}
              </div>
            )}

            {/* Category and Tags */}
            {(category || tags) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {category && (
                  <div
                    style={{
                      fontSize: '20px',
                      color: '#ffffff',
                      backgroundColor: '#000000',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    {category}
                  </div>
                )}
                {tags && (() => {
                  const tagList = tags.split(',').slice(0, 3);
                  return (
                    <div
                      style={{
                        fontSize: '18px',
                        color: '#666666',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {tagList[0] && (
                        <span
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '6px',
                          }}
                        >
                          {tagList[0].trim()}
                        </span>
                      )}
                      {tagList[1] && (
                        <span
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '6px',
                          }}
                        >
                          {tagList[1].trim()}
                        </span>
                      )}
                      {tagList[2] && (
                        <span
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '6px',
                          }}
                        >
                          {tagList[2].trim()}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Type badge */}
            {type !== 'default' && (
              <div
                style={{
                  marginTop: '32px',
                  fontSize: '18px',
                  color: '#999999',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {type}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('Error generating OG image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}

