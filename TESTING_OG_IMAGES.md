# Testing Dynamic OG Images

This guide will help you verify that the dynamic Open Graph images are working correctly.

## 1. Test the OG Image API Directly

### In Browser
Open these URLs in your browser (replace `localhost:3000` with your domain if deployed):

**Default image:**
```
http://localhost:3000/api/og?type=default&title=oneDB&description=Your one database for all resources, projects, and people
```

**Apps page:**
```
http://localhost:3000/api/og?type=apps&title=Apps&description=Discover amazing apps and tools on oneDB
```

**With category and tags:**
```
http://localhost:3000/api/og?type=project&title=My Awesome Project&description=This is a cool project&category=Development&tags=react,nextjs,typescript
```

You should see a 1200x630px image with the oneDB branding and your content.

## 2. Check Page Metadata

### View Page Source
1. Navigate to any page (e.g., `/db/apps`, `/arena/project/[id]`)
2. Right-click → "View Page Source" (or `Cmd+Option+U` on Mac, `Ctrl+U` on Windows)
3. Search for `og:image` or `twitter:image`
4. You should see URLs like:
   ```html
   <meta property="og:image" content="http://localhost:3000/api/og?type=apps&title=Apps&description=..." />
   <meta name="twitter:image" content="http://localhost:3000/api/og?type=apps&title=Apps&description=..." />
   ```

### Using Browser DevTools
1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Go to the "Network" tab
3. Filter by "Img" or "Document"
4. Reload the page
5. Look for requests to `/api/og` - they should return images

## 3. Test with Online Validators

### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your page URL (must be publicly accessible)
3. Click "Preview card"
4. You should see your custom image preview

### Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your page URL
3. Click "Debug"
4. Check the "og:image" field - it should show your dynamic image URL

### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your page URL
3. Click "Inspect"
4. Check the preview - should show your custom image

### Open Graph Preview
1. Go to: https://www.opengraph.xyz/
2. Enter your page URL
3. View the preview

## 4. Test Individual Pages

### Project Page
1. Navigate to: `http://localhost:3000/arena/project/[some-project-id]`
2. View page source and check metadata
3. The OG image should include the project title and description

### Idea Page
1. Navigate to: `http://localhost:3000/arena/idea/[some-idea-id]`
2. View page source and check metadata
3. The OG image should include the idea title and description

## 5. Quick Test Script

Run this in your browser console on any page:

```javascript
// Check if OG image meta tags exist
const ogImage = document.querySelector('meta[property="og:image"]');
const twitterImage = document.querySelector('meta[name="twitter:image"]');

console.log('OG Image:', ogImage?.content);
console.log('Twitter Image:', twitterImage?.content);

// Test if image loads
if (ogImage?.content) {
  const img = new Image();
  img.onload = () => console.log('✅ OG Image loads successfully');
  img.onerror = () => console.error('❌ OG Image failed to load');
  img.src = ogImage.content;
}
```

## 6. Common Issues & Solutions

### Issue: Image returns 500 error
- **Check**: Server logs for errors
- **Solution**: Make sure the route is using `edge` runtime and Next.js 13+ features

### Issue: Image shows but is blank/white
- **Check**: Console for errors in the OG route
- **Solution**: Verify ImageResponse is working correctly

### Issue: Metadata not updating
- **Check**: Clear browser cache
- **Solution**: Use hard refresh (`Cmd+Shift+R` or `Ctrl+Shift+R`)

### Issue: Validators show old/cached image
- **Solution**: 
  - Facebook: Use "Scrape Again" button
  - Twitter: Wait a few minutes and try again
  - Clear cache in the validator tool

## 7. Production Testing

When deployed, test with your production URL:

```
https://yourdomain.com/api/og?type=default&title=oneDB&description=Test
```

Make sure `NEXT_PUBLIC_BASE_URL` environment variable is set correctly in production.

