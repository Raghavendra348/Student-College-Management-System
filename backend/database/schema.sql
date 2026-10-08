PRAGMA foreign_keys = ON;

-- =====================================
-- COLLEGE ADMINISTRATORS
-- =====================================

CREATE TABLE IF NOT EXISTS users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    collegeName TEXT NOT NULL,

    email TEXT NOT NULL UNIQUE,

    principalName TEXT NOT NULL,

    password TEXT NOT NULL,

    role TEXT NOT NULL DEFAULT 'admin'
        CHECK (role IN ('admin', 'student')),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =====================================
-- STUDENTS
-- =====================================

CREATE TABLE IF NOT EXISTS students (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    studentId TEXT NOT NULL UNIQUE,

    fullName TEXT NOT NULL,

    email TEXT NOT NULL UNIQUE,

    phone TEXT NOT NULL,

    gender TEXT NOT NULL
        CHECK (gender IN ('Male', 'Female', 'Other')),

    dateOfBirth TEXT NOT NULL,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =====================================
-- ACADEMIC RECORDS
-- =====================================

CREATE TABLE IF NOT EXISTS academic_records (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    studentId INTEGER NOT NULL,

    year INTEGER NOT NULL
        CHECK (year BETWEEN 1 AND 4),

    semester INTEGER NOT NULL
        CHECK (semester BETWEEN 1 AND 8),

    academicYear TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'Current'
        CHECK (
            status IN (
                'Upcoming',
                'Current',
                'Completed'
            )
        ),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (studentId)
        REFERENCES students(id)
        ON DELETE CASCADE,

    UNIQUE(studentId, semester)
);


-- =====================================
-- ATTENDANCE
-- =====================================

CREATE TABLE IF NOT EXISTS attendance (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    studentId INTEGER NOT NULL,

    subject TEXT NOT NULL,

    totalClasses INTEGER NOT NULL
        CHECK (totalClasses >= 0),

    attendedClasses INTEGER NOT NULL
        CHECK (
            attendedClasses >= 0
            AND attendedClasses <= totalClasses
        ),

    attendancePercentage REAL DEFAULT 0,

    semester INTEGER NOT NULL
        CHECK (semester BETWEEN 1 AND 8),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (studentId)
        REFERENCES students(id)
        ON DELETE CASCADE
);


-- =====================================
-- MARKS
-- =====================================

CREATE TABLE IF NOT EXISTS marks (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    studentId INTEGER NOT NULL,

    semester INTEGER NOT NULL
        CHECK (semester BETWEEN 1 AND 8),

    subject TEXT NOT NULL,

    internalMarks INTEGER NOT NULL
        CHECK (
            internalMarks >= 0
            AND internalMarks <= 40
        ),

    externalMarks INTEGER NOT NULL
        CHECK (
            externalMarks >= 0
            AND externalMarks <= 60
        ),

    totalMarks INTEGER NOT NULL,

    grade TEXT NOT NULL,

    status TEXT NOT NULL
        CHECK (status IN ('Pass', 'Fail')),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (studentId)
        REFERENCES students(id)
        ON DELETE CASCADE,

    UNIQUE(studentId, semester, subject)
);


-- =====================================
-- BACKLOGS
-- =====================================

CREATE TABLE IF NOT EXISTS backlogs (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    studentId INTEGER NOT NULL,

    markId INTEGER,

    subject TEXT NOT NULL,

    semester INTEGER NOT NULL,

    academicYear TEXT,

    status TEXT NOT NULL DEFAULT 'Pending'
        CHECK (
            status IN ('Pending', 'Cleared')
        ),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (studentId)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (markId)
        REFERENCES marks(id)
        ON DELETE CASCADE
);


-- =====================================
-- INDEXES
-- =====================================

CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_students_studentId
ON students(studentId);

CREATE INDEX IF NOT EXISTS idx_students_email
ON students(email);

CREATE INDEX IF NOT EXISTS idx_academic_student
ON academic_records(studentId);

CREATE INDEX IF NOT EXISTS idx_attendance_student
ON attendance(studentId);

CREATE INDEX IF NOT EXISTS idx_marks_student
ON marks(studentId);

CREATE INDEX IF NOT EXISTS idx_backlogs_student
ON backlogs(studentId);


-- =====================================
-- UPDATED TIMESTAMP TRIGGERS
-- =====================================

CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN

    UPDATE users
    SET updatedAt = CURRENT_TIMESTAMP
    WHERE id = OLD.id;

END;


CREATE TRIGGER IF NOT EXISTS update_students_timestamp
AFTER UPDATE ON students
FOR EACH ROW
BEGIN

    UPDATE students
    SET updatedAt = CURRENT_TIMESTAMP
    WHERE id = OLD.id;

END;


CREATE TRIGGER IF NOT EXISTS update_academic_timestamp
AFTER UPDATE ON academic_records
FOR EACH ROW
BEGIN

    UPDATE academic_records
    SET updatedAt = CURRENT_TIMESTAMP
    WHERE id = OLD.id;

END;


CREATE TRIGGER IF NOT EXISTS update_attendance_timestamp
AFTER UPDATE ON attendance
FOR EACH ROW
BEGIN

    UPDATE attendance
    SET updatedAt = CURRENT_TIMESTAMP
    WHERE id = OLD.id;

END;


CREATE TRIGGER IF NOT EXISTS update_marks_timestamp
AFTER UPDATE ON marks
FOR EACH ROW
BEGIN

    UPDATE marks
    SET updatedAt = CURRENT_TIMESTAMP
    WHERE id = OLD.id;

END;