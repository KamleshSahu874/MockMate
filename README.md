# 💜 MockMate — AI Interview Preparation Platform

MockMate is an AI-powered interview preparation platform designed to help users practice interviews, improve their confidence, and prepare for technical and behavioral interviews.

## ✨ Features

* 🔐 **User Authentication** — Secure registration and login using Supabase.
* 🤖 **Mock Interviews** — Practice interview questions and improve your responses.
* 💻 **Role-Based Practice** — Prepare for interviews based on different job roles.
* 📊 **Interview History** — Review previous practice sessions.
* 🎨 **Modern UI** — Responsive interface with a dark theme and vibrant purple-pink accents.
* 🚀 **Interactive Experience** — Simple navigation between the homepage, interview practice, and history pages.

## 🛠️ Tech Stack

* **Frontend:** Next.js, React, TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Authentication:** Supabase
* **Language:** TypeScript

## 📁 Project Structure

```text
frontend/
├── app/
│   ├── login/
│   ├── register/
│   ├── interview/
│   ├── history/
│   ├── icon.png
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
│   └── supabase/
│       └── client.ts
├── public/
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/KamleshSahu874/MockMate.git
cd MockMate/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a project at [Supabase](https://supabase.com/) and obtain your project URL and publishable key.

Create a `.env.local` file inside the `frontend` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the key supported by your Supabase configuration. Never expose a Supabase service-role key in frontend code.

### 4. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 🔑 Application Flow

1. Log in to your MockMate account.
2. Register if you are a new user.
3. Explore the homepage and available interview features.
4. Select **Get Started** to begin interview practice.
5. Review previous sessions in interview history.
6. Log out securely when finished.

## 🎯 Project Goal

MockMate aims to make interview preparation more accessible through an intuitive interface and structured practice experience, helping candidates build confidence before real interviews.

## 🔮 Future Enhancements

* AI-generated interview questions and feedback
* Voice-based interview practice
* Performance analysis and progress tracking
* Additional technical and behavioral interview categories
* Personalized preparation recommendations

## 👨‍💻 Author

**Kamlesh Kumar Sahu**

* **GitHub:** [KamleshSahu874](https://github.com/KamleshSahu874)
* **Repository:** [MockMate](https://github.com/KamleshSahu874/MockMate)

---

⭐ If you find MockMate useful, consider giving the repository a star!
