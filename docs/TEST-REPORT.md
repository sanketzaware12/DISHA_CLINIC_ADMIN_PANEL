# Test report – Admin Panel (frontend phase)

Tests were run in headless Chromium (Playwright) against the delivered files opened from disk, with a real login, real clicks, and checks of what was written to `localStorage` and of what the preview frame actually shows.

## Result
- Page smoke test (every admin page opens, no JS errors): **15/15 pages OK**
- Functional suite 1 (editing, draft/publish, independence, media, validation): **31/31**
- Functional suite 2 (pages, legal, restore, export, add records): **23/23**
- Preview suite (real website page with draft edits): **15/15**
- Console/page errors: **none**

## Suite 1
| | Test |
|---|---|
| ✅ | Login works and opens dashboard |
| ✅ | Dashboard shows 7 services / 6 blogs / 21 pages / 131 media |
| ✅ | Homepage Builder lists 15 real sections |
| ✅ | Hero editor shows real heading |
| ✅ | Unsaved status badge shown |
| ✅ | Save Draft stores draft but NOT published copy |
| ✅ | Draft state badge |
| ✅ | Publish copies draft into published snapshot |
| ✅ | Version log has Draft + Published entries with snapshot |
| ✅ | Section reorder + hide persisted |
| ✅ | Herbal Products: exactly 2 products, no Add button |
| ✅ | FAQ: 10 existing, Add item works |
| ✅ | Validation blocks empty required FAQ question |
| ✅ | FAQ delete with confirmation |
| ✅ | Editing Piles changes only Piles |
| ✅ | Services list: 7 real services |
| ✅ | Service card title stored once (feeds home + listing) |
| ✅ | Blog edit affects only that article |
| ✅ | Blog list: 6 articles |
| ✅ | Media: 131 images listed |
| ✅ | Media usage detection splits used/unused |
| ✅ | Delete blocked for site image / in-use image |
| ✅ | Upload adds image to library (data stored, path generated) |
| ✅ | Settings validation/preview works |
| ✅ | Global phone stored once; content keeps {{token}} |
| ✅ | Testimonials start empty (no demo reviews) |
| ✅ | SEO lists all 21 pages |
| ✅ | Version history shows real entries |
| ✅ | Appointments page shows backend-pending notice |
| ✅ | Products hidden from sidebar, page explains merge |
| ✅ | No JS errors during whole run |

## Suite 2
| | Test |
|---|---|
| ✅ | Page Management lists the 5 real static pages + links to other modules |
| ✅ | About has 10 real sections |
| ✅ | About credentials image field has preview |
| ✅ | About edit saved to About only |
| ✅ | Privacy: real policy sections loaded |
| ✅ | Rich text edit saved |
| ✅ | Contact: required heading validation |
| ✅ | Pick image from library into a section |
| ✅ | Picked image path saved |
| ✅ | Doctors: 1 real doctor |
| ✅ | Testimonial added to content store (Pending) |
| ✅ | SEO row opens |
| ✅ | Settings shows placeholder warning |
| ✅ | Closed day stored |
| ✅ | URL validation blocks invalid URL |
| ✅ | Second publish stored |
| ✅ | History has entries |
| ✅ | Restore puts previous published version back into DRAFT only |
| ✅ | Export published JSON downloads |
| ✅ | Add Blog creates draft record and opens editor |
| ✅ | Add Service clones 26-section structure, hidden by default |
| ✅ | Only new services show delete button |
| ✅ | No JS errors |

## Preview suite
| | Test |
|---|---|
| ✅ | Preview opens the real homepage (sections, header, footer) |
| ✅ | Edited hero heading shows in real page |
| ✅ | Edited hero description shows |
| ✅ | Edited FAQ question shows |
| ✅ | Hidden Statistics section is hidden in preview |
| ✅ | Replaced hero image applied |
| ✅ | Status line reports applied changes |
| ✅ | Global phone change shows in header/footer/links |
| ✅ | Service page preview applies section edits |
| ✅ | Blog preview: title + rich article text edit |
| ✅ | Preview opens real page: ?page=about |
| ✅ | Preview opens real page: ?page=contact |
| ✅ | Preview opens real page: ?page=privacy |
| ✅ | Preview opens real page: ?page=booking |
| ✅ | No JS errors in admin |

## Bugs found and fixed during testing
- Settings values (phone, e-mail, URL…) had been stored as `{{tokens}}` themselves; now stored as real values (content version 1.0.1).
- Reordering sections threw a JS error; adding a service/blog produced sections without ids; page-level titles were applied to the wrong element in preview. All fixed and re-tested.

## NOT tested (be aware)
- Real backend, real publishing to the website, real image storage (none exists yet; everything is `localStorage`).
- Appointment/enquiry submission and status workflow (needs the backend).
- Mobile/tablet layout of the editors, keyboard/screen-reader use, Safari and Firefox.
- Preview does not show added/removed list items or section order (it says so); only a few pages were checked visually, with Tailwind built locally and Lucide icons stubbed (CDNs unreachable in the test environment). Please look at icons/spacing once in your own browser.
