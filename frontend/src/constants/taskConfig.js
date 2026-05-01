export const COLORS = {
  sidebarBg:   "#1A2610",
  mainBg:      "#F5F0E4",
  card:        "#FDFAF3",
  olive:       "#5C7A28",
  oliveHover:  "#4A6320",
  sage:        "#7A9A48",
  amber:       "#B87820",
  textDark:    "#1A2610",
  textMid:     "#4A5640",
  textMuted:   "#8A9480",
  border:      "#E2DECE",
  borderSoft:  "#EDE8D8",
};

export const PRIORITY_META = {
  high: {
    label: "High",
    bg:    "#F5E0D8",
    txt:   "#7A2810",
    dot:   "#C84020",
  },
  medium: {
    label: "Medium",
    bg:    "#F5E6C8",
    txt:   "#8A5210",
    dot:   "#B87820",
  },
  low: {
    label: "Low",
    bg:    "#E8F0DC",
    txt:   "#3A5A18",
    dot:   "#7A9A48",
  },
};

export const STATUS_META = {
  todo: {
    label: "To Do",
    bg:    "#EDE8D8",
    txt:   "#4A5640",
  },
  in_progress: {
    label: "In Progress",
    bg:    "#E8F0DC",
    txt:   "#3A5A18",
  },
  done: {
    label: "Done",
    bg:    "#D8E8C8",
    txt:   "#2A4A10",
  },
};

export const CATEGORIES = [
  "Frontend",
  "Backend",
  "AI",
  "Design",
  "Docs",
  "Research",
  "Other",
];

export const SEED_TASKS = [
  {
    id: 1,
    title: "Design FocusFlow wireframes",
    description: "Create low-fi wireframes for all major pages",
    priority: "high",
    status: "done",
    due: "2025-06-10",
    category: "Design",
  },
  {
    id: 2,
    title: "Build FastAPI authentication",
    description: "JWT login/register with bcrypt hashing",
    priority: "high",
    status: "done",
    due: "2025-06-12",
    category: "Backend",
  },
  {
    id: 3,
    title: "Tasks page React UI",
    description: "CRUD interface with filters and priority tags",
    priority: "high",
    status: "in_progress",
    due: "2025-06-14",
    category: "Frontend",
  },
  {
    id: 4,
    title: "Pomodoro Timer component",
    description: "25/5 timer with session tracking to DB",
    priority: "medium",
    status: "todo",
    due: "2025-06-16",
    category: "Frontend",
  },
  {
    id: 5,
    title: "AI Planner integration",
    description: "OpenAI GPT-4o daily plan generator endpoint",
    priority: "medium",
    status: "todo",
    due: "2025-06-18",
    category: "AI",
  },
];