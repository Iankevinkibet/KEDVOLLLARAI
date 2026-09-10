# KevDollarFX AdSense setup

## What is already installed

The Google AdSense Auto Ads loader supplied for publisher `ca-pub-5671905101681007` is now included in the `<head>` of every HTML page in this site. This allows Google to serve the Auto Ads formats enabled in the AdSense account, including in-page banner ads, anchor ads, and vignette ads.

A shared `adsense.css` file and `adsense-placements.js` file have also been added. Every page has a top-of-page placement before its page header and a footer placement inside its footer. These fixed placements remain hidden until valid ad-unit slot IDs are configured, so the site does not send malformed requests using a publisher ID as if it were a slot ID.

## Enable ads before a page opens

In AdSense, open **Ads > your site > Auto ads** and enable **Auto ads**, **Vignette ads**, and **Anchor ads** as desired. Vignette ads are the AdSense format that can appear between page loads; Google decides when an eligible ad is shown, so the site cannot force an ad on every navigation.

## Configure the top and footer display units

1. In AdSense, create two responsive Display ad units: one for the top placement and one for the footer placement.
2. Copy each unit's numeric `data-ad-slot` value.
3. Open `adsense-placements.js` and replace the empty values:

```js
window.KEV_ADSENSE_SLOTS = {
  top: 'YOUR_TOP_AD_SLOT_ID',
  footer: 'YOUR_FOOTER_AD_SLOT_ID'
};
```

4. Upload `adsense-placements.js`, `adsense.css`, and all updated HTML files together.

The `data-ad-slot` values are intentionally not guessed here because they are created inside the publisher's AdSense account. The publisher ID in the supplied script identifies the account, but it is not a fixed ad-unit slot ID.

## Video ads

The supplied Auto Ads loader does **not** create arbitrary video pre-roll or footer video ads. Video advertising requires a video player plus a Google IMA/AdSense for video-compatible ad tag or Google Ad Manager setup, and eligibility depends on the account and inventory. No video player or video ad tag was present in the supplied ZIP, so no non-working video code was injected. Add the video integration only after Google provides the appropriate video ad tag and confirms the account is eligible.

## Verification

AdSense may take time to review a site and begin serving ads. Test with browser developer tools and the AdSense publisher controls; do not click your own ads. If an ad unit is unfilled, Google may leave the placement blank.


## Addsterra / external learning ads added

The supplied Addsterra, Profitablerate CPM, and HighRevenueFormat snippets are included on all 24 pages. The first script is immediately before `</head>`, the second Profitablerate script is immediately before `</body>`, and the linked/native/banner/rectangle/skyscraper/leaderboard units are grouped in the body before the footer so learners can continue through the page without an ad interrupting the lesson steps.

The hyperlink is marked as `sponsored nofollow` and opens in a new tab. The external scripts are third-party code and may be controlled by their ad network after deployment.

**Important:** the container ID in the supplied native snippet was written as `contai*****e0`, with asterisks. That masked value was preserved exactly in the package, but the native unit may not render until the complete container ID is supplied by the ad network. Replace it with the unmasked ID if Addsterra gave you one.
