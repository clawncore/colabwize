export interface CaseStudy {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  client: string;
  date: string;
  category: string;
  image: string;
  resultMetrics: {
    label: string;
    value: string;
  }[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: "sarah-phd-defense",
    title: "How Sarah Defended Her Dissertation in 48 Hours with Confidence",
    excerpt:
      "Facing a strict deadline and paralyzing anxiety about unintentional plagiarism, PhD candidate Sarah used ColabWize to audit her 200-page thesis.",
    client: "Sarah Jenkins, PhD Candidate",
    date: "March 10, 2026",
    category: "Student Success",
    image:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Similarity Reduced", value: "15%" },
      { label: "Citations Fixed", value: "47" },
      { label: "Time Saved", value: "30+ Hours" },
    ],
    content: `
      <h2>The Challenge</h2>
      <p>Sarah, a final-year PhD candidate in Sociology, had spent three years researching her dissertation. As the submission deadline approached, a wave of panic set in. She had read horror stories of students being flagged for "accidental plagiarism" or, worse, false AI detection.</p>
      <p>"I knew I wrote it," Sarah recalls. "But I was terrified that I might have inadvertently patchwritten a paragraph or that my writing style would trigger a false positive on the university's new AI checkers. The anxiety was keeping me up at night."</p>

      <h2>The Solution</h2>
      <p>Sarah turned to ColabWize for a pre-submission audit. She used the <strong>Originality Map</strong> to identify areas where her paraphrasing was too close to the source material.</p>
      <p>She also utilized the <strong>Authorship Certificate</strong> feature. By running her final editing sessions through ColabWize, she generated a verified audit log showing over 40 hours of active editing time, proving the human effort behind the work.</p>

      <h2>The Results</h2>
      <p>The ColabWize audit revealed 12 instances of unintentional mosaic plagiarism, which Sarah was able to rewrite before submission. It also caught 5 citations that led to broken 404 links.</p>
      <p>Sarah submitted her dissertation with a ColabWize Authorship Certificate attached. She defended successfully and received her doctorate with no integrity flags.</p>
      <p>"The peace of mind was worth more than the software cost," Sarah says. "I walked into my defense knowing I was bulletproof."</p>
    `,
  },
  {
    id: "university-integrity-scale",
    title:
      "Scaling Academic Integrity: How Westview University Cut Plagiarism by 40%",
    excerpt:
      "Westview University struggled with a surge in AI-generated submissions. By integrating ColabWize into their student workflow, they shifted from punishment to prevention.",
    client: "Westview University",
    date: "February 15, 2026",
    category: "Institutional",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Plagiarism Drop", value: "40%" },
      { label: "Student Adoption", value: "85%" },
      { label: "Admin Hours Saved", value: "120/mo" },
    ],
    content: `
      <h2>The Problem</h2>
      <p>In 2024, Westview University saw a 300% spike in academic integrity violations. The majority were related to misuse of Generative AI. The administration's initial response—strict bans and zero-tolerance policies—created a culture of fear and led to numerous false accusations against honest students.</p>

      <h2>The Shift to Prevention</h2>
      <p>Westview partnered with ColabWize to pilot a "Defensibility First" approach. Instead of just catching cheaters, they wanted to empower students to prove their work.</p>
      <p>The university provided ColabWize licenses to all graduate students. The goal was to encourage students to "self-audit" before hitting submit.</p>

      <h2>Implementation</h2>
      <p>ColabWize was integrated into the Learning Management System (LMS). Students could run a <strong>Citation Confidence</strong> check as part of their drafting process.</p>
      <p>Professors were trained to interpret the <strong>Originality Map</strong> not as a verdict, but as a conversation starter. If a student was flagged, they could present their ColabWize Authorship Certificate as evidence of their process.</p>

      <h2>Impact</h2>
      <p>After one semester, reported plagiarism cases dropped by 40%. More importantly, student surveys showed a 60% reduction in "submission anxiety."</p>
      <p>"ColabWize changed the dynamic," says Dean Roberts. "We are no longer police officers; we are partners in the writing process."</p>
    `,
  },
  {
    id: "research-team-collaboration",
    title: "Streamlining Multi-Author Papers: The BioTech Lab Case",
    excerpt:
      "Coordinating citations and integrity across 5 authors is a nightmare. See how the delta-X Research Team used ColabWize to harmonize their Nature submission.",
    client: "delta-X Research Group",
    date: "January 28, 2026",
    category: "Research",
    image:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Submission Speed", value: "2x Faster" },
      { label: "Citation Errors", value: "0" },
      { label: "Authors Aligned", value: "5/5" },
    ],
    content: `
      <h2>The Collaboration Chaos</h2>
      <p>The delta-X Research Group, a team of five bio-engineers, was preparing a landmark paper for <em>Nature</em>. The drafting process was chaotic. Each author used a different citation manager. Versions were passed back and forth via email. Ensuring that the final voice was consistent—and that no accidental plagiarism occurred during the merging of sections—was a massive headache.</p>

      <h2>Unifying the Workflow</h2>
      <p>The team adopted ColabWize for the final consolidation phase. They used the <strong>Citation Auditor</strong> to merge bibliography data from Zotero and EndNote, identifying three "hallucinated" citations that had slipped into the draft during an AI-assisted brainstorming session.</p>

      <h2>The AI Shield</h2>
      <p>Reviewers at top journals are increasingly skeptical of AI-sounding text. The team used the <strong>AI Detection Shield</strong> to smooth out the transition between sections written by different authors, ensuring a consistent, human "burstiness" throughout the paper.</p>

      <h2>The Outcome</h2>
      <p>The paper was accepted with minor revisions. The peer reviewers specifically noted the robustness of the bibliography.</p>
      <p>"We used to spend two weeks just cleaning up the references and checking for self-plagiarism," says Lead Author Dr. Vance. "With ColabWize, we did it in an afternoon."</p>
    `,
  },
  {
    id: "false-positive-appeal-success",
    title: "The 'False Positive' Nightmare: How Alex Won His Appeal",
    excerpt:
      "Alex was accused of using AI on his History capstone. Using ColabWize's Authorship Certificate, he proved the 80 hours of manual work behind his paper.",
    client: "Alex Chen, History Major",
    date: "April 2, 2026",
    category: "Student Defense",
    image:
      "https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Appeal Status", value: "Granted" },
      { label: "Evidence Pages", value: "15" },
      { label: "Grade Restored", value: "A-" },
    ],
    content: `
      <h2>The Accusation</h2>
      <p>It was the email every student dreads. "Academic Integrity Violation Notice." Alex, a junior History major, stared at the screen in disbelief. His capstone paper on the Industrial Revolution had been flagged by the university's AI detector with a 92% probability of being AI-generated.</p>
      <p>"I didn't use ChatGPT," Alex insisted. "I spent two months in the library. But the professor said the 'stats don't lie.'"</p>

      <h2>The Evidence Gap</h2>
      <p>Alex had his notes, but they were handwritten and scattered. The professor wanted digital proof. The burden of proof had shifted: Alex was guilty until proven innocent.</p>

      <h2>Building the Defense</h2>
      <p>Fortunately, Alex had written his final draft within the ColabWize editor. He accessed his dashboard and generated an <strong>Authorship Certificate</strong>.</p>
      <p>The certificate played back his entire writing process.
      <br><strong>Session 1 (Feb 14):</strong> 4 hours. 2,000 keystrokes.
      <br><strong>Session 2 (Feb 20):</strong> 6 hours. Massive restructuring of paragraph 3.
      <br><strong>Session 3 (Mar 1):</strong> Citation formatting.</p>
      <p>Crucially, it showed the "backspacing" and "rewriting"—the messy, human process that AI generators don't have.</p>

      <h2>The Outcome</h2>
      <p>Alex presented the certificate to the Academic Honor Board. The visual timeline of his work was undeniable. The board ruled that the AI detector's flag was a "false positive" likely triggered by Alex's formal, structured writing style.</p>
      <p>"Without ColabWize, it would have been my word against the machine," Alex says. "And the machine usually wins."</p>
    `,
  },
  {
    id: "esl-student-confidence",
    title: "From 'Robotic' to Fluent: Elena's Journey as an ESL Student",
    excerpt:
      "Non-native speakers are often unfairly flagged by AI detectors due to simpler sentence structures. Elena used the AI Shield to learn, not cheat.",
    client: "Elena Rodriguez, Int'l Student",
    date: "March 22, 2026",
    category: "ESL Support",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Burstiness Score", value: "+45%" },
      { label: "Confidence", value: "High" },
      { label: "False Flags", value: "0" },
    ],
    content: `
      <h2>The ESL Disadvantage</h2>
      <p>Elena, a Master's student from Spain, noticed a disturbing trend. Her essays kept getting flagged as "potential AI." She wasn't cheating, but her writing style—often repetitive and grammatically rigid—mimicked the patterns of early LLMs.</p>
      <p>"I was afraid to use Grammarly or translation tools because I thought they would get me in trouble," Elena says. "My writing suffered because I was too scared to improve it."</p>

      <h2>The Learning Tool</h2>
      <p>Elena started using ColabWize's <strong>AI Detection Shield</strong>. Instead of just hiding, she used the feedback to learn. When the tool flagged a paragraph as "Low Burstiness" (too robotic), she knew she needed to vary her sentence structure.</p>
      <p>She used the tool to practice combining simple sentences into complex ones, manually implementing the changes to ensure she was learning the skill.</p>

      <h2>The Cultural Bridge</h2>
      <p>The <strong>Originality Map</strong> also helped her understand the Western academic standard for paraphrasing, which was different from her home country's conventions.</p>
      <p>"ColabWize didn't write for me," Elena explains. "It taught me how to write like a human in English. It gave me the confidence to express my complex ideas without fear of being labeled a bot."</p>
    `,
  },
  {
    id: "research-grant-success",
    title: "Securing the $500k Grant: Proving Novelty with Originality Maps",
    excerpt:
      "In grant applications, 'novelty' is everything. The Quantum Lab used ColabWize to prove their proposal was distinct from 5,000 existing papers.",
    client: "Quantum Dynamics Lab",
    date: "February 28, 2026",
    category: "Research Funding",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Grant Awarded", value: "$500k" },
      { label: "Novelty Score", value: "98%" },
      { label: "Review Time", value: "2 Weeks" },
    ],
    content: `
      <h2>The Funding Bottleneck</h2>
      <p>Grant reviewers are overwhelmed. They read hundreds of proposals, often looking for reasons to reject them. A common rejection reason? "Lack of Novelty" or "Too similar to existing work."</p>
      <p>The Quantum Dynamics Lab needed to prove that their proposal for "Entangled Sensor Arrays" was truly unique, despite using standard terminology common in the field.</p>

      <h2>The Pre-emptive Strike</h2>
      <p>The Lab Lead, Dr. Aris, decided to include a "Novelty Report" in the appendix of their grant application. They ran their proposal through ColabWize's <strong>Originality Map</strong>, comparing it against a custom database of the last 10 years of NSF grants.</p>
      <p>The resulting heatmap was largely green (original), with specific yellow highlights only on standard definitions and equations.</p>

      <h2>The Reviewer's Reaction</h2>
      <p>One of the grant reviewers specifically commented on the report: "The inclusion of an originality audit was refreshing. It saved me hours of background checking and immediately established the team's integrity and awareness of the field."</p>
      <p>The lab secured the $500,000 grant, beating out 40 other applicants. They now use ColabWize for every single proposal.</p>
    `,
  },
  {
    id: "coding-assignment-defense",
    title: "The CS Capstone: Proving Code Ownership",
    excerpt:
      "When code looks like StackOverflow, how do you prove you wrote it? Mark used ColabWize to document his logic and comments.",
    client: "Mark Z., CS Senior",
    date: "April 10, 2026",
    category: "Computer Science",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Code Integrity", value: "Verified" },
      { label: "Comment Depth", value: "High" },
      { label: "Plagiarism", value: "0%" },
    ],
    content: `
      <h2>The "Copy-Paste" Culture</h2>
      <p>In Computer Science, reusing standard algorithms is common. But for his senior capstone, Mark needed to show he understood the underlying logic of his neural network implementation.</p>
      <p>His professor ran a code similarity checker that flagged 40% of his project as "matches found on GitHub." Mark was facing an F for a project that was 90% his own work.</p>

      <h2>Documenting the Logic</h2>
      <p>Mark hadn't just copied code; he had adapted it. He used ColabWize (which supports code blocks) to write his documentation and logic explanations.</p>
      <p>The <strong>Authorship Certificate</strong> tracked his cursor as he wrote the comments explaining *why* he chose specific hyperparameters. It showed him pausing, deleting, and rewriting the logic flow.</p>

      <h2>The Defense</h2>
      <p>Mark showed his professor the audit trail. "You can see here," Mark pointed out, "that I spent 20 minutes writing this function. If I had copied it from GitHub, it would have appeared instantly."</p>
      <p>The professor accepted the evidence. "The timestamp metadata doesn't lie," he admitted. Mark graduated with honors.</p>
    `,
  },
  {
    id: "history-archival-research",
    title: "The Archival Dig: Avoiding 'Citation Rot' in Historical Analysis",
    excerpt:
      "Sarah was citing sources from the 1920s. ColabWize helped her ensure her modern interpretations were distinct from the source texts.",
    client: "Sarah J., History PhD",
    date: "March 5, 2026",
    category: "Humanities",
    image:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Sources Verified", value: "150+" },
      { label: "Link Rot Found", value: "12 Links" },
      { label: "Accuracy", value: "100%" },
    ],
    content: `
      <h2>The Mosaic Trap</h2>
      <p>Historians work closely with texts. It is very easy to accidentally slide into "Mosaic Plagiarism"—using the sentence structure of the original document because the old-fashioned language is hard to paraphrase.</p>
      <p>Sarah was analyzing WWI treaties. She found herself subconsciously mimicking the formal diplomatic language of 1919.</p>

      <h2> The Audit</h2>
      <p>She ran her draft through the ColabWize <strong>Originality Map</strong>. It lit up yellow. "You are just translating this treaty," the tool effectively told her.</p>
      <p>She used the tool to break down the complex diplomatic language and reconstruct the arguments in her own modern academic voice.</p>

      <h2>Fixing the Links</h2>
      <p>Additionally, the <strong>Citation Auditor</strong> checked her bibliography. It found that 12 of the digital archive links she had saved two years ago were now broken (404 errors). She was able to update them to permanent DOIs or Wayback Machine links before submission, saving her from a major embarrassment.</p>
    `,
  },
  {
    id: "pre-med-integrity",
    title: "The Pre-Med Pressure Cooker: Saving a Career Before It Started",
    excerpt:
      "One plagiarism flag can ban you from Med School. James used ColabWize to ensure his Biochemistry review paper was squeaky clean.",
    client: "James K., Pre-Med",
    date: "March 18, 2026",
    category: "Medical Sciences",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Similarity Score", value: "2%" },
      { label: "Citations Checked", value: "85" },
      { label: "Confidence", value: "Max" },
    ],
    content: `
      <h2>The Stakes</h2>
      <p>For Pre-Med students, academic integrity is life or death. A single mark on your record means no Medical School interview. James, a junior specializing in Biochemistry, was terrified of accidental plagiarism in his 40-page literature review.</p>

      <h2>The Scientific Jargon Problem</h2>
      <p>Describing protein folding mechanisms requires precise language. There are only so many ways to say "Protein X binds to Receptor Y." James was worried that his accurate descriptions would be flagged as copying from textbooks.</p>

      <h2>The Scan</h2>
      <p>James ran his draft through the <strong>Originality Map</strong>. As expected, it lit up yellow in the methodology section. But unlike simple checkers, ColabWize allowed him to click on each match.</p>
      <p>He verified that 90% of the matches were standard scientific nomenclature, which is allowed. For the remaining 10%—where he had inadvertently copied the structure of a Nature abstract—he rewrote the sentences entirely using the "Blank Page" technique suggested by the tool.</p>

      <h2>The Result</h2>
      <p>James submitted the paper with full confidence. He received an A and a letter of recommendation from his professor, who praised the "exceptional clarity and originality" of his synthesis.</p>
    `,
  },
  {
    id: "law-review-citation",
    title: "The Law Review Standard: Zero Margin for Error",
    excerpt:
      "In legal writing, a wrong citation isn't a typo; it's malpractice. See how the Columbia Law Review staff used ColabWize to audit 500+ footnotes.",
    client: "Law Review Editor",
    date: "February 12, 2026",
    category: "Legal",
    image:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Footnotes Audited", value: "532" },
      { label: "Errors Found", value: "23" },
      { label: "Bluebook Compliance", value: "100%" },
    ],
    content: `
      <h2>The Bluebook Beast</h2>
      <p>Legal citation is notoriously complex. The "Bluebook" rules occupy hundreds of pages. For the Law Review Editorial Board, checking citations is a grueling, sleepless process.</p>

      <h2>Automating the Grunt Work</h2>
      <p>The editors used ColabWize's <strong>Citation Auditor</strong> for the Spring Issue. They weren't looking for plagiarism; they were looking for accuracy.</p>
      <p>The tool crawled the URLs in the footnotes. It flagged 5 instances where the cited case law had been overturned or modified since the article was written—a critical "Shepardizing" function that saved the journal from publishing outdated legal theory.</p>

      <h2>Efficiency Gain</h2>
      <p>"It used to take a 1L student 10 hours to Bluebook a 20-page article," says the Managing Editor. "With ColabWize's assistance, they do the initial scan in 15 minutes and focus their time on the substantive legal analysis."</p>
    `,
  },
  {
    id: "creative-writing-voice",
    title: "Preserving the Author's Voice: A Creative Writing Case",
    excerpt:
      "Can you prove a novel is human-written? An aspiring sci-fi author used ColabWize to certify her manuscipt before sending it to agents.",
    client: "Maria G., Novelist",
    date: "January 15, 2026",
    category: "Creative Arts",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Word Count", value: "85k" },
      { label: "Writing Sessions", value: "210" },
      { label: "Human Verification", value: "Certified" },
    ],
    content: `
      <h2>The Publishing Fear</h2>
      <p>Literary agents in 2026 are flooded with AI-generated sludge. They are rejecting manuscripts faster than ever. Maria knew her sci-fi novel was good, but she feared it would be dismissed as "bot-generated" because of its complex, world-building lore.</p>

      <h2>The Proof of Labor</h2>
      <p>Maria wrote her final draft in ColabWize. The <strong>Authorship Certificate</strong> captured the "blood, sweat, and tears" of the process. It showed the days where she wrote 2,000 words, and the weeks where she wrote zero. It showed the massive delete-and-rewrite of Chapter 4.</p>

      <h2>The Query Letter</h2>
      <p>When she queried agents, she included a line: "This manuscript is 100% human-generated, verified by ColabWize. Authorship Certificate available upon request."</p>
      <p>This signaled professionalism. She signed with a top agency two months later. Her agent told her: "Knowing I wouldn't have to copyright-check your work was a huge plus."</p>
    `,
  },
  {
    id: "journalism-fact-check",
    title: "The Investigative Report: Verifying Sources in Real-Time",
    excerpt:
      "A journalism student breaking a big story used ColabWize to ensure every claim was backed by a verified source.",
    client: "The Daily Campus",
    date: "April 5, 2026",
    category: "Journalism",
    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Facts Checked", value: "42" },
      { label: "Sources Archived", value: "18" },
      { label: "Retraction Risk", value: "Low" },
    ],
    content: `
      <h2>The Story</h2>
      <p>The student newspaper was running an expose on university housing costs. It was a controversial story that would anger the administration. The Editors knew they had to be perfect. One factual error would kill the story.</p>

      <h2>The Fact-Check Audit</h2>
      <p>They ran the draft through the <strong>Citation Auditor</strong>. The tool prompted them to provide a source for every statistical claim. "Rent has increased 15%"—<em>Source?</em> "The dorms are over capacity"—<em>Source?</em></p>
      <p>ColabWize forced them to link every claim to a specific document or interview recording. It served as a digital Fact-Checking department.</p>

      <h2>The Publication</h2>
      <p>The story ran. The administration pushed back, but the students had the receipts. They published the annotated version (generated by ColabWize) alongside the article, silencing the critics.</p>
    `,
  },
  {
    id: "engineering-capstone",
    title: "The Engineering Report: Patent-Ready Documentation",
    excerpt:
      "An engineering team needed to prove their design was original for a patent application. ColabWize provided the audit trail.",
    client: "SolarCar Team",
    date: "March 30, 2026",
    category: "Engineering",
    image:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a783?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Patent Pending", value: "Yes" },
      { label: "Design Hours", value: "400+" },
      { label: "Integrity", value: "Verified" },
    ],
    content: `
      <h2>The Patent Requirement</h2>
      <p>The SolarCar team invented a new battery cooling system. To file a patent, you must prove "Prior Art" search and originality. Accidental copying of an existing patent invalidates your claim.</p>

      <h2>The Originality Scan</h2>
      <p>They used ColabWize not just for text, but to scan their technical descriptions against technical databases. The tool highlighted similarities to a 2018 Tesla patent.</p>
      <p>Ideally, this saved them. They realized their description was too similar, even though their mechanism was different. They rewrote the technical specs to clearly distinguish their "active liquid cooling" from the "passive cooling" in the prior art.</p>

      <h2>The IP Defense</h2>
      <p>The ColabWize report became part of their internal IP documentation, proving that they had done due diligence in checking for conflicts before filing.</p>
    `,
  },
  {
    id: "psychology-research-ethics",
    title: "The Ethics Board Review: Navigating Sensitive Data",
    excerpt:
      "A Psychology student used ColabWize to sanitize their thesis of accidental PII leaks while maintaining narrative flow.",
    client: "Jordan T., Psych Major",
    date: "February 20, 2026",
    category: "Psychology",
    image:
      "https://images.unsplash.com/photo-1576091160550-2187d80aeff2?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "PII Flagged", value: "8 Instances" },
      { label: "Ethics Approval", value: "First Round" },
      { label: "Data Safety", value: "100%" },
    ],
    content: `
      <h2>The Confidentiality Trap</h2>
      <p>Jordan was writing a qualitative thesis based on interviews with trauma survivors. The challenge was to quote them accurately without revealing their identities. The initial draft was flagged by the advisor for potentially identifiable sentence structures.</p>

      <h2>The Stylistic Audit</h2>
      <p>Jordan used ColabWize to compare the interview transcripts with the thesis text. The tool's <strong>Originality Map</strong> was used in reverse—to ensure that the quotes were <em>not</em> too similar to the raw data where it mattered (detecting accidental leaks of verbal ticks that could identify a subject).</p>

      <h2>The Outcome</h2>
      <p>The Ethics Board praised the "meticulous de-identification" of the data. Jordan's thesis was published with a gold-standard rating for subject privacy.</p>
    `,
  },
  {
    id: "mba-team-project",
    title: "The MBA Group Project: Harmonizing 5 Voices into One",
    excerpt:
      "Group projects are notorious for disjointed writing. An MBA team used ColabWize to create a seamless strategy report.",
    client: "Team Alpha, MBA",
    date: "January 10, 2026",
    category: "Business",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Consistency", value: "95%" },
      { label: "Editing Time", value: "-10 Hours" },
      { label: "Grade", value: "A" },
    ],
    content: `
      <h2>The Frankenstein Report</h2>
      <p>Five MBA students. Five different writing styles. One final strategy report due in 24 hours. The initial draft looked like a Frankenstein monster—some parts detailed and dry, others salesy and informal.</p>

      <h2>The AI Shield Harmonization</h2>
      <p>They ran the full document through ColabWize. The <strong>AI Shield</strong> burstiness graph showed wild fluctuations between sections. It was obvious where one student stopped writing and another began.</p>
      <p>They used the tool to smooth out the transitions, adjusting the sentence complexity of the "simple" sections to match the "complex" ones.</p>

      <h2>The Executive Summary</h2>
      <p>The result was a professional, unified voice. The professor noted, "Finally, a group project that reads like it was written by a single professional consultant."</p>
    `,
  },
  {
    id: "philosophy-argument-structure",
    title: "The Philosophy Thesis: Defending Original Thought",
    excerpt:
      "In Philosophy, your argument is your product. Leo used ColabWize to prove his interpretation of Kant was not derived from online summaries.",
    client: "Leo R., Philosophy",
    date: "March 12, 2026",
    category: "Humanities",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Originality", value: "Verified" },
      { label: "Source Depth", value: "High" },
      { label: "Defense", value: "Passed" },
    ],
    content: `
      <h2>The "SparkNotes" Accusation</h2>
      <p>Philosophy professors are wary of students regurgitating online summaries (like SparkNotes or Wikipedia) instead of reading the primary texts. Leo's essay on Kant's <em>Critique of Pure Reason</em> was accused of being "too generic."</p>

      <h2>The Depth Analysis</h2>
      <p>Leo used ColabWize to show the evolution of his arguments. The <strong>Authorship Certificate</strong> showed him spending 3 hours on a single paragraph, constantly referencing the digitised primary text. It tracked his "thinking time" (long pauses) versus "typing time."</p>

      <h2>The Verdict</h2>
      <p>The audit proved that Leo was engaging deeply with the material, not just copying summaries. The "generic" nature was simply his attempt to be clear. He was allowed to rewrite for clarity without penalty.</p>
    `,
  },
  {
    id: "economics-data-integrity",
    title: "Qual Quantitative Analysis: Verifying the Data Trail",
    excerpt:
      "An Econ Major used ColabWize to link every chart and graph back to the raw CSV files, ensuring total reproducibility.",
    client: "Priya M., Economics",
    date: "April 18, 2026",
    category: "Economics",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Data Links", value: "Verified" },
      { label: "Reproducibility", value: "100%" },
      { label: "Citation Quality", value: "High" },
    ],
    content: `
      <h2>The Reproducibility Crisis</h2>
      <p>Economics is facing a crisis where many papers cannot be reproduced because data sources are vague. Priya wanted her senior thesis on Inflation Trends to be bulletproof.</p>

      <h2>The Data Audit</h2>
      <p>She used ColabWize's <strong>Citation Auditor</strong> not just for books, but for datasets. Every time she mentioned a statistic, she linked it to the specific row in her World Bank CSV file.</p>
      <p>ColabWize's ability to handle non-text citations meant she could create a "living bibliography" of her data sources.</p>

      <h2>The Distinction</h2>
      <p>Her thesis was awarded the "Best Undergraduate Paper" prize, largely because the committee could click a link and see the exact raw data behind her regression analysis.</p>
    `,
  },
  {
    id: "nursing-care-plans",
    title: "Nursing Care Plans: Preventing Template Plagiarism",
    excerpt:
      "Nursing students often copy care plans from previous years. A nursing cohort used ColabWize to ensure each patient plan was unique.",
    client: "City Nursing College",
    date: "February 5, 2026",
    category: "Healthcare",
    image:
      "https://images.unsplash.com/photo-1576091160550-2187d80aeff2?w=800&h=600&fit=crop",
    resultMetrics: [
      { label: "Uniqueness", value: "100%" },
      { label: "Patient Safety", value: "Prioritized" },
      { label: "Templates Used", value: "0" },
    ],
    content: `
      <h2>The Template Trap</h2>
      <p>In Nursing school, "Care Plans" can feel repetitive. Students often share templates or copy from previous cohorts. This is dangerous because it leads to "cookie-cutter medicine" where patient nuances are ignored.</p>

      <h2>The Cohort Audit</h2>
      <p>The Nursing instruction team required all students to run their Care Plans through ColabWize. The <strong>Originality Map</strong> compared the plans not just to the internet, but to the "Internal Database" of past student submissions.</p>

      <h2>The Result</h2>
      <p>It caught 15 students using a "legacy template" from 2023. This forced the students to write fresh plans based on the actual case studies, leading to better critical thinking and safer future patient care.</p>
    `,
  },
];
