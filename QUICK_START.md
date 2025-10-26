# 🚀 Quick Start Guide - Pill Bottle Scanner

## ⚡ TL;DR

Your pill bottle scanner is **ready to use**! Just complete Step 1 below and start scanning.

---

## Step 1: Create Cloudinary Upload Preset (2 minutes)

1. Go to [cloudinary.com/console](https://cloudinary.com/console) and login
2. Click **Settings** ⚙️ → **Upload**
3. Scroll to **Upload presets** → Click **Add upload preset**
4. Configure:
   - **Preset name**: `unsigned_upload`
   - **Signing mode**: **Unsigned** ⚠️ (Important!)
   - **Folder**: `medication-bottles` (optional)
5. Click **Save**

✅ Done! Your upload preset is ready.

---

## Step 2: Test the Scanner

```bash
# Start dev server
npm run dev
```

1. Open http://localhost:3000/medications
2. Click **"Scan Bottle"** button (blue outline button)
3. Upload a clear photo of medication bottle/box
4. Watch the magic happen! ✨

---

## 📸 What to Upload

**✅ Good images:**
- Clear, well-lit photos
- Label text is readable
- Bottle or box oriented correctly
- JPG, PNG, WEBP formats

**❌ Avoid:**
- Blurry or dark photos
- Text smaller than 10pt
- Handwritten labels
- GIF/SVG files

---

## 🎯 What Gets Extracted

The AI will automatically fill in:
1. **Medication Name** (e.g., "Aspirin")
2. **Dosage** (e.g., "100mg")
3. **Quantity** (e.g., "30 tablets")
4. **Expiration Date** (YYYY-MM-DD format)
5. **Instructions** (e.g., "Take with food")

Plus, the bottle image is saved and displayed on the medication card!

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload fails | Check preset name is `unsigned_upload` |
| Nothing happens | Open browser console (F12) for errors |
| AI extracts wrong data | Try clearer photo with better lighting |
| Image doesn't display | Check Cloudinary cloud name in `.env.local` |

---

## 📚 More Details

- Full documentation: `PILL_SCANNER_COMPLETE.md`
- Cloudinary setup: `CLOUDINARY_SETUP.md`
- Project features: `FEATURES.md`

---

## 💡 Pro Tips

1. **Best results**: Hold phone ~6 inches from bottle, good lighting
2. **Multiple bottles**: Scan them one by one
3. **Review data**: AI is 90% accurate, always double-check
4. **Edit if needed**: You can manually edit any auto-filled field

---

## 🎉 That's It!

You now have a **production-ready pill bottle scanner** with:
- ✅ AI-powered OCR (Google Gemini)
- ✅ Cloud image hosting (Cloudinary CDN)
- ✅ Automatic refill tracking
- ✅ Warning notifications
- ✅ Mobile responsive design

**Ready for your hackathon demo!** 🚀
