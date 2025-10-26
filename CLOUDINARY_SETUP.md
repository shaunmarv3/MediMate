# Cloudinary Setup Instructions

## Creating an Unsigned Upload Preset

To enable the pill bottle scanner feature with Cloudinary image hosting, you need to create an **unsigned upload preset** in your Cloudinary dashboard.

### Steps:

1. **Login to Cloudinary**
   - Go to [cloudinary.com](https://cloudinary.com) and login with your account

2. **Navigate to Upload Settings**
   - Click on **Settings** (gear icon) in the top-right corner
   - Select **Upload** from the left sidebar

3. **Create Upload Preset**
   - Scroll down to **Upload presets** section
   - Click **Add upload preset**

4. **Configure the Preset**
   - **Preset name**: `unsigned_upload` (must match the value in `.env.local`)
   - **Signing mode**: Select **Unsigned**
   - **Folder**: Leave empty or set to `medication-bottles`
   - **Allowed formats**: `jpg, png, jpeg, webp, heic`
   - **Max file size**: `10 MB` (recommended)
   - **Resource type**: `Image`

5. **Save the Preset**
   - Click **Save** at the bottom

### Verify Configuration

Your `.env.local` file should have these values:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dx0znhi8d
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_upload
```

### Test the Integration

1. Start the dev server: `npm run dev`
2. Go to **Medications** page
3. Click **Scan Bottle** button
4. Upload a clear image of a medication bottle
5. Watch the AI extract the medication details automatically! 🎉

### Troubleshooting

- **Upload fails**: Check that the preset name matches exactly (`unsigned_upload`)
- **Security error**: Ensure **Signing mode** is set to **Unsigned**
- **CORS error**: Cloudinary handles CORS automatically for unsigned uploads
- **Image not displaying**: Check browser console for 403 errors (incorrect cloud name)

### Security Note

Unsigned uploads are safe for this use case because:
- Users can only upload to the `medication-bottles` folder
- File size is limited to 10 MB
- Only image formats are allowed
- Cloudinary automatically scans for malicious content

For production, consider:
- Enabling **Moderation** in the preset settings
- Setting up **Resource limitations**
- Implementing **Rate limiting** on your backend
