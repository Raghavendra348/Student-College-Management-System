// Standard branch-wise semester curriculum data
export const BRANCH_CURRICULUM = {
  // Computer Science & Engineering
  "computer science": {
    codePrefix: "CS",
    semesters: {
      1: ["Mathematics I", "Engineering Physics", "Basic Electrical Engineering", "Engineering Graphics", "Programming in C"],
      2: ["Mathematics II", "Engineering Chemistry", "Data Structures", "Digital Logic Design", "Python Programming"],
      3: ["Discrete Mathematics", "Database Management Systems", "Object Oriented Programming (Java)", "Computer Organization & Architecture", "Operating Systems"],
      4: ["Design & Analysis of Algorithms", "Computer Networks", "Software Engineering", "Web Technologies", "Theory of Computation"],
      5: ["Compiler Design", "Machine Learning", "Cloud Computing", "Cryptography & Network Security", "Artificial Intelligence"],
      6: ["Mobile Application Development", "Big Data Analytics", "Full Stack Development", "DevOps & CI/CD", "Internet of Things"],
      7: ["Cyber Security & Forensics", "Deep Learning", "Distributed Systems", "Natural Language Processing", "Project Phase I"],
      8: ["Major Capstone Project", "Comprehensive Viva", "Industrial Internship", "Cloud Architecture & Security"],
    },
  },

  // Information Technology
  "information technology": {
    codePrefix: "IT",
    semesters: {
      1: ["Engineering Mathematics I", "Applied Physics", "Basic Electrical & Electronics", "Engineering Drawing", "C Programming"],
      2: ["Engineering Mathematics II", "Environmental Science", "Data Structures & Algorithms", "Digital System Design", "Python Programming"],
      3: ["Mathematical Foundations of IT", "Database Management Systems", "Operating Systems", "Java Programming", "Data Communication"],
      4: ["Computer Networks", "Web Technologies", "Design & Analysis of Algorithms", "Software Engineering", "Information Theory"],
      5: ["Information Security", "Cloud Computing", "Full Stack Web Development", "Machine Learning", "Mobile App Development"],
      6: ["Data Mining & Warehousing", "Internet of Things", "DevOps Practices", "Big Data Technologies", "Distributed Computing"],
      7: ["Cyber Forensics", "Artificial Intelligence", "Blockchain Technology", "Enterprise Application Dev", "Project Phase I"],
      8: ["Major Capstone Project", "Industrial Training", "Technical Seminar", "Enterprise Architecture"],
    },
  },

  // Electronics & Communication Engineering
  "electronics": {
    codePrefix: "EC",
    semesters: {
      1: ["Mathematics I", "Engineering Physics", "Basic Electrical Engineering", "Engineering Workshop", "Problem Solving using C"],
      2: ["Mathematics II", "Engineering Chemistry", "Electronic Devices & Circuits", "Network Analysis", "Data Structures"],
      3: ["Signals & Systems", "Analog Circuits", "Digital Electronics", "Electromagnetic Waves & Transmission Lines", "Object Oriented Programming"],
      4: ["Analog Communication", "Microprocessors & Microcontrollers", "Linear Integrated Circuits", "Control Systems", "Signals & Systems Lab"],
      5: ["Digital Communication", "Digital Signal Processing", "VLSI Design", "Antenna & Wave Propagation", "Microcontroller Lab"],
      6: ["Embedded Systems", "Microwave Engineering", "Wireless Cellular Communication", "Optical Communication", "VLSI Lab"],
      7: ["Satellite Communication", "Internet of Things & Sensors", "Radar Systems", "Neural Networks", "Project Phase I"],
      8: ["Major Capstone Project", "Technical Viva", "Industrial Internship", "Advanced Telecom Networks"],
    },
  },

  // Electrical Engineering
  "electrical": {
    codePrefix: "EE",
    semesters: {
      1: ["Mathematics I", "Engineering Physics", "Problem Solving using C", "Basic Mechanical Engineering", "Engineering Graphics"],
      2: ["Mathematics II", "Chemistry", "Circuit Theory", "Electronic Devices & Circuits", "Python Programming"],
      3: ["Electrical Machines I", "Electromagnetic Fields", "Analog Electronics", "Network Analysis", "Electrical Measurements & Instrumentation"],
      4: ["Electrical Machines II", "Power Systems I", "Digital Electronics", "Control Systems", "Linear ICs"],
      5: ["Power Electronics", "Power Systems II", "Microprocessors & Interfacing", "Signals & Systems", "Renewable Energy Sources"],
      6: ["Power System Protection", "Electric Drives & Control", "High Voltage Engineering", "Embedded Systems", "Power Electronics Lab"],
      7: ["Smart Grids & Microgrids", "Utilization of Electrical Energy", "Electric Vehicles Technology", "Project Phase I"],
      8: ["Major Project", "Comprehensive Technical Viva", "Industrial Internship", "Power System Operations"],
    },
  },

  // Mechanical Engineering
  "mechanical": {
    codePrefix: "ME",
    semesters: {
      1: ["Mathematics I", "Engineering Physics", "Basic Electrical & Electronics", "Engineering Graphics", "Engineering Workshop"],
      2: ["Mathematics II", "Engineering Chemistry", "Engineering Mechanics", "Manufacturing Processes I", "Programming in Python"],
      3: ["Thermodynamics", "Strength of Materials", "Fluid Mechanics & Hydraulic Machinery", "Material Science & Metallurgy", "Machine Drawing"],
      4: ["Applied Thermodynamics", "Manufacturing Processes II", "Kinematics of Machinery", "Heat Transfer", "Fluid Mechanics Lab"],
      5: ["Dynamics of Machinery", "Design of Machine Elements I", "Turbo Machinery", "Metrology & Measurements", "Thermal Engineering Lab"],
      6: ["Design of Machine Elements II", "CAD/CAM", "Automobile Engineering", "Operations Research", "Finite Element Analysis"],
      7: ["Robotics & Automation", "Mechatronics", "Refrigeration & Air Conditioning", "Production Management", "Project Phase I"],
      8: ["Major Project", "Technical Seminar", "Industrial Internship", "Non-Destructive Testing"],
    },
  },

  // Civil Engineering
  "civil": {
    codePrefix: "CE",
    semesters: {
      1: ["Mathematics I", "Engineering Physics", "Basic Electrical Engineering", "Engineering Drawing", "Computer Programming"],
      2: ["Mathematics II", "Engineering Chemistry", "Engineering Mechanics", "Building Materials & Construction", "Surveying I"],
      3: ["Strength of Materials I", "Fluid Mechanics", "Surveying II", "Building Planning & Drawing", "Geology for Engineers"],
      4: ["Strength of Materials II", "Hydraulics & Hydraulic Machinery", "Structural Analysis I", "Concrete Technology", "Soil Mechanics"],
      5: ["Structural Analysis II", "Design of RC Structures", "Geotechnical Engineering", "Transportation Engineering I", "Water Resources Engineering"],
      6: ["Design of Steel Structures", "Environmental Engineering I", "Transportation Engineering II", "Estimation & Costing", "Foundation Engineering"],
      7: ["Environmental Engineering II", "Earthquake Resistant Design", "Construction Management", "Remote Sensing & GIS", "Project Phase I"],
      8: ["Major Project", "Comprehensive Viva", "Industrial Training", "Urban Planning"],
    },
  },

  // Data Science & AI
  "data science": {
    codePrefix: "DS",
    semesters: {
      1: ["Mathematics for AI (Linear Algebra)", "Engineering Physics", "Problem Solving with Python", "Basic Electrical Engineering", "Engineering Graphics"],
      2: ["Probability & Statistics", "Data Structures & Algorithms in Python", "Discrete Mathematics", "Digital Logic Design", "R Programming"],
      3: ["Database Systems & SQL", "Object Oriented Programming with Java", "Foundations of Data Science", "Computer Organization", "Operating Systems"],
      4: ["Design & Analysis of Algorithms", "Machine Learning Foundations", "Data Wrangling & Visualization", "Computer Networks", "Software Engineering"],
      5: ["Deep Learning & Neural Networks", "Big Data Engineering (Hadoop/Spark)", "Artificial Intelligence & Expert Systems", "Cloud Data Engineering", "Data Ethics"],
      6: ["Natural Language Processing", "Computer Vision", "Reinforcement Learning", "MLOps & Model Deployment", "Time Series Analysis"],
      7: ["Generative AI & LLMs", "AI Ethics & Governance", "Data Mining & Business Intelligence", "High Performance Computing", "Project Phase I"],
      8: ["Major AI Capstone Project", "Comprehensive Technical Viva", "Industry Internship", "Advanced AI Research Seminar"],
    },
  },
};

