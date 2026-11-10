# Platform rules and algorithm facts for a comment- and follower-driven short-video series (TikTok, Instagram Reels, YouTube Shorts, 2025/2026, small accounts)

Research date: 10.11.2026. About 15 tool calls. Pages fetched directly are marked "official, fetched". Anything taken from search summaries or secondary blogs is marked as such. Facts that could not be checked in this session are listed under Gaps and must not be treated as confirmed.

## 1. Engagement bait: what TikTok, Meta and YouTube say about asking for follows, likes and comments

### Takeaway
None of the three platforms bans plain participatory prompts such as "comment what should be built next". YouTube explicitly allows asking for likes, comments and subscriptions. What gets penalised is (a) content that exists *only* to collect engagement or that coerces or tricks people into it (YouTube, TikTok), (b) "manipulating people into inflating likes or follows", which makes a video ineligible for the For You feed (TikTok), and (c) on Facebook/Meta, classic "comment bait / vote bait / follow bait" phrasings, which are demoted. The safe design is an open, story-relevant question ("Was soll als Nächstes auf der Insel entstehen?"). The risky one is a mechanical demand ("Folge, sonst …", "Like = Ja, Kommentar = Nein", "Kommentiere 🏠, wenn …").

### Cited Findings
**TikTok (official, fetched; Community Guidelines "Integrity and Authenticity", released 25.08.2026, effective 24.09.2026):**
- "Content that tries to manipulate people into giving gifts or inflating likes or follows isn't eligible for the FYF." — [TikTok CG Integrity & Authenticity](https://www.tiktok.com/community-guidelines/en/integrity-authenticity)
- TikTok does not allow "the trade of services that artificially boost engagement or trick the recommendation system", and: "If we detect accounts or content with inauthentic metrics, we'll remove fake likes, followers, or other inflated signals." — [same](https://www.tiktok.com/community-guidelines/en/integrity-authenticity)
- "We strictly prohibit automation tools, scripts, or other tricks designed to bypass our systems." — [same](https://www.tiktok.com/community-guidelines/en/integrity-authenticity)
- The fetched page does **not** use the terms "engagement bait", "follow-for-follow" or "like-for-like", and does not prohibit simply asking for comments. — [same](https://www.tiktok.com/community-guidelines/en/integrity-authenticity)
- FYF standards page (effective 24.09.2026): "If a video isn't getting many views, it also doesn't necessarily mean it broke a rule." TikTok also aims "to prevent our systems from repeatedly recommending content that could lead to a negative experience". — [TikTok FYF Standards](https://www.tiktok.com/community-guidelines/en/fyf-standards)

**YouTube (official, fetched; Fake engagement policy, no date shown on page, ©2026):**
- "You're allowed to encourage viewers to subscribe, hit the like button, share, or leave a comment." — [YouTube Help: Fake engagement policy](https://support.google.com/youtube/answer/3399767?hl=en)
- Prohibited: "content that solely exists to incentivize viewers for engagement (views, likes, comments, etc)". Also prohibited: "Offering to subscribe to another creator's channel only if they subscribe to your channel ("sub4sub")". — [same](https://support.google.com/youtube/answer/3399767?hl=en)
- "We consider engagement to be legitimate when a human user's primary intent is to authentically interact with the content." — [same](https://support.google.com/youtube/answer/3399767?hl=en)
- The page does not mention contests or giveaways. — [same](https://support.google.com/youtube/answer/3399767?hl=en)

**Meta / Facebook (secondary sources; the original policy is from December 2017):**
- Facebook defined **comment baiting** as asking users to reply with a specific word, number, phrase or emoji (example: comment "Yes" if you enjoy rock music) and **vote baiting** as asking people to vote through reactions, comments or shares. Such posts were demoted, not removed. Repeat offenders faced page-wide demotion. Requests for help, advice or recommendations were exempt. — [Search Engine Journal](https://www.searchenginejournal.com/facebook-demoting-engagement-bait/228071); [MobileSyrup](https://mobilesyrup.com/2017/12/18/facebook-spam-engagement-bait-posts/); [Fox News](https://www.foxnews.com/tech/facebook-starts-demoting-engagement-bait-posts)
- Detection relied on a machine-learning classifier trained on "hundreds of thousands" of labelled engagement-bait posts. — [Search Engine Journal](https://www.searchenginejournal.com/facebook-demoting-engagement-bait/228071)
- I tried to fetch Meta's current Recommendation Guidelines at transparency.meta.com/features/recommendation-guidelines and got HTTP 404 (URL moved), so I have no verified current text. — (fetch attempt)

### Inferences
- The "Deine Welt" mechanic ("the top comment decides the next build") is a real narrative choice, so it reads as authentic interaction. That fits YouTube's "legitimate engagement" definition. It is not "solely to incentivize".
- The riskiest phrasings are the ones that look like vote baiting to a classifier: "Like diesen Kommentar, wenn …", "Schreib 1 für Turm, 2 für Brücke", "Folge, um Einwohner zu werden" as a direct demand. Meta's vote-bait definition ("cast a vote through reactions/comments") fits "like the comment you want" closely. Keep the call in the narration open and descriptive ("Der Kommentar mit den meisten Likes entscheidet, was gebaut wird"), and avoid number or emoji codes and "Like if…" phrasing.
- TikTok's FYF clause is about *manipulating* people into follows ("follow or something bad happens", "follow to unlock", fake giveaways). A neutral statement of the series rule ("Jeder Follower wird Einwohner") is probably fine. An urgent, repeated "folgt jetzt!" CTA in every video moves towards the clause. This is interpretation: there is no published TikTok example list in the fetched text.

### Gaps
- Exact current Meta text (Instagram Recommendations Guidelines / Facebook Content Distribution Guidelines on "engagement bait") could not be retrieved (404). Whether Meta still applies the 2017 categories to Instagram Reels in 2026 is unverified.
- The TikTok page was truncated. The section on "unoriginal content" and FYF ineligibility for low-quality or reposted content was not fully read.
- I found no official TikTok wording that explicitly allows "comment what happens next" prompts. It is simply not listed as prohibited.

## 2. Tying an in-video counter to follower count ("1 follower = 1 inhabitant"): follow-gating or artificial inflation?

### Takeaway
No source found treats showing your own real follower count inside the video as a violation. The rules target *fake or traded* engagement (bought followers, sub4sub, automation) and content made *solely* to collect engagement. Rewarding real follows with a visible in-story effect is a grey zone only if it turns into an explicit exchange ("follow and you get X") or dominates the video.

### Cited Findings
- YouTube prohibits sub4sub, which is a reciprocal follow exchange, and content that "solely exists to incentivize viewers for engagement". — [YouTube Help](https://support.google.com/youtube/answer/3399767?hl=en)
- TikTok: content that "tries to manipulate people into … inflating likes or follows isn't eligible for the FYF". — [TikTok CG](https://www.tiktok.com/community-guidelines/en/integrity-authenticity)
- YouTube: engagement is legitimate when the "primary intent is to authentically interact with the content", and illegitimate when it is coerced, deceptive or done purely for financial gain (fetched summary). — [YouTube Help](https://support.google.com/youtube/answer/3399767?hl=en)

### Inferences
- Showing "142 Einwohner" because the channel has 142 followers is a story device that reflects a real number. It does not inflate anything. The risk lies in the *call*: "Folge, damit du Einwohner wirst" is an incentive for a follow. That is probably acceptable as long as the video has a story of its own and this is not its sole purpose (YouTube). It is safer if the CTA is short, appears once, and is not phrased as a threat or a reward unlock (TikTok FYF clause).
- Never use follow-for-follow, "folgt euch gegenseitig", giveaways for follows or paid promotion services. Those clearly fall under fake engagement.

### Gaps
- I found no documented enforcement cases or creator reports specific to "follower = citizen/inhabitant" mechanics on any platform. Neither confirmation nor penalty is documented.

## 3. How the recommendation systems weight comments, comment likes, shares, saves, follows, watch time and rewatches

### Takeaway
Instagram officially names **watch time, likes per reach and sends per reach** as the top three signals. Sends (DM shares) correlate most with reach to non-followers. YouTube Shorts counts every start or replay as a view since 31.03.2025, but monetisation and comparisons use "engaged views". For TikTok, the official "How TikTok recommends content" page (user interactions such as likes, shares, comments, watching to the end, follows; video information; device settings) could not be re-verified this session. Comments matter on all three, but no platform publishes a weight for comment *likes*.

### Cited Findings
- Mosseri (January 2025): "The top three signals that matter most for ranking are watch time, likes and sends". Creators should watch average watch time, likes per reach and sends per reach in Insights. — [Social Media Today](https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/)
- Mosseri (2024 Q&A, widely cited): "sends per reach correlate more, in my experience, with overall reach than anything else". — reported via [Social Samosa](https://www.socialsamosa.com/news-2/instagram-reveals-key-factors-for-boosting-reach-8646916) (secondary)
- Claims that sends are weighted "3–5x" likes have no primary source. Treat them as blog speculation. — [dataslayer.ai](https://www.dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers) (secondary, unverified)
- YouTube Shorts (announced 26.03.2025, live 31.03.2025): a view counts whenever a Short starts or replays, with no minimum watch time. The old metric survives as "engaged views" (Analytics, Advanced Mode). YPP eligibility and Shorts revenue sharing are based on engaged views. — [PPC Land](https://ppc.land/youtube-changes-how-shorts-views-are-counted-from-march-31/); [Digital Music News](https://www.digitalmusicnews.com/2025/03/27/how-does-youtube-shorts-count-views-2025/); [Entrepreneur](https://www.entrepreneur.com/business-news/youtube-shorts-will-see-more-view-counts-earnings/489190)

### Inferences
- For a series like this: the hook and completion drive watch time, replays count as additional views (Shorts) and as rewatch signals. "Show your friend their inhabitant" is a natural *send* prompt on Instagram, the strongest reach signal for non-followers, and it is not engagement bait if phrased as content ("Schick das jemandem, der auch auf der Insel wohnt").
- Comment volume helps the video. The likes on individual comments are only the selection mechanic. Telling people to like *comments* produces no documented ranking benefit for the video itself.

### Gaps
- The official TikTok "How TikTok recommends content" page (newsroom.tiktok.com, 2020; support page) was not fetched this session. No 2025/2026 official TikTok weighting is available.
- YouTube's "viewed vs swiped away" metric for Shorts is known from YouTube Studio, but I did not verify official text this session.

## 4. Small accounts: initial distribution, posting frequency, deleting/reposting, cross-posting, watermarks, scheduler APIs

### Takeaway
The confirmed hard facts are: Instagram removes reposted or aggregated content from recommendations and suppresses watermarked (for example TikTok-watermarked) videos. Our own original animation is fine, but every upload must be the clean file without another platform's watermark. On TikTok, the Content Posting API only posts privately (`SELF_ONLY`) for unaudited apps, posts are capped at about 15 per creator per day, and API apps must not add a watermark. Whether Zernio is an audited client follows from whether our posts appear publicly. Since earlier posts went out publicly, it apparently is. I found no official evidence that API or scheduler posting is ranked lower.

### Cited Findings
- TikTok for Developers, Content Sharing Guidelines (last updated 04.08.2026): for unaudited clients, "all content uploaded via this endpoint will be restricted to private viewing mode" (`SELF_ONLY`), capped at "up to 5 users to post in a 24 hour window". There is a per-creator cap of "typically around 15 posts per day/ creator account", shared across all Direct Post clients. Apps must not "superimpose or otherwise include any brand name, logo, watermark". Users must be able to edit title and hashtags. Privacy has "no default value". Comment, Duet and Stitch toggles must be set manually. The page does not mention an AIGC flag. — [TikTok Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines) (official, fetched)
- Instagram (2024, extended to photos and carousels in April 2026): reposted or aggregator content is removed from recommendations and replaced by the original. A border, watermark or caption credit does not count as transformation. Followers still see the content, but discovery surfaces do not. — [Tubefilter 30.04.2026](https://tubefilter.com/2026/04/30/instagram-removes-algorithm-recommendations-repost-content-aggregator); [PetaPixel 30.04.2026](https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/); [Android Central](https://www.androidcentral.com/apps-software/instagrams-new-ranking-system-prioritizes-original-content)
- Instagram has confirmed that watermarked content (for example TikTok-logo reposts) gets suppressed (search summary, secondary). — [Fast Company](https://www.fastcompany.com/90744109/instagram-tiktok-algorithm-adam-mosseri)
- Mosseri told aggregators to make their own content so their posts keep being recommended to non-followers. — [Tubefilter](https://tubefilter.com/2026/04/30/instagram-removes-algorithm-recommendations-repost-content-aggregator)

### Inferences
- Cross-posting the *same own* video to all three platforms is fine as long as the file is clean: no TikTok watermark or end-card on Instagram/YouTube. Originality is judged by who created it, and we are the creator.
- Instagram "Trial Reels" (shown first to non-followers) would suit small accounts. There is no verified source this session on availability or thresholds (see Gaps).
- Deleting and reposting a weak video is not documented as penalised or rewarded in official sources. If the same file is reposted, Instagram's originality and duplicate detection could treat it as a repost. Not verified.

### Gaps
- Official TikTok statements on test batches for new accounts, the YouTube Shorts "exploration" phase for small channels, and Instagram Trial Reels (launched December 2024; availability and the professional-account requirement) were not verified this session.
- No official source on whether third-party scheduler posts reach less. This is a common creator myth with no primary evidence found.
- Posting frequency: no official 2025/2026 statement found this session (Mosseri has said in the past that frequency matters less than quality; unverified).

## 5. AI and synthetic media: labelling the AI TTS narrator over original 2D animation; reach and monetisation effects

### Takeaway
YouTube does **not** require disclosure for unrealistic or animated content, and says that disclosure alone does not limit reach or monetisation. TikTok requires labelling of "AI-generated or significantly edited content" (with stricter focus on realistic content). The exact TikTok scope for a synthetic narrator voice over non-realistic animation could not be verified. The bigger risk is not the label. It is YouTube's July 2025 "inauthentic content" monetisation rule against templated, mass-produced videos, plus the originality rules on TikTok and Instagram. A daily, recognisably templated AI-voice series has to vary visibly from episode to episode.

### Cited Findings
- YouTube (official, fetched): disclosure is required for content that "Makes a real person appear to say or do something they didn't do", "Alters footage of a real event or place", "Generates a realistic scene that didn't actually occur", or "Creates music that's the main focus of the video". Also: "Realistic AI content and meaningful changes require disclosure, while non-realistic or minor edits don't." Creators "don't need to disclose non-realistic content that's made with AI" (example: an animated missile in a fully animated video). AI help with script, outline, thumbnail, title and captions counts as a minor edit. Further: "Disclosing AI content alone won't limit a video's audience or impact its eligibility to earn money". Consistent non-disclosure (where required) can lead to a forced label, removal or YPP suspension. — [YouTube Help: Disclosing altered or synthetic content](https://support.google.com/youtube/answer/14328491?hl=en)
- TikTok (official, fetched): "we require creators to label AI-generated or significantly edited content"; "Unlabeled content may be removed, restricted, or labeled by our team, depending on the harm it could cause." — [TikTok CG Integrity & Authenticity](https://www.tiktok.com/community-guidelines/en/integrity-authenticity)
- YouTube YPP (15.07.2025): the "repetitious content" policy was renamed "inauthentic content", targeting mass-produced or repetitive content that "looks like it was made with a template with little to no variation across videos, or content that is easily replicable at scale". AI voices are not banned as such. Secondary sources disagree on how much an AI voice weighs in. — [Creator Handbook](https://www.creatorhandbook.net/youtube-updates-monetization-policy-for-inauthentic-content/); [vidIQ blog](https://vidiq.com/blog/post/youtube-ai-monetization/); [Social Samosa](https://www.socialsamosa.com/news-2/youtube-tightens-monetisation-rules-block-ai-content-9480642) (all secondary)

### Inferences
- YouTube: a Gemini TTS narrator over stylised flat-vector animation is "non-realistic". The "Altered or synthetic content" box can stay unchecked. A voluntary label would not hurt (official).
- TikTok: the narrator is a synthetic voice, not a real person's voice, and the visuals are not AI-generated. The cautious choice is to turn on TikTok's AIGC label anyway, because unlabelled AIGC can be "restricted". This conflicts with the project's rule "KI-Haken beim Posten immer aus" (Issue #15, Zernio's `videoMadeWithAi: false`). **This is a real tension the report writer should flag.** TikTok's text requires labels for "AI-generated or significantly edited content". Whether an AI voice-over alone triggers that is unverified.
- Meta "AI info": the label is applied to photorealistic AI images/video or via C2PA/IPTC metadata. Gemini TTS audio may carry SynthID watermarks, but no source verified whether Meta auto-labels audio. Unverified.
- Monetisation risk on YouTube rises with sameness: identical intro, identical structure, identical narration template every day. Varied builds, new scenes, and the visible use of real viewer comments speak *for* authenticity.

### Gaps
- The exact current TikTok AIGC help page (support FAQ id 7636670084747893268) returned no content. Whether an AI voice over own animation requires the label is unverified.
- Meta's current "AI info" rules (Help Center) were not fetched.
- TikTok Creator Rewards originality rules for AI voices were not verified.
- The official YouTube YPP "inauthentic content" help text was not fetched (only secondary sources).

## 6. Monetisation thresholds (Germany/EU)

### Takeaway
With about 140 followers in total, none of the programs is within reach. According to secondary sources: TikTok Creator Rewards needs 10,000 followers, 100,000 views in 30 days and videos over 1 minute, and Germany is listed as an eligible country. The YouTube Partner Program, Shorts path, needs 1,000 subscribers plus 10 million engaged Shorts views in 90 days (full ad revenue). The lower "expanded" tier is 500 subscribers plus 3 million Shorts views (secondary and partly unverified).

### Cited Findings
- TikTok Creator Rewards in Germany: 10,000 followers and 100,000 views in the last 30 days. Germany is listed among eligible markets. Applications go through TikTok Studio. The RPM depends on qualified views and watch time. — [Fluxnote](https://fluxnote.io/guides/tiktok-pay-germany-1-million-views); [ttcalculator](https://ttcalculator.net/data/reference/creator-fund-countries/) (secondary, not officially confirmed)
- Videos must be "1+ minute" (secondary). — [Metricool](https://metricool.com/tiktok-creator-next/)
- YPP Shorts path: 10 million valid (engaged) Shorts views in 90 days for full ad-revenue monetisation. Engaged views remain the basis for YPP. — [Digital Music News](https://www.digitalmusicnews.com/2025/03/27/how-does-youtube-shorts-count-views-2025/); [PPC Land](https://ppc.land/youtube-changes-how-shorts-views-are-counted-from-march-31/) (secondary)

### Inferences
- "Deine Welt" episodes of 60–70 s would fall just over the TikTok 1-minute line. That is relevant only much later.

### Gaps
- Official TikTok Creator Rewards terms for Germany were not fetched. Whether the minimum length is exactly "over 1 minute" is unconfirmed.
- The YPP subscriber thresholds (1,000/500) were not verified this session.
- Instagram monetisation options in Germany (Gifts, Subscriptions, bonuses) were not researched due to the call budget.

## 7. Comment tooling: pinning, filters, video replies, polls, API access to comments and comment likes

### Takeaway
Not verified in this session because the call budget was used up. This chapter needs a follow-up check or another researcher's notes.

### Cited Findings
- Only the following was found: TikTok's posting API requires that the Comment, Duet and Stitch toggles are not pre-checked and that the user sets them manually. — [TikTok Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines)

### Inferences
- For "top comment decides", comments must be explicitly enabled on every API post (Zernio settings). A post with comments off would break the mechanic.

### Gaps
- Not verified: TikTok pinned comments, keyword filters and video replies; YouTube pinning, hearting, "held for review" and community-post polls; Instagram pinned comments (up to 3) and poll stickers in Reels/Stories; API access to comments and comment like counts (YouTube Data API `commentThreads` returns `likeCount`; Instagram Graph API `comments` with `like_count`; TikTok Research/Display API coverage). All of this is background knowledge, not checked against sources here.
- EU/DSA aspects were not researched.
