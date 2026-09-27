# Test Data for Claritas Misinformation Detection

## REAL NEWS EXAMPLES

### Example 1: Tech Company Acquisition
Recent reports indicate that Broadcom Corporation has agreed to acquire VMware in an all-cash transaction valued at approximately $61 billion. The deal, announced in May 2023, represents one of the largest technology acquisitions in recent history. Broadcom plans to integrate VMware's virtualization and cloud infrastructure software into its existing portfolio. Industry analysts expect the transaction to close in late 2023, pending regulatory approval from authorities in the United States and other jurisdictions. The acquisition is expected to create synergies in data center and enterprise software markets.

### Example 2: Scientific Research Finding
A study published in the journal Nature Communications found that regular physical exercise can significantly reduce the risk of cognitive decline in older adults. Researchers followed 876 participants over a five-year period, measuring their exercise habits and cognitive performance through standardized tests. Those who engaged in at least 150 minutes of moderate-intensity aerobic activity per week showed a 35% lower risk of developing mild cognitive impairment compared to sedentary individuals. The findings align with previous research from the American Heart Association and suggest that exercise should be considered a key component of brain health maintenance.

### Example 3: Economic Data
The U.S. Federal Reserve announced that inflation decreased to 3.7% in October 2023, down from 3.8% in September. The decline was driven primarily by lower energy prices and moderating food costs, according to the Consumer Price Index report released on November 1st. Core inflation, which excludes volatile food and energy prices, remained at 4.1%. Fed Chair Jerome Powell stated that while progress has been made, inflation remains above the central bank's 2% target, and additional policy decisions will be data-dependent.

### Example 4: Health Advisory
The World Health Organization issued updated guidance on mpox transmission prevention following the declaration of the global public health emergency. The advisory recommends vaccination for high-risk groups, including healthcare workers, laboratory personnel, and individuals with multiple sexual partners. The organization emphasized that mpox spreads through close physical contact with infected individuals or contaminated materials, not through respiratory droplets. Current vaccines show approximately 85% efficacy in preventing severe disease according to clinical trial data.

---

## FAKE NEWS EXAMPLES

### Example 1: Celebrity Death Hoax
Breaking: Popular actor Tom Hanks DEAD at 68! Massive heart attack hits Hollywood icon during secret vacation in Fiji. His family has allegedly kept this hidden from the public for weeks to cash in on his recent film releases. Multiple anonymous sources claim he never left his mansion and has been in a coma for months. The mainstream media is covering it up because of connections to major studios. RIP to a legend the government didn't want you to know about!

### Example 2: Health Conspiracy
SHOCKING TRUTH: The COVID-19 vaccine contains microchips developed by a major tech billionaire to track your location and thoughts. Thousands of doctors have quit their jobs rather than administer it. The government is using 5G towers to activate these chips in vaccinated people. This information is being censored on all platforms, which is WHY you're seeing it on underground forums only. Big Pharma doesn't want you to know this!!!

### Example 3: Political Conspiracy
EXCLUSIVE: Inside sources reveal that a major political candidate was actually born in a foreign country and secretly obtained fake citizenship documents. The mainstream media refuses to cover this because they're all controlled by the same shadow government. This politician has been working with foreign agents to undermine the country from within. If you share this, you'll be immediately targeted by government surveillance (they're watching!!!).

### Example 4: Science Denial
Scientists have been LYING to you: The Earth is actually FLAT and NASA has been faking space missions since 1969. Gravity doesn't exist—it's just density. All the photos of Earth from space are CGI created in a Hollywood studio. Thousands of astronauts have come forward anonymously to admit the truth, but they can't reveal their identities because NASA will kill them. Wake up sheeple!!!

### Example 5: Product Scam
THIS MIRACLE SUPPLEMENT CURES CANCER, DIABETES, AND AGING! Doctors HATE this one simple trick that big pharmaceutical companies have been suppressing for decades. This 100% natural formula made from secret herbs has a 99.9% cure rate (studies hidden by the government). For just 3 easy payments of $199, you can get a lifetime supply. Testimonials from real people show dramatic results in just days! Limited time offer before the FDA shuts us down!

### Example 6: Manufactured Outrage
Local School FORCES Students to Recite Communist Pledge Every Morning! Parents are FURIOUS after discovering the shocking curriculum. Teachers admit they're indoctrinating children into Marxism. The principal has been photographed wearing suspicious pins that indicate ties to foreign governments. This is happening in YOUR neighborhood RIGHT NOW and nobody is talking about it!

---

## UNCERTAIN/BORDERLINE EXAMPLES

### Example 1: Sensationalized but Partially True
SCIENTISTS WARN: New AI Technology Could Potentially Pose RISKS to Humanity in FUTURE! Leading researchers including some from major universities have published papers discussing theoretical concerns about advanced artificial intelligence systems. While most experts agree that current AI is safe, some argue that without proper safeguards, future systems could become problematic. The exact timeline and severity of these risks remain hotly debated in academic circles.

### Example 2: Grain of Truth Buried in Speculation
Major Tech Company Faces SERIOUS Questions Over Data Privacy After Report Surfaces. Anonymous whistleblowers claim the company may have collected user location data without explicit consent. The company has denied the allegations, stating all data collection follows legal guidelines. A government agency has opened an inquiry into the matter, though no formal charges have been filed. Industry observers say this reflects broader concerns about data privacy, but opinions differ on the severity.

### Example 3: Vague but Technically Accurate
Mysterious New Virus Discovered in Remote Region—Scientists Say MORE Research Needed! Researchers in a South American country identified an unknown virus in a small sample of animals. The virus shows some similarities to known pathogens but experts say it poses no current threat to humans. Health organizations are monitoring the situation. The story has spread widely online with embellished versions claiming imminent pandemic threats, though scientists maintain cautious skepticism.

---

## HOW TO USE THIS TEST DATA

1. **For Real News**: Copy any of the real examples (1-4) into Claritas. The model should classify these as "Likely Real" with high confidence (70-85%).

2. **For Fake News**: Use the fake examples (1-6). The model should flag these as "Likely Misinformation" with high confidence (75-90%).

3. **For Uncertain Cases**: Test borderline examples (1-3). These should produce "Uncertain" verdicts or lower confidence scores, as they contain mixed signals.

4. **For URL Testing**: Try pasting real news URLs from Reuters, BBC, AP News, The Guardian, or NPR. Claritas should extract and analyze the articles correctly.

5. **Batch Testing**: Copy multiple paragraphs into the textarea to test how the model handles longer documents.

---

## NOTES FOR JUDGES

- Real news contains specific dates, verifiable institutions, qualified language ("may," "according to," "suggests")
- Fake news uses ALL CAPS emphasis, anonymous sources, conspiracy language, and absolute claims
- Linguistic markers the model detects:
  - High subjectivity + emotional language = likely fake
  - Passive construction + data citations = likely real
  - Exclamation marks and caps ratio = strong indicator
  - Source credibility scoring helps catch known misinformation domains
