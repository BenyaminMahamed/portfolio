# Benyamin Mahamed — Portfolio

Third year CS student at Westminster (predicted First) based in London. I build full-stack web apps, AI pipelines, and autonomous systems. Co-founded a live editorial platform serving 1,000+ users, shipped a RAG research assistant from scratch, and built an autonomous driving prototype that hit 70+ FPS on a Raspberry Pi 5 for my final year project.

Currently looking for junior backend / AI engineering roles.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/benyamin-mahamed)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/BenyaminMahamed)

---

## Projects

### [Lexis — AI Research Assistant](https://github.com/BenyaminMahamed/AI-Research-Assistant)

Full-stack RAG pipeline built from scratch — no LangChain, no abstractions. PDFs are extracted page-by-page with PyMuPDF, chunked into 500-word overlapping windows, embedded with `all-MiniLM-L6-v2` (384-dim), and indexed in FAISS. Queries hit the same embedding model, do nearest-neighbour search, and retrieve the top-k chunks as grounded context for Gemini 2.0 Flash.

Four modes: Q&A, structured summarisation, peer-review style critique, and multi-paper comparison. Every answer surfaces the exact source chunks and page numbers — no hallucination hiding behind vague responses.

**Stack:** Django, DRF, FAISS, Sentence-Transformers, PyMuPDF, Gemini 2.0 Flash, SQLite

---

### [Autonomous Navigation System](https://github.com/BenyaminMahamed/FINALYEARPROJECT)

Final year project. A Classical Computer Vision system for real-time lane following and obstacle avoidance on a Raspberry Pi 5 — built as a proof-of-concept for affordable assistive mobility technology. The core question: can you replicate the navigation capabilities of £5,000+ commercial systems for under £200?

Results from a 10,298-frame integration session: ~10ms average processing latency against a 200ms target (20× margin), ~14 FPS sustained, 100% obstacle detection reliability, manual override response under 10ms. All on a CPU-only embedded platform with no GPU and no cloud inference.

Chose Classical CV over deep learning deliberately — YOLOv5 on a Pi CPU runs at 80–120ms per frame before any other processing, which alone risks the latency budget. Classical blob detection runs in under 5ms and meets the reliability requirement that matters most for a safety-critical assistive system.

**Stack:** Python, OpenCV, NumPy, Picamera2, Raspberry Pi 5, PiCar-X SDK

---

### [The BluePrint Brief](https://theblueprintbrief.com) *(Private)*

Co-founded this and built the entire platform as lead developer — a custom Django CMS for legal and commercial editorial content. Built RBAC from scratch (writer, editor, admin tiers), a signal-driven editorial workflow, automated SEO metadata generation, and newsletter distribution. Solved N+1 query issues and tuned Gunicorn worker configuration to handle real concurrent traffic without reaching for expensive infrastructure.

1,000+ active users. Running in production since launch.

**Stack:** Django, PostgreSQL, JavaScript, HTML/CSS, Linux, Gunicorn

---

## Education

**BSc Computer Science** — University of Westminster  
Predicted Upper Second Class | Year 2 Average: 71.83%

Relevant modules: Applied AI, Cyber Security, Applied Robotics, Internet of Things, Database Systems, Client-Server Architectures, Server-Side Web Development, Object Oriented Programming, Human Computer Interaction, Computer Science Final Project

**BTEC IT & Business** — Distinction* Distinction (Business) Distinction (IT)

---

## A few other things

- Selected to present full-stack solutions to a panel of SKY developers
- Lead developer on a Software Development Group Project (84%)
- Administered Okta identity platform and managed Apple device fleet in a corporate environment
- 4× Brent Cup winner, BUCS basketball player — Student Athlete
---

## Contact

[![LinkedIn](https://img.shields.io/badge/LinkedIn-benyamin--mahamed-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/benyamin-mahamed)
[![Email](https://img.shields.io/badge/Email-benyaminmahamed%40gmail.com-red?style=for-the-badge&logo=gmail&logoColor=white)](mailto:benyaminmahamed@gmail.com)
