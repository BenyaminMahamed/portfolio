# Hey, I'm Benyamin

Computer Science graduate (BSc Hons, University of Westminster, 2026) based in London. I build things at the intersection of backend engineering and applied AI — RAG pipelines, computer vision systems, and production web platforms.

Currently looking for junior software engineering and AI/ML roles.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/benyamin-mahamed)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/BenyaminMahamed)

---

## What I'm working on

- **Basketball GM simulation engine** — a possession-based Monte Carlo dynasty simulator, built in staged phases with quantitative believability targets validated against real league distributions
- Squeezing more performance out of embedded CV pipelines on the Raspberry Pi 5

---

## What I've shipped

### [Autonomous Navigation System](https://github.com/BenyaminMahamed/FINALYEARPROJECT)

Final year project. A Classical Computer Vision system for real-time lane following and obstacle detection on a Raspberry Pi 5 — a proof-of-concept for affordable assistive mobility technology. The core question: can you replicate the navigation capabilities of £5,000+ commercial systems for under £200?

Results from a 10,298-frame integration session on physical hardware: ~10ms average processing latency against a 200ms target (20× margin), ~14 FPS sustained, 100% obstacle detection reliability with zero false positives, manual override response under 10ms. All CPU-only, no GPU, no cloud inference.

Classical CV over deep learning was a deliberate design decision — YOLOv5 on a Pi CPU runs at 80–120ms per frame before any other processing, which alone risks the latency budget. A class-agnostic blob detector runs in under 5ms and guarantees the 100% detection reliability that matters most in a safety-critical assistive system.

**Stack:** Python, OpenCV, NumPy, Picamera2, Raspberry Pi 5, PiCar-X SDK

---

### [Lexis — AI Research Assistant](https://github.com/BenyaminMahamed/AI-Research-Assistant)

A full-stack RAG pipeline built from scratch — no LangChain, no abstractions. PDFs are extracted page-by-page with PyMuPDF, chunked into 500-word overlapping windows, embedded with `all-MiniLM-L6-v2` (384-dim, normalised), and indexed in FAISS. Queries hit the same embedding model, run nearest-neighbour search, and retrieve the top-k chunks as grounded context for Gemini 2.0 Flash.

Four modes: Q&A, structured summarisation, peer-review style critique, and multi-paper comparison. Every answer surfaces the exact source chunks and page numbers it was grounded in.

**Stack:** Django, DRF, FAISS, Sentence-Transformers, PyMuPDF, Gemini 2.0 Flash, SQLite

---

### [The BluePrint Brief](https://theblueprintbrief.com) *(Private repo)*

Co-founded this live editorial platform for legal and commercial content, and develop it as part of a three-person engineering team. I own the Render deployment, the Cloudinary media layer, domain and email infrastructure, and primary production debugging. Features I've shipped end-to-end include an access-gated Student Resources system with code redemption, newsletter integration via Beehiiv, and the submission notification email pipeline.

1,000+ active users, running in production since launch.

Architecture overview: [blueprint-brief-architecture](https://github.com/BenyaminMahamed/blueprint-brief-architecture)

**Stack:** Django, PostgreSQL, JavaScript, HTML/CSS, Linux, Gunicorn

---

## Education

**BSc (Hons) Computer Science** — University of Westminster, 2026
Upper Second Class Honours (2:1)

Relevant modules: Applied AI, Cyber Security, Applied Robotics, Internet of Things, Database Systems, Client-Server Architectures, Server-Side Web Development, Object Oriented Programming, Human Computer Interaction, Final Year Project

**BTEC IT & Business** — D*DD

---

## A few other things

- Selected to present full-stack solutions to a panel of SKY developers
- Lead developer on a Software Development Group Project (84%)
- Administer Okta identity platform and Apple device fleet in a corporate environment
- BUCS basketball player and 4× Brent Cup winner — student athlete

---

## Stack

### Languages
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![SQL](https://img.shields.io/badge/sql-%2300758F.svg?style=for-the-badge&logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Bash](https://img.shields.io/badge/bash-%23121011.svg?style=for-the-badge&logo=gnu-bash&logoColor=white)

### AI / ML
![NumPy](https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white)
![OpenCV](https://img.shields.io/badge/opencv-%23white.svg?style=for-the-badge&logo=opencv&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-%23FFD21E.svg?style=for-the-badge&logo=huggingface&logoColor=black)
![Google Gemini](https://img.shields.io/badge/Gemini-%234285F4.svg?style=for-the-badge&logo=google&logoColor=white)

### Web & Backend
![Django](https://img.shields.io/badge/django-%23092e20.svg?style=for-the-badge&logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/DRF-%23092e20.svg?style=for-the-badge&logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)

### Embedded & Infrastructure
![Raspberry Pi](https://img.shields.io/badge/-RaspberryPi-C51A4A?style=for-the-badge&logo=Raspberry-Pi)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

---

## Contact

[![LinkedIn](https://img.shields.io/badge/LinkedIn-benyamin--mahamed-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/benyamin-mahamed)
[![Email](https://img.shields.io/badge/Email-benyaminmahamed%40gmail.com-red?style=for-the-badge&logo=gmail&logoColor=white)](mailto:benyaminmahamed@gmail.com)
