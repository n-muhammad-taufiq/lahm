Yes. I would add a **strict legal/compliance section** rather than just saying “don't scrape,” so Antigravity understands that this applies to every future data source too.

Add this section to the prompt, preferably after the Google API section:

# LEGAL, COMPLIANCE, AND DATA-SOURCE REQUIREMENTS

This project must be developed and operated in a **legal, ethical, and terms-compliant manner**.

These requirements are mandatory for the entire project and apply to every current and future feature.

## 1. No illegal crawling or scraping

DO NOT implement:

- Unauthorized web scraping
- Scraping Google Maps or Google Search result pages
- Browser automation to extract data from websites that prohibit it
- CAPTCHA bypassing
- Rate-limit bypassing
- IP rotation intended to evade restrictions
- Proxy rotation intended to evade restrictions
- Account/session bypassing
- Authentication bypassing
- Accessing private or restricted data
- Circumventing technical access controls
- Extracting data from websites in violation of their terms
- Scraping behind login/authentication without explicit authorization

Never use unofficial scraping techniques simply because an official API does not provide a particular piece of information.

If an official API does not expose a specific data point, treat that data as **unavailable** unless there is another legitimate source.

---

## 2. Use official APIs whenever available

Prefer:

```text
Official API
    ↓
Official public dataset
    ↓
Permitted public web source
    ↓
Manual input
```

Do NOT replace an official API with scraping.

For Google data specifically:

- Use Google Maps Platform / Places API.
- Do not scrape Google Maps.
- Do not automate Google Maps in a browser to extract business data.
- Do not bypass Google API restrictions.
- Follow Google's current API Terms of Service and applicable data-storage, caching, attribution, and usage requirements.

---

## 3. Respect each external service's terms

Before integrating any external data source, verify:

- Is automated access permitted?
- Is there an official API?
- What data may be collected?
- What data may be stored?
- How long may it be stored?
- Are there attribution requirements?
- Are there restrictions on commercial use?
- Are there restrictions on combining the data with AI?
- Are there restrictions on contacting people/businesses using the data?

If the answer is unclear, **do not implement the integration yet**.

Stop and ask me to review the source and its terms.

---

## 4. Public information does not automatically mean unrestricted use

Do not assume:

> "The information is publicly visible, therefore we can scrape and use it."

Public availability does not automatically grant permission for automated collection, storage, redistribution, or commercial use.

The implementation must consider the source's terms and applicable law.

---

## 5. Social media

Do not scrape Instagram, Facebook, LinkedIn, or other social platforms.

If we later need social-media signals, use:

- Official APIs
- Official integrations
- Permitted search results
- Public information obtained through legitimate means

Do not create fake accounts or bypass platform restrictions to collect data.

---

## 6. Website discovery

If the system later needs to detect:

> "Restaurant ABC is opening soon"

from websites, use legitimate methods such as:

- Official APIs
- Search APIs where permitted
- RSS feeds
- Publicly provided feeds
- Sitemap information where appropriate
- Manually provided URLs
- Other explicitly permitted mechanisms

Do not build a generic crawler that indiscriminately crawls websites.

If crawling a specific website is considered, check:

- robots.txt where relevant
- terms of service
- applicable legal restrictions
- rate limits
- whether automated access is permitted

When permission is unclear, do not crawl it.

---

## 7. AI must not be used to circumvent restrictions

AI must never be used to:

- bypass website restrictions
- bypass CAPTCHA
- bypass authentication
- circumvent rate limits
- evade detection
- reconstruct restricted/private data
- infer sensitive information that the source does not legitimately provide

AI is for legitimate analysis and qualification of data that we are legally allowed to obtain.

---

## 8. Business contact information

Only use contact information obtained through legitimate sources.

Do not:

- obtain private phone numbers
- purchase questionable scraped databases
- collect personal information unnecessarily
- infer personal contact information
- scrape private profiles

Prefer publicly provided business contact information.

---

## 9. Outreach compliance

The system is initially a **lead discovery and qualification system**, not a bulk messaging system.

Do not automatically send WhatsApp, SMS, email, or other promotional messages to discovered businesses.

Finding a business contact number does NOT automatically mean we have permission to send marketing messages.

Any future communication feature must comply with:

- applicable Indian laws
- the relevant messaging platform's policies
- consent/opt-in requirements where applicable
- opt-out requirements
- anti-spam requirements
- privacy requirements

Before implementing automated outreach, stop and ask me to review the proposed approach and compliance requirements.

---

## 10. Data minimization

Only collect information that is actually needed for the lead-generation purpose.

Avoid collecting:

- personal information unrelated to the business
- sensitive information
- unnecessary employee information
- private information

Prefer business-level information such as:

- business name
- business category
- business address
- public business phone
- public business website
- public business opening information
- source
- discovery date
- lead status

---

## 11. Data retention

Do not store external-source data indefinitely by default.

For each external data source, determine whether its terms allow storage and for how long.

If a source requires temporary caching rather than permanent storage, design the system accordingly.

Do not copy an external platform's entire database into our PostgreSQL database.

---

## 12. Source attribution

Where a data source requires attribution, preserve the required attribution and display it appropriately.

Do not remove source attribution simply to make the application look cleaner.

---

## 13. Compliance-first development rule

For every new external data source, follow this process:

```text
Identify source
      ↓
Check official API
      ↓
Check terms / permitted use
      ↓
Check applicable restrictions
      ↓
Determine allowed data
      ↓
Design compliant integration
      ↓
Implement
```

If there is uncertainty:

```text
UNCERTAIN
   ↓
STOP
   ↓
ASK FOR REVIEW
```

Do NOT implement first and investigate legality later.

---

## 14. Core principle

The objective is:

> **Build a useful lead-generation system using legitimate data sources and legitimate access methods.**

The objective is NOT:

> "Find a way to obtain the data regardless of restrictions."

When an attractive data source cannot legally or legitimately be accessed automatically, skip it and use another source.

**Legal and ethical operation takes priority over lead volume or automation.**

I would definitely include this because otherwise an AI coding agent may later decide that *“Google doesn't expose this data through the API, so I'll use a scraper”*. This section explicitly prevents that behavior and tells it what to do instead: **stop, verify the source, and use an official/permitted alternative.**