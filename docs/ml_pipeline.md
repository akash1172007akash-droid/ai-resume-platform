# AI Resume Intelligence & Job Matching Platform — ML Pipeline Documentation

## 1. Overview
The machine learning and natural language processing pipeline powers the automated text extraction, skill identification, semantic vocabulary vectorization, cosine similarity computation, and skill gap analysis.

The architecture balances **practical interview explainability** and **computational efficiency** without introducing black-box deep learning models that are difficult to explain or slow to run locally.

```
Resume PDF
   │
   ▼
1. PDF Text Extraction (PyMuPDF)
   │
   ▼
2. Text Cleaning & Technical Token Preservation
   │
   ▼
3. Controlled Skill Taxonomy Extraction & Alias Normalization
   │
   ▼
4. Dual Vectorization (TF-IDF Vectorizer with N-Grams)
   │
   ▼
5. Cosine Similarity Matching (Job Match Score)
   │
   ▼
6. Explicit Skill Matching & Skill Gap Analysis
   │
   ▼
7. Generic Learning Path Recommendations
```

---

## 2. Step-by-Step Pipeline Architecture

### Step 1: Digital PDF Text Extraction
- **Technology**: PyMuPDF (`fitz` / `pymupdf`).
- **Mechanism**: Reads document stream page-by-page, extracts unicode text representations, detects 0-page corruptions, and prevents silent failure.
- **Fail-Safe**: If an image-only scanned document has no embedded digital text layer, the platform gracefully alerts:
  > *"Unable to extract text from this PDF. Please upload a text-based PDF resume."*

### Step 2: NLP Preprocessing & Technical Term Protection
Standard NLP tokenizers blindly strip punctuation like `+`, `#`, and `.`, inadvertently destroying essential developer skills (e.g., `C++` becomes `C`, `C#` becomes `C`, `.NET` becomes `NET`, and `Node.js` becomes `Node js`).

Our pipeline employs a **Safe Preprocessing Filter**:
1. Identifies and isolates protected technical tokens (`C++`, `C#`, `.NET`, `Node.js`, `React.js`, `CI/CD`) using placeholder substitution.
2. Converts general text to lowercase.
3. Removes non-alphanumeric noise and excess whitespace.
4. Restores protected technical tokens.
5. Filters non-domain English stopwords without filtering single-letter skills like `C` or `R`.

### Step 3: Controlled Skill Dictionary & Alias Normalization
- **Taxonomy Categories**:
  - *Programming Languages*: Python, Java, C++, C#, JavaScript, TypeScript, Go, etc.
  - *Web Development*: React, Angular, Vue, Node.js, Spring Boot, FastAPI, Django, etc.
  - *Databases*: MySQL, PostgreSQL, MongoDB, Redis, Oracle, SQL, etc.
  - *AI & Machine Learning*: Machine Learning, Deep Learning, NLP, PyTorch, TensorFlow, Scikit-learn, Pandas, NumPy, etc.
  - *Cloud & DevOps*: AWS, Azure, Google Cloud, Docker, Kubernetes, CI/CD, Linux, etc.
  - *Tools*: Git, GitHub, Jira, Postman, etc.
- **Alias Resolution**:
  Maps common variations to canonical identifiers:
  - `"scikit learn"` / `"sklearn"` $\rightarrow$ **Scikit-learn**
  - `"react js"` / `"reactjs"` $\rightarrow$ **React**
  - `"python programming"` $\rightarrow$ **Python**
  - `"node js"` / `"nodejs"` $\rightarrow$ **Node.js**
  - `"golang"` $\rightarrow$ **Go**

### Step 4: TF-IDF (Term Frequency – Inverse Document Frequency)
TF-IDF calculates the relative statistical importance of terms inside a document relative to the corpus:

$$
\text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t', d}}
$$

$$
\text{IDF}(t, D) = \ln\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1
$$

$$
\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)
$$

The vectors are $L_2$-normalized such that:
$$
\|\mathbf{v}\|_2 = \sqrt{\sum_{i} v_i^2} = 1
$$

In our pipeline:
- `TfidfVectorizer` is configured with `ngram_range=(1, 2)` (capturing both single words and bigrams like `"machine learning"`, `"spring boot"`, `"fast api"`).
- `token_pattern=r"(?u)\b[\w\+\#\.\-]+\b"` preserves dots, pluses, and hashes.

### Step 5: Cosine Similarity Computation
Cosine similarity evaluates the angular alignment between the resume vector $\mathbf{u}$ and the job vector $\mathbf{v}$ in multidimensional term space:

$$
\text{Cosine Similarity}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2} = \frac{\sum_{i=1}^{n} u_i v_i}{\sqrt{\sum_{i=1}^{n} u_i^2} \sqrt{\sum_{i=1}^{n} v_i^2}}
$$

Because both vectors are $L_2$-normalized, this simplifies to the dot product:
$$
\text{Cosine Similarity}(\mathbf{u}, \mathbf{v}) = \mathbf{u} \cdot \mathbf{v}
$$

The resulting scalar $\in [0, 1]$ is scaled to a readable percentage:
$$
\text{Job Match Score} = \text{round}(\text{Cosine Similarity} \times 100, 2)
$$

### Step 6: Explicit Skill Matching & Gap Analysis
While TF-IDF captures overall textual and semantic vocabulary distribution, explicit skills must be compared deterministically:

1. **Matched Skills**: $S_{\text{resume}} \cap S_{\text{required}}$
2. **Missing Skills (Skill Gap)**: $S_{\text{required}} \setminus S_{\text{resume}}$
3. **Additional Skills**: $S_{\text{resume}} \setminus S_{\text{required}}$

Skill match percentage is calculated as:
$$
\text{Skill Match Percentage} = \frac{|S_{\text{matched}}|}{|S_{\text{required}}|} \times 100\%
$$

### Step 7: Generic Learning Recommendations
For every identified missing skill, the platform queries a curated catalog of structured learning topics (e.g., missing *Scikit-learn* triggers recommendations on *Model Training, Pipelines, and Evaluation Metrics* with links to official documentation).

---

## 3. Important Limitation & Ethical Transparency

> [!IMPORTANT]
> **Application Metric vs Hiring Decision**:
> The "Job Match Score" and "Skill Match Percentage" are automated, descriptive textual metrics reflecting vocabulary overlap and technical dictionary matches.
>
> - **They do NOT represent a candidate's probability of getting hired.**
> - **They do NOT evaluate problem-solving ability, character, work ethic, or cultural fit.**
> - **They are not an automated hiring filter or replacement for human recruiter judgment.**
