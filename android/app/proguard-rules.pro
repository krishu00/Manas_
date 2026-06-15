# ==============================================================================
# PDFBox / Image Filtering Optional Classes Fix
# ==============================================================================
-dontwarn com.tom_roush.pdfbox.filter.JPXFilter
-dontwarn com.gemalto.jp2.JP2Decoder

# If you use any standard markdown/image rendering tools that check for it:
-keep class com.tom_roush.pdfbox.** { *; }