/**
 * Get branch curriculum key from department string
 */
export const getBranchKey = (department = "") => {
  const dept = String(department).toLowerCase();
  if (dept.includes("data science") || dept.includes("ai")) return "data science";
  if (dept.includes("info") || dept.includes("it")) return "information technology";
  if (dept.includes("electronic") || dept.includes("ece") || dept.includes("communication")) return "electronics";
  if (dept.includes("electri") || dept.includes("eee")) return "electrical";
  if (dept.includes("mech")) return "mechanical";
  if (dept.includes("civil")) return "civil";
  return "computer science";
};

/**
 * Get subjects array for a given department and semester
 */
export const getBranchSemesterSubjects = (department = "", semester = 1) => {
  const branchKey = getBranchKey(department);
  const branch = BRANCH_CURRICULUM[branchKey] || BRANCH_CURRICULUM["computer science"];
  const semNum = Number(semester) || 1;
  const subjectsList = branch.semesters[semNum] || branch.semesters[1] || [];

  return subjectsList.map((name, index) => ({
    _id: `${branchKey}_sem${semNum}_sub${index + 1}`,
    subjectCode: `${branch.codePrefix}${semNum}0${index + 1}`,
    subjectName: name,
    department: department || "Computer Science",
    semester: semNum,
    credits: 3,
    maxMarks: 100,
  }));
};
